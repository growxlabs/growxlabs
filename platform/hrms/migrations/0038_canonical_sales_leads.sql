BEGIN;

-- Phase 7 keeps public.leads as the only writable lead source of truth.
-- crm_leads remains untouched for rollback and is retired after validation.
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS contact_title text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source_tool text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS custom_fields jsonb NOT NULL DEFAULT '{}';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS created_by_employee_id uuid REFERENCES people.employees(id);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS legacy_crm_lead_id uuid;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS normalized_email text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS normalized_phone text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS normalized_domain text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS dedupe_review_required boolean NOT NULL DEFAULT false;

ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS employee_id uuid REFERENCES people.employees(id);
CREATE UNIQUE INDEX IF NOT EXISTS team_members_employee_uq ON public.team_members(employee_id) WHERE employee_id IS NOT NULL;
UPDATE public.team_members tm SET employee_id=ei.employee_id FROM identity.employee_identities ei
JOIN people.employees e ON e.id=ei.employee_id AND e.deleted_at IS NULL
WHERE tm.employee_id IS NULL AND lower(btrim(tm.email))=lower(btrim(ei.email::text))
  AND (SELECT count(*) FROM identity.employee_identities x WHERE lower(btrim(x.email::text))=lower(btrim(tm.email)))=1;

UPDATE public.leads SET
  contact_name=COALESCE(contact_name,name),
  source=COALESCE(source,lower(replace(COALESCE(source_label,'other'),' ','_'))),
  normalized_email=NULLIF(lower(btrim(email)),''),
  normalized_phone=NULLIF(regexp_replace(COALESCE(phone,''),'[^0-9]','','g'),''),
  normalized_domain=NULLIF(lower(regexp_replace(regexp_replace(COALESCE(website_url,''),'^https?://(www\.)?','','i'),'/.*$','','g')),'')
WHERE contact_name IS NULL OR source IS NULL OR normalized_email IS NULL OR normalized_phone IS NULL OR normalized_domain IS NULL;

CREATE TABLE IF NOT EXISTS public.crm_lead_migration_map (
  crm_lead_id uuid PRIMARY KEY REFERENCES public.crm_leads(id),
  canonical_lead_id uuid REFERENCES public.leads(id),
  organisation_id text NOT NULL,
  outcome text NOT NULL CHECK(outcome IN ('created','linked','ambiguous','failed')),
  reason text,
  migrated_at timestamptz NOT NULL DEFAULT now()
);

