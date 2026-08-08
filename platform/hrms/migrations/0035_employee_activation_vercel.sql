BEGIN;

CREATE OR REPLACE FUNCTION identity.accept_employee_invitation(
  p_token_hash text,
  p_password_hash text
)
RETURNS TABLE(user_id uuid, organisation_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = identity, public
AS $$
DECLARE
  invitation identity.invitations%ROWTYPE;
BEGIN
  SELECT * INTO invitation
  FROM identity.invitations
  WHERE token_hash = p_token_hash
    AND accepted_at IS NULL
    AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'invalid_invitation';
  END IF;

  UPDATE identity.invitations
  SET accepted_at = now()
  WHERE id = invitation.id;

  UPDATE identity.users
  SET status = 'active',
      password_hash = p_password_hash,
      activated_at = now(),
      suspended_at = NULL,
      failed_login_count = 0,
      locked_until = NULL,
      version = version + 1,
      updated_at = now()
  WHERE id = invitation.user_id
    AND organisation_id = invitation.organisation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'invited_user_missing';
  END IF;

  RETURN QUERY SELECT invitation.user_id, invitation.organisation_id;
END;
$$;

REVOKE ALL ON FUNCTION identity.accept_employee_invitation(text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION identity.accept_employee_invitation(text,text) TO service_role;

COMMIT;
