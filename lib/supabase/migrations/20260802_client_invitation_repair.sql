-- Repair for projects where the client assessment migration created the tables
-- but the RPC function was not committed. Run this after the assessment schema.
CREATE OR REPLACE FUNCTION public.create_client_invitation(
  p_email TEXT,
  p_name TEXT,
  p_password_hash TEXT,
  p_company_id UUID,
  p_lead_id UUID,
  p_deal_id UUID,
  p_token_hash TEXT,
  p_expires_at TIMESTAMPTZ,
  p_created_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID;
  v_client UUID;
BEGIN
  SELECT id INTO v_user FROM public.users
    WHERE lower(email) = lower(p_email) FOR UPDATE;
  IF v_user IS NULL THEN
    INSERT INTO public.users(name, email, password, role)
      VALUES (p_name, lower(p_email), p_password_hash, 'CLIENT')
      RETURNING id INTO v_user;
  ELSIF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_user AND role = 'CLIENT') THEN
    RAISE EXCEPTION 'Email belongs to a non-client account';
  END IF;
  INSERT INTO public.client_profiles(user_id, company_id, lead_id, deal_id)
    VALUES (v_user, p_company_id, p_lead_id, p_deal_id)
    ON CONFLICT (user_id) DO UPDATE SET
      company_id = COALESCE(EXCLUDED.company_id, client_profiles.company_id),
      lead_id = COALESCE(EXCLUDED.lead_id, client_profiles.lead_id),
      deal_id = COALESCE(EXCLUDED.deal_id, client_profiles.deal_id),
      updated_at = now()
    RETURNING id INTO v_client;
  UPDATE public.client_invitations SET revoked_at = now()
    WHERE client_id = v_client AND accepted_at IS NULL AND revoked_at IS NULL;
  INSERT INTO public.client_invitations(client_id, email, token_hash, expires_at, created_by)
    VALUES (v_client, lower(p_email), p_token_hash, p_expires_at, p_created_by);
  RETURN v_client;
END;
$$;

REVOKE ALL ON FUNCTION public.create_client_invitation(TEXT,TEXT,TEXT,UUID,UUID,UUID,TEXT,TIMESTAMPTZ,UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_client_invitation(TEXT,TEXT,TEXT,UUID,UUID,UUID,TEXT,TIMESTAMPTZ,UUID) TO service_role;
