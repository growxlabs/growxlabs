BEGIN;
CREATE OR REPLACE FUNCTION public.assign_commercial_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
BEGIN
  IF TG_TABLE_NAME='scopes_of_work' THEN
    IF NEW.scope_number IS NULL OR btrim(NEW.scope_number)='' THEN
      NEW.scope_number:=public.generate_business_document_number('scope_of_work','GXL-SOW',COALESCE(NEW.created_at,now()));
    END IF;
  ELSIF TG_TABLE_NAME='commercial_proposals' THEN
    IF NEW.proposal_number IS NULL OR btrim(NEW.proposal_number)='' THEN
      NEW.proposal_number:=public.generate_business_document_number('commercial_proposal','GXL-PRO',COALESCE(NEW.created_at,now()));
    END IF;
  ELSIF TG_TABLE_NAME='proposal_approval_records' THEN
    IF NEW.approval_number IS NULL OR btrim(NEW.approval_number)='' THEN
      NEW.approval_number:=public.generate_business_document_number('proposal_approval','GXL-PAP',COALESCE(NEW.created_at,now()));
    END IF;
  ELSIF TG_TABLE_NAME='master_service_agreements' THEN
    IF NEW.agreement_number IS NULL OR btrim(NEW.agreement_number)='' THEN
      NEW.agreement_number:=public.generate_business_document_number('master_service_agreement','GXL-MSA',COALESCE(NEW.created_at,now()));
    END IF;
  END IF;
  RETURN NEW;
END
$$;
COMMIT;
