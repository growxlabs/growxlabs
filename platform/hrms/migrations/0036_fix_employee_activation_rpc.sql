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
  v_invitation identity.invitations%ROWTYPE;
BEGIN
  SELECT i.* INTO v_invitation
  FROM identity.invitations AS i
  WHERE i.token_hash = p_token_hash
    AND i.accepted_at IS NULL
    AND i.expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'invalid_invitation';
  END IF;

  UPDATE identity.users AS u
  SET status = 'active',
      password_hash = p_password_hash,
      activated_at = now(),
      suspended_at = NULL,
      failed_login_count = 0,
      locked_until = NULL,
      version = u.version + 1,
      updated_at = now()
  WHERE u.id = v_invitation.user_id
    AND u.organisation_id = v_invitation.organisation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'invited_user_missing';
  END IF;

  UPDATE identity.invitations AS i
  SET accepted_at = now()
  WHERE i.id = v_invitation.id;

  RETURN QUERY
  SELECT v_invitation.user_id, v_invitation.organisation_id;
END;
$$;

REVOKE ALL ON FUNCTION identity.accept_employee_invitation(text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION identity.accept_employee_invitation(text,text) TO service_role;

COMMIT;
