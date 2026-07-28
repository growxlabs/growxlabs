BEGIN;

CREATE OR REPLACE FUNCTION leave.run_accrual(
  p_effective_date date, p_actor_user_id uuid, p_limit integer DEFAULT 100
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,leave,people AS $$
DECLARE v_processed integer:=0; v_row record; v_entry_id uuid;
BEGIN
  IF p_limit<1 OR p_limit>500 THEN RAISE EXCEPTION 'batch limit must be between 1 and 500'; END IF;
  FOR v_row IN
    SELECT e.organisation_id,e.id employee_id,pv.id policy_version_id,r.leave_type_id,r.accrual_amount
    FROM people.employees e
    JOIN people.employment_records er ON er.employee_id=e.id AND er.valid_to IS NULL AND er.status='active'
    JOIN LATERAL (
      SELECT pa.policy_id FROM leave.policy_assignments pa
      WHERE pa.organisation_id=e.organisation_id
        AND (pa.employee_id=e.id OR pa.department_id=er.department_id)
        AND pa.effective_from<=p_effective_date
        AND (pa.effective_to IS NULL OR pa.effective_to>=p_effective_date)
      ORDER BY (pa.employee_id IS NOT NULL) DESC,pa.effective_from DESC LIMIT 1
    ) pa ON true
    JOIN LATERAL (
      SELECT * FROM leave.policy_versions candidate
      WHERE candidate.policy_id=pa.policy_id AND candidate.effective_from<=p_effective_date
        AND (candidate.effective_to IS NULL OR candidate.effective_to>=p_effective_date)
        AND candidate.accrual_frequency<>'none'
      ORDER BY candidate.version DESC LIMIT 1
    ) pv ON true
    JOIN leave.policy_type_rules r ON r.policy_version_id=pv.id AND r.accrual_amount>0
    WHERE e.deleted_at IS NULL
    ORDER BY e.organisation_id,e.id,r.leave_type_id LIMIT p_limit
  LOOP
    INSERT INTO leave.ledger_entries(
      organisation_id,employee_id,leave_type_id,policy_version_id,entry_type,quantity,
      effective_date,reference_type,reason,created_by,idempotency_key
    ) VALUES(
      v_row.organisation_id,v_row.employee_id,v_row.leave_type_id,v_row.policy_version_id,
      'ACCRUAL',v_row.accrual_amount,p_effective_date,'scheduled_accrual',
      'Scheduled leave accrual',p_actor_user_id,
      'accrual:'||p_effective_date||':'||v_row.employee_id||':'||v_row.leave_type_id
    ) ON CONFLICT(organisation_id,idempotency_key) DO NOTHING RETURNING id INTO v_entry_id;
    IF v_entry_id IS NOT NULL THEN v_processed:=v_processed+1; END IF;
    v_entry_id:=NULL;
  END LOOP;
  RETURN jsonb_build_object('processed',v_processed,'effectiveDate',p_effective_date);
END $$;

CREATE OR REPLACE FUNCTION leave.run_carry_forward(
  p_from_year integer, p_actor_user_id uuid, p_limit integer DEFAULT 100
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,leave,people AS $$
DECLARE v_processed integer:=0; v_row record; v_quantity numeric(8,2);
BEGIN
  IF p_limit<1 OR p_limit>500 THEN RAISE EXCEPTION 'batch limit must be between 1 and 500'; END IF;
  FOR v_row IN
    SELECT l.organisation_id,l.employee_id,l.leave_type_id,max(l.policy_version_id::text)::uuid policy_version_id,
      sum(l.quantity) balance,max(r.carry_forward_limit) carry_limit
    FROM leave.ledger_entries l
    JOIN leave.policy_type_rules r ON r.policy_version_id=l.policy_version_id AND r.leave_type_id=l.leave_type_id
    JOIN leave.types t ON t.id=l.leave_type_id AND t.carry_forward_supported
    WHERE l.effective_date<=make_date(p_from_year,12,31)
    GROUP BY l.organisation_id,l.employee_id,l.leave_type_id
    HAVING sum(l.quantity)>0
    ORDER BY l.organisation_id,l.employee_id,l.leave_type_id LIMIT p_limit
  LOOP
    v_quantity:=least(v_row.balance,coalesce(v_row.carry_limit,v_row.balance));
    INSERT INTO leave.ledger_entries(
      organisation_id,employee_id,leave_type_id,policy_version_id,entry_type,quantity,
      effective_date,reference_type,reason,created_by,idempotency_key
    ) VALUES(
      v_row.organisation_id,v_row.employee_id,v_row.leave_type_id,v_row.policy_version_id,
      'CARRY_FORWARD',v_quantity,make_date(p_from_year+1,1,1),'scheduled_carry_forward',
      'Annual leave carry forward',p_actor_user_id,
      'carry-forward:'||p_from_year||':'||v_row.employee_id||':'||v_row.leave_type_id
    ) ON CONFLICT(organisation_id,idempotency_key) DO NOTHING;
    IF FOUND THEN v_processed:=v_processed+1; END IF;
  END LOOP;
  RETURN jsonb_build_object('processed',v_processed,'fromYear',p_from_year,'toYear',p_from_year+1);
END $$;

REVOKE ALL ON FUNCTION leave.run_accrual(date,uuid,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION leave.run_carry_forward(integer,uuid,integer) FROM PUBLIC;
COMMIT;
