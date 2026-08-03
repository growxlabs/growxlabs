BEGIN;
CREATE TABLE IF NOT EXISTS public.business_document_counters (
  document_type TEXT NOT NULL,
  document_year INTEGER NOT NULL,
  last_number BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (document_type, document_year)
);
ALTER TABLE public.client_assessments ADD COLUMN IF NOT EXISTS assessment_number TEXT;
CREATE OR REPLACE FUNCTION public.generate_business_document_number(p_document_type TEXT,p_prefix TEXT,p_document_date TIMESTAMPTZ DEFAULT now()) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE v_year INTEGER; v_next BIGINT; BEGIN v_year:=EXTRACT(YEAR FROM p_document_date)::INTEGER; INSERT INTO public.business_document_counters(document_type,document_year,last_number) VALUES(p_document_type,v_year,1) ON CONFLICT(document_type,document_year) DO UPDATE SET last_number=business_document_counters.last_number+1,updated_at=now() RETURNING last_number INTO v_next; RETURN format('%s-%s-%s',p_prefix,v_year,lpad(v_next::TEXT,6,'0')); END $$;
CREATE OR REPLACE FUNCTION public.assign_client_assessment_number() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NEW.assessment_number IS NULL OR btrim(NEW.assessment_number)='' THEN NEW.assessment_number:=public.generate_business_document_number('assessment','GXL-ASM',COALESCE(NEW.created_at,now())); END IF; RETURN NEW; END $$;
DROP TRIGGER IF EXISTS trg_assign_client_assessment_number ON public.client_assessments;
CREATE TRIGGER trg_assign_client_assessment_number BEFORE INSERT ON public.client_assessments FOR EACH ROW EXECUTE FUNCTION public.assign_client_assessment_number();
DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT id,created_at FROM public.client_assessments WHERE assessment_number IS NULL ORDER BY created_at,id LOOP UPDATE public.client_assessments SET assessment_number=public.generate_business_document_number('assessment','GXL-ASM',COALESCE(r.created_at,now())) WHERE id=r.id AND assessment_number IS NULL; END LOOP; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS client_assessments_assessment_number_uq ON public.client_assessments(assessment_number) WHERE assessment_number IS NOT NULL;
COMMIT;
