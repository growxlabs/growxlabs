BEGIN;
CREATE SCHEMA IF NOT EXISTS assets;

CREATE TABLE assets.categories(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,name text NOT NULL,
  description text,default_useful_life_months integer,requires_acceptance boolean NOT NULL DEFAULT true,
  status people.record_status NOT NULL DEFAULT 'active',created_by uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organisation_id,name)
);
CREATE TABLE assets.vendors(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,name text NOT NULL,
  contact_name text,email text,phone text,address jsonb NOT NULL DEFAULT '{}',tax_identifier text,
  status people.record_status NOT NULL DEFAULT 'active',created_by uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE assets.locations(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,name text NOT NULL,
  code text NOT NULL,address jsonb NOT NULL DEFAULT '{}',status people.record_status NOT NULL DEFAULT 'active',
  created_by uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(organisation_id,code)
);
CREATE TABLE assets.depreciation_rules(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,category_id uuid NOT NULL REFERENCES assets.categories(id),
  method text NOT NULL CHECK(method IN ('STRAIGHT_LINE','DECLINING_BALANCE','NONE')),useful_life_months integer,
  residual_value numeric(14,2) NOT NULL DEFAULT 0,rate numeric(8,4),effective_from date NOT NULL,
  created_by uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(category_id,effective_from)
);
CREATE TABLE assets.assets(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,category_id uuid NOT NULL REFERENCES assets.categories(id),
  asset_code text NOT NULL,name text NOT NULL,description text,manufacturer text,model text,serial_number text,
  barcode_value text,qr_payload jsonb NOT NULL DEFAULT '{}',state text NOT NULL DEFAULT 'PURCHASED'
    CHECK(state IN ('PURCHASED','AVAILABLE','ASSIGNED','IN_REPAIR','LOST','RETIRED','DISPOSED')),
  vendor_id uuid REFERENCES assets.vendors(id),location_id uuid REFERENCES assets.locations(id),purchase_date date,
  purchase_cost numeric(14,2),currency char(3),warranty_expires_at date,procurement_reference text,
  condition text NOT NULL DEFAULT 'NEW',metadata jsonb NOT NULL DEFAULT '{}',version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
  retired_at timestamptz,UNIQUE(organisation_id,asset_code),UNIQUE(organisation_id,serial_number)
);
CREATE INDEX assets_inventory_idx ON assets.assets(organisation_id,state,category_id,location_id);
CREATE TABLE assets.assignments(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,asset_id uuid NOT NULL REFERENCES assets.assets(id),
  employee_id uuid NOT NULL REFERENCES people.employees(id),assigned_by uuid NOT NULL,assigned_at timestamptz NOT NULL DEFAULT now(),
  due_back_at timestamptz,accepted_at timestamptz,acceptance_comment text,condition_out text NOT NULL,
  accessories jsonb NOT NULL DEFAULT '[]',status text NOT NULL DEFAULT 'PENDING_ACCEPTANCE'
    CHECK(status IN ('PENDING_ACCEPTANCE','ACTIVE','RETURN_REQUESTED','RETURNED','CANCELLED')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX assets_one_open_assignment ON assets.assignments(asset_id) WHERE status IN ('PENDING_ACCEPTANCE','ACTIVE','RETURN_REQUESTED');
CREATE TABLE assets.returns(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,assignment_id uuid NOT NULL REFERENCES assets.assignments(id),
  requested_at timestamptz NOT NULL DEFAULT now(),received_by uuid,received_at timestamptz,
  condition_in text,accessories_returned jsonb NOT NULL DEFAULT '[]',inspection_notes text,
  outcome text CHECK(outcome IN ('AVAILABLE','IN_REPAIR','LOST','RETIRED')),created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE assets.transfers(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,asset_id uuid NOT NULL REFERENCES assets.assets(id),
  from_location_id uuid REFERENCES assets.locations(id),to_location_id uuid NOT NULL REFERENCES assets.locations(id),
  requested_by uuid NOT NULL,transferred_by uuid,reason text NOT NULL,status text NOT NULL DEFAULT 'REQUESTED'
    CHECK(status IN ('REQUESTED','COMPLETED','CANCELLED')),requested_at timestamptz NOT NULL DEFAULT now(),completed_at timestamptz
);
CREATE TABLE assets.repairs(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,asset_id uuid NOT NULL REFERENCES assets.assets(id),
  vendor_id uuid REFERENCES assets.vendors(id),status text NOT NULL DEFAULT 'OPEN'
    CHECK(status IN ('OPEN','DIAGNOSING','IN_PROGRESS','COMPLETED','CANCELLED')),
  reported_at timestamptz NOT NULL DEFAULT now(),started_at timestamptz,completed_at timestamptz,cost numeric(14,2),
  currency char(3),warranty_claim boolean NOT NULL DEFAULT false,notes text,created_by uuid NOT NULL
);
CREATE TABLE assets.documents(
  organisation_id uuid NOT NULL,asset_id uuid NOT NULL REFERENCES assets.assets(id),
  document_id uuid NOT NULL REFERENCES documents.documents(id),kind text NOT NULL,created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(asset_id,document_id)
);
CREATE TABLE assets.requests(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,employee_id uuid NOT NULL REFERENCES people.employees(id),
  category_id uuid NOT NULL REFERENCES assets.categories(id),requested_specification jsonb NOT NULL DEFAULT '{}',
  reason text NOT NULL,status text NOT NULL DEFAULT 'PENDING_MANAGER'
    CHECK(status IN ('PENDING_MANAGER','PENDING_IT','APPROVED','REJECTED','FULFILLED','CANCELLED')),
  workflow_instance_id uuid REFERENCES workflow.instances(id),assigned_asset_id uuid REFERENCES assets.assets(id),
  requested_by uuid NOT NULL,manager_decided_by uuid,manager_decided_at timestamptz,it_decided_by uuid,it_decided_at timestamptz,
  decision_comment text,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE assets.history(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,asset_id uuid NOT NULL REFERENCES assets.assets(id),
  event_type text NOT NULL,from_state text,to_state text,actor_user_id uuid NOT NULL,payload jsonb NOT NULL DEFAULT '{}',
  request_id uuid NOT NULL,occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER assets_history_immutable BEFORE UPDATE OR DELETE ON assets.history FOR EACH ROW EXECUTE FUNCTION people.reject_immutable_change();
CREATE TABLE assets.outbox(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,topic text NOT NULL,payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),published_at timestamptz,attempts integer NOT NULL DEFAULT 0,last_error text
);
CREATE INDEX assets_outbox_pending_idx ON assets.outbox(created_at) WHERE published_at IS NULL;
CREATE TABLE assets.warranty_runs(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,run_date date NOT NULL,status text NOT NULL,
  processed integer NOT NULL DEFAULT 0,failed integer NOT NULL DEFAULT 0,created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,UNIQUE(organisation_id,run_date)
);
CREATE OR REPLACE FUNCTION assets.create_request(p_organisation_id uuid,p_actor_user_id uuid,p_employee_id uuid,p_category_id uuid,p_reason text,p_specification jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,assets,people,audit AS $$
DECLARE v_id uuid;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM people.employees WHERE id=p_employee_id AND organisation_id=p_organisation_id AND user_id=p_actor_user_id AND deleted_at IS NULL)THEN RAISE EXCEPTION 'employee context not found';END IF;
  INSERT INTO assets.requests(organisation_id,employee_id,category_id,requested_specification,reason,requested_by)
  VALUES(p_organisation_id,p_employee_id,p_category_id,coalesce(p_specification,'{}'),p_reason,p_actor_user_id)RETURNING id INTO v_id;
  INSERT INTO assets.history(organisation_id,asset_id,event_type,actor_user_id,payload,request_id)
  SELECT p_organisation_id,a.id,'asset.requested',p_actor_user_id,jsonb_build_object('requestId',v_id),gen_random_uuid()
  FROM assets.assets a WHERE false;
  INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,new_value,request_id)
  VALUES(p_organisation_id,p_actor_user_id,'asset_request',v_id,'asset.requested',jsonb_build_object('employeeId',p_employee_id,'categoryId',p_category_id),gen_random_uuid());
  INSERT INTO assets.outbox(organisation_id,topic,payload)VALUES(p_organisation_id,'asset.requested',jsonb_build_object('requestId',v_id,'employeeId',p_employee_id));
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION assets.create_request(uuid,uuid,uuid,uuid,text,jsonb)FROM PUBLIC;
INSERT INTO identity.permissions(key,description)VALUES
('assets.view_self','View assigned assets'),('assets.request','Request assets'),('assets.assign','Assign assets'),
('assets.return','Process asset returns'),('assets.manage','Manage asset inventory')
ON CONFLICT(key)DO UPDATE SET description=excluded.description;
INSERT INTO identity.role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM identity.roles r CROSS JOIN identity.permissions p
WHERE r.name='Owner' AND p.key LIKE 'assets.%' ON CONFLICT DO NOTHING;
COMMIT;
