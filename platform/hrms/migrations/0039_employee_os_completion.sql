BEGIN;

-- Vercel/Supabase bridge: attendance, leave, learning and assets remain bounded
-- contexts, while these service-role-only functions are exposed through public.
CREATE OR REPLACE FUNCTION public.employee_attendance_snapshot(p_organisation_id uuid,p_employee_id uuid,p_from date,p_to date)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,attendance AS $$
 SELECT jsonb_build_object(
  'today',coalesce((SELECT to_jsonb(s) FROM attendance.daily_summaries s WHERE s.organisation_id=p_organisation_id AND s.employee_id=p_employee_id AND s.work_date=current_date), '{}'::jsonb),
  'events',coalesce((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.occurred_at DESC) FROM attendance.events e WHERE e.organisation_id=p_organisation_id AND e.employee_id=p_employee_id AND e.occurred_at::date BETWEEN p_from AND p_to),'[]'::jsonb),
  'summaries',coalesce((SELECT jsonb_agg(to_jsonb(s) ORDER BY s.work_date DESC) FROM attendance.daily_summaries s WHERE s.organisation_id=p_organisation_id AND s.employee_id=p_employee_id AND s.work_date BETWEEN p_from AND p_to),'[]'::jsonb)
 ) $$;

CREATE OR REPLACE FUNCTION public.employee_record_attendance_event(p_organisation_id uuid,p_employee_id uuid,p_actor_user_id uuid,p_event_type text,p_timezone text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,attendance,people AS $$
DECLARE v_id uuid;
BEGIN
 IF p_event_type NOT IN ('CHECK_IN','CHECK_OUT') THEN RAISE EXCEPTION 'unsupported attendance event'; END IF;
 IF NOT EXISTS(SELECT 1 FROM people.employees WHERE id=p_employee_id AND organisation_id=p_organisation_id AND user_id=p_actor_user_id AND deleted_at IS NULL) THEN RAISE EXCEPTION 'employee context not found'; END IF;
 INSERT INTO attendance.events(organisation_id,employee_id,event_type,occurred_at,source,timezone,captured_at,created_by,request_id,idempotency_key)
 VALUES(p_organisation_id,p_employee_id,p_event_type,now(),'WEB',p_timezone,now(),p_actor_user_id,gen_random_uuid(),p_event_type||':'||p_employee_id||':'||to_char(now(),'YYYY-MM-DD-HH24-MI')) RETURNING id INTO v_id;
 RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.employee_leave_snapshot(p_organisation_id uuid,p_employee_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,leave AS $$
 SELECT jsonb_build_object(
  'requests',coalesce((SELECT jsonb_agg(to_jsonb(r)||jsonb_build_object('leave_type_name',t.name) ORDER BY r.created_at DESC) FROM leave.requests r JOIN leave.types t ON t.id=r.leave_type_id WHERE r.organisation_id=p_organisation_id AND r.employee_id=p_employee_id),'[]'::jsonb),
  'balances',coalesce((SELECT jsonb_agg(jsonb_build_object('leave_type_id',t.id,'name',t.name,'quantity',x.quantity) ORDER BY t.name) FROM leave.types t JOIN (SELECT leave_type_id,sum(quantity) quantity FROM leave.ledger_entries WHERE organisation_id=p_organisation_id AND employee_id=p_employee_id GROUP BY leave_type_id)x ON x.leave_type_id=t.id WHERE t.organisation_id=p_organisation_id AND t.deleted_at IS NULL),'[]'::jsonb),
  'types',coalesce((SELECT jsonb_agg(jsonb_build_object('id',id,'name',name,'minimum_quantity',minimum_quantity,'requires_attachment',requires_attachment) ORDER BY name) FROM leave.types WHERE organisation_id=p_organisation_id AND status='active' AND deleted_at IS NULL),'[]'::jsonb)
 ) $$;

CREATE OR REPLACE FUNCTION public.employee_submit_leave_request(p_organisation_id uuid,p_employee_id uuid,p_actor_user_id uuid,p_leave_type_id uuid,p_start_date date,p_end_date date,p_reason text,p_timezone text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,leave,people AS $$
DECLARE v_policy_version uuid;v_id uuid;v_quantity numeric;
BEGIN
 IF p_end_date<p_start_date OR length(trim(p_reason))<3 THEN RAISE EXCEPTION 'invalid leave request'; END IF;
 IF NOT EXISTS(SELECT 1 FROM people.employees WHERE id=p_employee_id AND organisation_id=p_organisation_id AND user_id=p_actor_user_id AND deleted_at IS NULL) THEN RAISE EXCEPTION 'employee context not found'; END IF;
 SELECT pv.id INTO v_policy_version FROM leave.policy_assignments pa JOIN leave.policy_versions pv ON pv.policy_id=pa.policy_id WHERE pa.organisation_id=p_organisation_id AND pa.employee_id=p_employee_id AND pa.effective_from<=p_start_date AND (pa.effective_to IS NULL OR pa.effective_to>=p_end_date) AND pv.effective_from<=p_start_date AND (pv.effective_to IS NULL OR pv.effective_to>=p_end_date) ORDER BY pa.effective_from DESC,pv.version DESC LIMIT 1;
 IF v_policy_version IS NULL THEN RAISE EXCEPTION 'No active leave policy is assigned to this employee'; END IF;
 v_quantity=(p_end_date-p_start_date)+1;
 INSERT INTO leave.requests(organisation_id,employee_id,leave_type_id,policy_version_id,start_date,end_date,total_quantity,reason,timezone,status,created_by)
 VALUES(p_organisation_id,p_employee_id,p_leave_type_id,v_policy_version,p_start_date,p_end_date,v_quantity,trim(p_reason),p_timezone,'SUBMITTED',p_actor_user_id) RETURNING id INTO v_id;
 RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.employee_learning_snapshot(p_organisation_id uuid,p_employee_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,learning AS $$
 SELECT jsonb_build_object('enrollments',coalesce((SELECT jsonb_agg(jsonb_build_object('id',e.id,'course_id',c.id,'title',c.title,'summary',c.summary,'status',e.status,'progress_percent',e.progress_percent,'due_at',e.due_at,'completed_at',e.completed_at,'certificate',CASE WHEN cert.id IS NULL THEN NULL ELSE jsonb_build_object('verification_id',cert.verification_id,'issued_at',cert.issued_at,'expires_at',cert.expires_at,'status',cert.status) END) ORDER BY e.created_at DESC) FROM learning.enrollments e JOIN learning.courses c ON c.id=e.course_id LEFT JOIN learning.certificates cert ON cert.enrollment_id=e.id WHERE e.organisation_id=p_organisation_id AND e.employee_id=p_employee_id AND c.status='PUBLISHED' AND e.status<>'CANCELLED'),'[]'::jsonb)) $$;

CREATE OR REPLACE FUNCTION public.employee_assets_snapshot(p_organisation_id uuid,p_employee_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,assets AS $$
 SELECT jsonb_build_object('assignments',coalesce((SELECT jsonb_agg(jsonb_build_object('id',x.id,'status',x.status,'assigned_at',x.assigned_at,'due_back_at',x.due_back_at,'accepted_at',x.accepted_at,'condition',x.condition_out,'accessories',x.accessories,'asset',jsonb_build_object('id',a.id,'code',a.asset_code,'name',a.name,'manufacturer',a.manufacturer,'model',a.model,'serial_number',a.serial_number)) ORDER BY x.assigned_at DESC) FROM assets.assignments x JOIN assets.assets a ON a.id=x.asset_id WHERE x.organisation_id=p_organisation_id AND x.employee_id=p_employee_id AND x.status IN('PENDING_ACCEPTANCE','ACTIVE','RETURN_REQUESTED')),'[]'::jsonb)) $$;

REVOKE ALL ON FUNCTION public.employee_attendance_snapshot(uuid,uuid,date,date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.employee_record_attendance_event(uuid,uuid,uuid,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.employee_leave_snapshot(uuid,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.employee_submit_leave_request(uuid,uuid,uuid,uuid,date,date,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.employee_learning_snapshot(uuid,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.employee_assets_snapshot(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.employee_attendance_snapshot(uuid,uuid,date,date),public.employee_record_attendance_event(uuid,uuid,uuid,text,text),public.employee_leave_snapshot(uuid,uuid),public.employee_submit_leave_request(uuid,uuid,uuid,uuid,date,date,text,text),public.employee_learning_snapshot(uuid,uuid),public.employee_assets_snapshot(uuid,uuid) TO service_role;

NOTIFY pgrst,'reload schema';
COMMIT;