-- Backfill is conservative: exact tenant-aware email/phone matches link; uncertain
-- company/locality matches are flagged for review rather than merged.
CREATE OR REPLACE FUNCTION public.migrate_crm_leads_to_canonical(p_organisation_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.crm_leads%ROWTYPE; v_id uuid; v_matches integer; v_created integer:=0; v_linked integer:=0; v_ambiguous integer:=0; v_failed integer:=0;
BEGIN
  IF NULLIF(btrim(p_organisation_id),'') IS NULL THEN RAISE EXCEPTION 'Organisation is required'; END IF;
  FOR r IN SELECT * FROM public.crm_leads c WHERE NOT EXISTS (SELECT 1 FROM public.crm_lead_migration_map m WHERE m.crm_lead_id=c.id) LOOP
    BEGIN
      v_id:=NULL; v_matches:=0;
      SELECT count(*),(array_agg(id))[1] INTO v_matches,v_id FROM public.leads l
      WHERE l.organisation_id=p_organisation_id AND l.deleted_at IS NULL AND
        ((NULLIF(lower(btrim(r.email)),'') IS NOT NULL AND l.normalized_email=lower(btrim(r.email))) OR
         (NULLIF(regexp_replace(COALESCE(r.phone,''),'[^0-9]','','g'),'') IS NOT NULL AND l.normalized_phone=regexp_replace(r.phone,'[^0-9]','','g')));
      IF v_matches=1 THEN
        UPDATE public.leads SET legacy_crm_lead_id=COALESCE(legacy_crm_lead_id,r.id),custom_fields=COALESCE(custom_fields,'{}')||COALESCE(r.custom_fields,'{}'),updated_at=now() WHERE id=v_id;
        INSERT INTO public.crm_lead_migration_map VALUES(r.id,v_id,p_organisation_id,'linked','exact identity match',now()); v_linked:=v_linked+1;
      ELSIF v_matches>1 OR EXISTS(SELECT 1 FROM public.leads l WHERE l.organisation_id=p_organisation_id AND lower(btrim(l.business_name))=lower(btrim(r.business_name)) AND lower(COALESCE(l.city,''))=lower(COALESCE(r.city,''))) THEN
        INSERT INTO public.crm_lead_migration_map VALUES(r.id,NULL,p_organisation_id,'ambiguous','company/locality or multiple identity matches require review',now()); v_ambiguous:=v_ambiguous+1;
      ELSE
        INSERT INTO public.leads(organisation_id,business_name,name,contact_name,email,phone,city,state,website_url,linkedin_url,instagram_url,source,source_label,source_tool,source_url,priority,status,notes,custom_fields,legacy_crm_lead_id,normalized_email,normalized_phone,created_by,created_at,updated_at)
        VALUES(p_organisation_id,r.business_name,r.contact_name,r.contact_name,r.email,r.phone,r.city,r.state,r.website_url,r.linkedin_url,r.instagram_url,
          CASE lower(COALESCE(r.source,'')) WHEN 'apify' THEN 'apify' WHEN 'instagram' THEN 'instagram' WHEN 'csv' THEN 'import' ELSE 'manual_admin' END,
          r.source,r.source_tool,r.source_url,
          CASE lower(COALESCE(r.priority,'medium')) WHEN 'hot' THEN 'high' WHEN 'warm' THEN 'medium' WHEN 'cold' THEN 'low' ELSE COALESCE(r.priority,'medium') END,
          CASE lower(COALESCE(r.status,'new')) WHEN 'interested' THEN 'engaged' WHEN 'proposal_sent' THEN 'qualified' WHEN 'won' THEN 'qualified' WHEN 'lost' THEN 'disqualified' ELSE lower(COALESCE(r.status,'new')) END,
          r.notes,COALESCE(r.custom_fields,'{}'),r.id,NULLIF(lower(btrim(r.email)),''),NULLIF(regexp_replace(COALESCE(r.phone,''),'[^0-9]','','g'),''),r.created_by,r.created_at,COALESCE(r.updated_at,now())) RETURNING id INTO v_id;
        INSERT INTO public.crm_lead_migration_map VALUES(r.id,v_id,p_organisation_id,'created',NULL,now()); v_created:=v_created+1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO public.crm_lead_migration_map VALUES(r.id,NULL,p_organisation_id,'failed',SQLERRM,now()) ON CONFLICT(crm_lead_id) DO UPDATE SET outcome='failed',reason=EXCLUDED.reason,migrated_at=now(); v_failed:=v_failed+1;
    END;
  END LOOP;
  RETURN jsonb_build_object('source_rows',(SELECT count(*) FROM public.crm_leads),'created',v_created,'linked',v_linked,'ambiguous',v_ambiguous,'failed',v_failed);
END $$;

CREATE INDEX IF NOT EXISTS leads_org_status_created_idx ON public.leads(organisation_id,status,created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS leads_org_source_created_idx ON public.leads(organisation_id,source,created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS leads_org_email_idx ON public.leads(organisation_id,normalized_email) WHERE normalized_email IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS leads_org_phone_idx ON public.leads(organisation_id,normalized_phone) WHERE normalized_phone IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS leads_org_domain_idx ON public.leads(organisation_id,normalized_domain) WHERE normalized_domain IS NOT NULL AND deleted_at IS NULL;
WITH ranked AS (SELECT id,row_number() OVER(PARTITION BY lead_id ORDER BY assigned_at DESC,id DESC) AS rn FROM public.lead_assignment_history WHERE ended_at IS NULL)
UPDATE public.lead_assignment_history h SET ended_at=now() FROM ranked r WHERE h.id=r.id AND r.rn>1;
CREATE UNIQUE INDEX IF NOT EXISTS lead_assignment_one_active_uq ON public.lead_assignment_history(lead_id) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS lead_assignment_employee_active_idx ON public.lead_assignment_history(organisation_id,assigned_employee_id,assigned_at DESC) WHERE ended_at IS NULL;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS employee_assigned_leads ON public.leads;
CREATE POLICY employee_assigned_leads ON public.leads FOR SELECT TO authenticated USING (
  organisation_id=(auth.jwt()->>'organisation_id') AND assigned_employee_id=(auth.jwt()->>'employee_id')::uuid AND deleted_at IS NULL
);
DROP POLICY IF EXISTS service_role_canonical_leads ON public.leads;
CREATE POLICY service_role_canonical_leads ON public.leads FOR ALL TO service_role USING(true) WITH CHECK(true);

CREATE OR REPLACE FUNCTION public.require_lead_organisation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN IF NULLIF(btrim(NEW.organisation_id),'') IS NULL THEN RAISE EXCEPTION 'organisation_id is required for canonical leads'; END IF; RETURN NEW; END $$;
DROP TRIGGER IF EXISTS leads_require_organisation ON public.leads;
CREATE TRIGGER leads_require_organisation BEFORE INSERT OR UPDATE OF organisation_id ON public.leads FOR EACH ROW EXECUTE FUNCTION public.require_lead_organisation();

DROP POLICY IF EXISTS employee_assignment_history_read ON public.lead_assignment_history;
CREATE POLICY employee_assignment_history_read ON public.lead_assignment_history FOR SELECT TO authenticated USING (organisation_id=(auth.jwt()->>'organisation_id') AND assigned_employee_id=NULLIF(auth.jwt()->>'employee_id','')::uuid);
DROP POLICY IF EXISTS employee_qualifications_assigned ON public.lead_qualifications;
CREATE POLICY employee_qualifications_assigned ON public.lead_qualifications FOR ALL TO authenticated USING (organisation_id=(auth.jwt()->>'organisation_id') AND employee_id=NULLIF(auth.jwt()->>'employee_id','')::uuid AND EXISTS(SELECT 1 FROM public.leads l WHERE l.id=lead_qualifications.lead_id AND l.assigned_employee_id=lead_qualifications.employee_id AND l.organisation_id=lead_qualifications.organisation_id)) WITH CHECK (organisation_id=(auth.jwt()->>'organisation_id') AND employee_id=NULLIF(auth.jwt()->>'employee_id','')::uuid);
DROP POLICY IF EXISTS employee_sales_activities_assigned ON public.sales_activities;
CREATE POLICY employee_sales_activities_assigned ON public.sales_activities FOR ALL TO authenticated USING (organisation_id=(auth.jwt()->>'organisation_id') AND employee_id=NULLIF(auth.jwt()->>'employee_id','')::uuid) WITH CHECK (organisation_id=(auth.jwt()->>'organisation_id') AND employee_id=NULLIF(auth.jwt()->>'employee_id','')::uuid AND EXISTS(SELECT 1 FROM public.leads l WHERE l.id=sales_activities.lead_id AND l.assigned_employee_id=sales_activities.employee_id AND l.organisation_id=sales_activities.organisation_id));
DROP POLICY IF EXISTS employee_sales_followups_assigned ON public.sales_followups;
CREATE POLICY employee_sales_followups_assigned ON public.sales_followups FOR ALL TO authenticated USING (organisation_id=(auth.jwt()->>'organisation_id') AND assigned_employee_id=NULLIF(auth.jwt()->>'employee_id','')::uuid) WITH CHECK (organisation_id=(auth.jwt()->>'organisation_id') AND assigned_employee_id=NULLIF(auth.jwt()->>'employee_id','')::uuid);
DROP POLICY IF EXISTS employee_sales_opportunities_assigned ON public.sales_opportunities;
CREATE POLICY employee_sales_opportunities_assigned ON public.sales_opportunities FOR ALL TO authenticated USING (organisation_id=(auth.jwt()->>'organisation_id') AND owner_employee_id=NULLIF(auth.jwt()->>'employee_id','')::uuid) WITH CHECK (organisation_id=(auth.jwt()->>'organisation_id') AND owner_employee_id=NULLIF(auth.jwt()->>'employee_id','')::uuid);
DROP POLICY IF EXISTS employee_sales_discovery_assigned ON public.sales_discovery_schedules;
CREATE POLICY employee_sales_discovery_assigned ON public.sales_discovery_schedules FOR ALL TO authenticated USING (organisation_id=(auth.jwt()->>'organisation_id') AND (scheduled_by_employee_id=NULLIF(auth.jwt()->>'employee_id','')::uuid OR NULLIF(auth.jwt()->>'employee_id','')::uuid=ANY(internal_employee_ids))) WITH CHECK (organisation_id=(auth.jwt()->>'organisation_id') AND scheduled_by_employee_id=NULLIF(auth.jwt()->>'employee_id','')::uuid);
DROP POLICY IF EXISTS employee_sales_handoffs_assigned ON public.sales_handoffs;
CREATE POLICY employee_sales_handoffs_assigned ON public.sales_handoffs FOR ALL TO authenticated USING (organisation_id=(auth.jwt()->>'organisation_id') AND handed_off_by_employee_id=NULLIF(auth.jwt()->>'employee_id','')::uuid) WITH CHECK (organisation_id=(auth.jwt()->>'organisation_id') AND handed_off_by_employee_id=NULLIF(auth.jwt()->>'employee_id','')::uuid);

DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['lead_assignment_history','lead_qualifications','sales_activities','sales_followups','sales_opportunities','sales_discovery_schedules','sales_handoffs'] LOOP EXECUTE format('DROP POLICY IF EXISTS service_role_phase7 ON public.%I',t);EXECUTE format('CREATE POLICY service_role_phase7 ON public.%I FOR ALL TO service_role USING(true) WITH CHECK(true)',t);END LOOP;END $$;

REVOKE ALL ON FUNCTION public.migrate_crm_leads_to_canonical(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.migrate_crm_leads_to_canonical(text) TO service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
