CREATE OR REPLACE FUNCTION attendance.record_event(
  p_organisation_id uuid, p_actor_user_id uuid, p_event_type text,
  p_occurred_at timestamptz, p_source text, p_timezone text,
  p_latitude numeric, p_longitude numeric, p_accuracy_metres integer,
  p_captured_at timestamptz, p_ip_address inet, p_device_id text,
  p_notes text, p_metadata jsonb, p_request_id uuid, p_idempotency_key text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=attendance,people,audit,public AS $$
DECLARE v_employee_id uuid; v_last_type text; v_id uuid; v_existing jsonb;
BEGIN
  SELECT id INTO v_employee_id FROM people.employees
  WHERE organisation_id=p_organisation_id AND user_id=p_actor_user_id AND deleted_at IS NULL;
  IF v_employee_id IS NULL THEN RAISE EXCEPTION 'active employee link not found' USING ERRCODE='P0001'; END IF;
  IF NOT EXISTS(SELECT 1 FROM people.employment_records WHERE organisation_id=p_organisation_id AND employee_id=v_employee_id AND valid_to IS NULL AND status IN ('active','probation')) THEN
    RAISE EXCEPTION 'employee is not attendance eligible' USING ERRCODE='P0001';
  END IF;
  SELECT jsonb_build_object('id',id,'employeeId',employee_id,'eventType',event_type,'occurredAt',occurred_at)
  INTO v_existing FROM attendance.events WHERE organisation_id=p_organisation_id AND employee_id=v_employee_id AND idempotency_key=p_idempotency_key;
  IF v_existing IS NOT NULL THEN RETURN v_existing; END IF;
  SELECT event_type INTO v_last_type FROM attendance.events
  WHERE organisation_id=p_organisation_id AND employee_id=v_employee_id
  ORDER BY occurred_at DESC,created_at DESC LIMIT 1;
  IF (p_event_type='CHECK_IN' AND v_last_type IN ('CHECK_IN','BREAK_END'))
    OR (p_event_type='BREAK_START' AND v_last_type NOT IN ('CHECK_IN','BREAK_END'))
    OR (p_event_type='BREAK_END' AND v_last_type<>'BREAK_START')
    OR (p_event_type='CHECK_OUT' AND v_last_type NOT IN ('CHECK_IN','BREAK_END')) THEN
    RAISE EXCEPTION 'invalid attendance event sequence after %',coalesce(v_last_type,'no event') USING ERRCODE='P0001';
  END IF;
  INSERT INTO attendance.events(organisation_id,employee_id,event_type,occurred_at,source,timezone,latitude,longitude,accuracy_metres,captured_at,ip_address,device_id,notes,created_by,metadata,request_id,idempotency_key)
  VALUES(p_organisation_id,v_employee_id,p_event_type,p_occurred_at,p_source,p_timezone,p_latitude,p_longitude,p_accuracy_metres,p_captured_at,p_ip_address,p_device_id,p_notes,p_actor_user_id,coalesce(p_metadata,'{}'),p_request_id,p_idempotency_key)
  RETURNING id INTO v_id;
  INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,new_value,ip_address,request_id)
  VALUES(p_organisation_id,p_actor_user_id,'attendance_event',v_id,'attendance.'||lower(p_event_type),jsonb_build_object('eventType',p_event_type,'source',p_source,'occurredAt',p_occurred_at,'locationEvidenceProvided',p_latitude IS NOT NULL),p_ip_address,p_request_id);
  INSERT INTO attendance.domain_outbox(organisation_id,topic,payload,request_id)
  VALUES(p_organisation_id,'attendance.event_recorded',jsonb_build_object('eventId',v_id,'employeeId',v_employee_id,'occurredAt',p_occurred_at),p_request_id);
  RETURN jsonb_build_object('id',v_id,'employeeId',v_employee_id,'eventType',p_event_type,'occurredAt',p_occurred_at);
END $$;

CREATE OR REPLACE FUNCTION attendance.submit_regularisation(
  p_organisation_id uuid,p_actor_user_id uuid,p_work_date date,p_reason_type text,
  p_requested_check_in timestamptz,p_requested_check_out timestamptz,p_reason text,p_request_id uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=attendance,people,workflow,audit,public AS $$
DECLARE v_employee_id uuid;v_request_id uuid;v_definition_id uuid;v_version_id uuid;v_instance_id uuid;
BEGIN
  SELECT id INTO STRICT v_employee_id FROM people.employees WHERE organisation_id=p_organisation_id AND user_id=p_actor_user_id AND deleted_at IS NULL;
  INSERT INTO attendance.regularisation_requests(organisation_id,employee_id,work_date,reason_type,requested_check_in,requested_check_out,reason,status,created_by)
  VALUES(p_organisation_id,v_employee_id,p_work_date,p_reason_type,p_requested_check_in,p_requested_check_out,p_reason,'PENDING_MANAGER',p_actor_user_id) RETURNING id INTO v_request_id;
  INSERT INTO workflow.definitions(organisation_id,key,name) VALUES(p_organisation_id,'attendance-regularisation','Attendance Regularisation')
  ON CONFLICT(organisation_id,key) DO UPDATE SET name=excluded.name RETURNING id INTO v_definition_id;
  SELECT id INTO v_version_id FROM workflow.versions WHERE definition_id=v_definition_id AND published_at IS NOT NULL ORDER BY version DESC LIMIT 1;
  IF v_version_id IS NULL THEN
    INSERT INTO workflow.versions(organisation_id,definition_id,version,specification,published_at)
    VALUES(p_organisation_id,v_definition_id,1,'{"states":["pending_manager","pending_hr","approved","rejected"]}',now()) RETURNING id INTO v_version_id;
    INSERT INTO workflow.transitions(organisation_id,version_id,from_state,to_state) VALUES
    (p_organisation_id,v_version_id,'pending_manager','pending_hr'),(p_organisation_id,v_version_id,'pending_manager','rejected'),
    (p_organisation_id,v_version_id,'pending_hr','approved'),(p_organisation_id,v_version_id,'pending_hr','rejected');
  END IF;
  INSERT INTO workflow.instances(organisation_id,version_id,entity_type,entity_id,state)
  VALUES(p_organisation_id,v_version_id,'attendance_regularisation',v_request_id,'pending_manager') RETURNING id INTO v_instance_id;
  UPDATE attendance.regularisation_requests SET workflow_instance_id=v_instance_id WHERE id=v_request_id;
  INSERT INTO workflow.history(organisation_id,instance_id,to_state,actor_user_id,payload) VALUES(p_organisation_id,v_instance_id,'pending_manager',p_actor_user_id,'{}');
  INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,new_value,request_id)
  VALUES(p_organisation_id,p_actor_user_id,'attendance_regularisation',v_request_id,'attendance.regularisation_submitted',jsonb_build_object('workDate',p_work_date,'reasonType',p_reason_type),p_request_id);
  INSERT INTO attendance.domain_outbox(organisation_id,topic,payload,request_id) VALUES(p_organisation_id,'attendance.regularisation_submitted',jsonb_build_object('requestId',v_request_id,'employeeId',v_employee_id),p_request_id);
  RETURN v_request_id;
END $$;

CREATE OR REPLACE FUNCTION attendance.decide_regularisation(
  p_organisation_id uuid,p_actor_user_id uuid,p_regularisation_id uuid,p_decision text,p_comment text,p_request_id uuid
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=attendance,workflow,audit,public AS $$
DECLARE v_record attendance.regularisation_requests%ROWTYPE;v_from text;v_to text;v_event_id uuid;
BEGIN
  SELECT * INTO STRICT v_record FROM attendance.regularisation_requests WHERE id=p_regularisation_id AND organisation_id=p_organisation_id FOR UPDATE;
  SELECT state INTO v_from FROM workflow.instances WHERE id=v_record.workflow_instance_id FOR UPDATE;
  IF p_decision NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'invalid decision' USING ERRCODE='P0001'; END IF;
  v_to:=CASE WHEN p_decision='rejected' THEN 'rejected' WHEN v_from='pending_manager' THEN 'pending_hr' ELSE 'approved' END;
  INSERT INTO attendance.regularisation_approvals(organisation_id,request_id,workflow_step,approver_user_id,decision,comment,decided_at,correlation_request_id)
  VALUES(p_organisation_id,p_regularisation_id,v_from,p_actor_user_id,p_decision,p_comment,now(),p_request_id);
  UPDATE workflow.instances SET state=v_to,completed_at=CASE WHEN v_to IN ('approved','rejected') THEN now() END WHERE id=v_record.workflow_instance_id;
  INSERT INTO workflow.history(organisation_id,instance_id,from_state,to_state,actor_user_id,payload)
  VALUES(p_organisation_id,v_record.workflow_instance_id,v_from,v_to,p_actor_user_id,jsonb_build_object('comment',p_comment));
  IF v_to='approved' THEN
    INSERT INTO attendance.events(organisation_id,employee_id,event_type,occurred_at,source,timezone,notes,created_by,metadata,request_id)
    VALUES(p_organisation_id,v_record.employee_id,'CORRECTION',coalesce(v_record.requested_check_in,v_record.requested_check_out,now()),'ADMIN','UTC',p_comment,p_actor_user_id,jsonb_build_object('regularisationId',p_regularisation_id,'checkIn',v_record.requested_check_in,'checkOut',v_record.requested_check_out),p_request_id)
    RETURNING id INTO v_event_id;
    UPDATE attendance.regularisation_requests SET status='APPROVED',updated_at=now(),version=version+1 WHERE id=p_regularisation_id;
    UPDATE attendance.daily_summaries SET status='PENDING_REVIEW',is_regularised=true,version=version+1,updated_at=now() WHERE organisation_id=p_organisation_id AND employee_id=v_record.employee_id AND work_date=v_record.work_date;
    INSERT INTO attendance.domain_outbox(organisation_id,topic,payload,request_id) VALUES(p_organisation_id,'attendance.recalculation_requested',jsonb_build_object('employeeId',v_record.employee_id,'workDate',v_record.work_date,'correctionEventId',v_event_id),p_request_id);
  ELSIF v_to='rejected' THEN UPDATE attendance.regularisation_requests SET status='REJECTED',updated_at=now(),version=version+1 WHERE id=p_regularisation_id;
  ELSE UPDATE attendance.regularisation_requests SET status='PENDING_HR',updated_at=now(),version=version+1 WHERE id=p_regularisation_id; END IF;
  INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,new_value,request_id)
  VALUES(p_organisation_id,p_actor_user_id,'attendance_regularisation',p_regularisation_id,'attendance.regularisation_'||p_decision,jsonb_build_object('step',v_from,'next',v_to),p_request_id);
  RETURN v_to;
END $$;

CREATE OR REPLACE FUNCTION leave.create_request(
  p_organisation_id uuid,p_actor_user_id uuid,p_leave_type_id uuid,p_policy_version_id uuid,
  p_start_date date,p_end_date date,p_total_quantity numeric,p_reason text,p_contact text,
  p_delegation text,p_timezone text,p_attachment_document_id uuid,p_days jsonb,p_request_id uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=leave,people,workflow,audit,public AS $$
DECLARE v_employee_id uuid;v_request_id uuid;v_balance numeric;v_requires_balance boolean;v_negative boolean;v_requires_attachment boolean;v_definition_id uuid;v_workflow_version uuid;v_instance uuid;v_day jsonb;
BEGIN
  SELECT id INTO STRICT v_employee_id FROM people.employees WHERE organisation_id=p_organisation_id AND user_id=p_actor_user_id AND deleted_at IS NULL;
  SELECT requires_balance,negative_balance_allowed,requires_attachment INTO STRICT v_requires_balance,v_negative,v_requires_attachment FROM leave.types WHERE id=p_leave_type_id AND organisation_id=p_organisation_id AND deleted_at IS NULL;
  IF v_requires_attachment AND p_attachment_document_id IS NULL THEN RAISE EXCEPTION 'attachment is required' USING ERRCODE='P0001'; END IF;
  IF EXISTS(SELECT 1 FROM leave.requests WHERE organisation_id=p_organisation_id AND employee_id=v_employee_id AND status IN ('SUBMITTED','PENDING_APPROVAL','APPROVED') AND daterange(start_date,end_date,'[]')&&daterange(p_start_date,p_end_date,'[]')) THEN RAISE EXCEPTION 'leave dates overlap an existing request' USING ERRCODE='P0001'; END IF;
  SELECT coalesce(sum(quantity),0) INTO v_balance FROM leave.ledger_entries WHERE organisation_id=p_organisation_id AND employee_id=v_employee_id AND leave_type_id=p_leave_type_id AND effective_date<=p_start_date;
  IF v_requires_balance AND NOT v_negative AND v_balance<p_total_quantity THEN RAISE EXCEPTION 'insufficient leave balance' USING ERRCODE='P0001'; END IF;
  INSERT INTO leave.requests(organisation_id,employee_id,leave_type_id,policy_version_id,start_date,end_date,total_quantity,reason,contact_during_leave,delegation_notes,timezone,attachment_document_id,status,created_by)
  VALUES(p_organisation_id,v_employee_id,p_leave_type_id,p_policy_version_id,p_start_date,p_end_date,p_total_quantity,p_reason,p_contact,p_delegation,p_timezone,p_attachment_document_id,'PENDING_APPROVAL',p_actor_user_id) RETURNING id INTO v_request_id;
  FOR v_day IN SELECT * FROM jsonb_array_elements(p_days) LOOP
    INSERT INTO leave.request_days(organisation_id,request_id,leave_date,duration_type,quantity,is_working_day,is_holiday,is_weekly_off,is_chargeable)
    VALUES(p_organisation_id,v_request_id,(v_day->>'date')::date,v_day->>'durationType',(v_day->>'quantity')::numeric,(v_day->>'isWorkingDay')::boolean,(v_day->>'isHoliday')::boolean,(v_day->>'isWeeklyOff')::boolean,(v_day->>'isChargeable')::boolean);
  END LOOP;
  INSERT INTO workflow.definitions(organisation_id,key,name) VALUES(p_organisation_id,'leave-approval','Leave Approval') ON CONFLICT(organisation_id,key) DO UPDATE SET name=excluded.name RETURNING id INTO v_definition_id;
  SELECT id INTO v_workflow_version FROM workflow.versions WHERE definition_id=v_definition_id AND published_at IS NOT NULL ORDER BY version DESC LIMIT 1;
  IF v_workflow_version IS NULL THEN
    INSERT INTO workflow.versions(organisation_id,definition_id,version,specification,published_at) VALUES(p_organisation_id,v_definition_id,1,'{"states":["pending_manager","pending_hr","approved","rejected"]}',now()) RETURNING id INTO v_workflow_version;
    INSERT INTO workflow.transitions(organisation_id,version_id,from_state,to_state) VALUES(p_organisation_id,v_workflow_version,'pending_manager','pending_hr'),(p_organisation_id,v_workflow_version,'pending_manager','approved'),(p_organisation_id,v_workflow_version,'pending_manager','rejected'),(p_organisation_id,v_workflow_version,'pending_hr','approved'),(p_organisation_id,v_workflow_version,'pending_hr','rejected');
  END IF;
  INSERT INTO workflow.instances(organisation_id,version_id,entity_type,entity_id,state) VALUES(p_organisation_id,v_workflow_version,'leave_request',v_request_id,'pending_manager') RETURNING id INTO v_instance;
  UPDATE leave.requests SET workflow_instance_id=v_instance WHERE id=v_request_id;
  INSERT INTO workflow.history(organisation_id,instance_id,to_state,actor_user_id,payload) VALUES(p_organisation_id,v_instance,'pending_manager',p_actor_user_id,'{}');
  INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,new_value,request_id) VALUES(p_organisation_id,p_actor_user_id,'leave_request',v_request_id,'leave.submitted',jsonb_build_object('quantity',p_total_quantity,'startDate',p_start_date,'endDate',p_end_date),p_request_id);
  INSERT INTO leave.domain_outbox(organisation_id,topic,payload,request_id) VALUES(p_organisation_id,'leave.submitted',jsonb_build_object('requestId',v_request_id,'employeeId',v_employee_id),p_request_id);
  RETURN v_request_id;
END $$;

CREATE OR REPLACE FUNCTION leave.decide_request(
 p_organisation_id uuid,p_actor_user_id uuid,p_leave_request_id uuid,p_decision text,p_comment text,p_request_id uuid
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=leave,workflow,audit,public AS $$
DECLARE v_record leave.requests%ROWTYPE;v_from text;v_to text;v_hr_required boolean;
BEGIN
 SELECT * INTO STRICT v_record FROM leave.requests WHERE id=p_leave_request_id AND organisation_id=p_organisation_id FOR UPDATE;
 SELECT state INTO v_from FROM workflow.instances WHERE id=v_record.workflow_instance_id FOR UPDATE;
 SELECT hr_approval_required INTO v_hr_required FROM leave.types WHERE id=v_record.leave_type_id;
 IF p_decision NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'invalid decision' USING ERRCODE='P0001'; END IF;
 v_to:=CASE WHEN p_decision='rejected' THEN 'rejected' WHEN v_from='pending_manager' AND v_hr_required THEN 'pending_hr' ELSE 'approved' END;
 INSERT INTO leave.approvals(organisation_id,request_id,workflow_step,approver_user_id,decision,comment,decided_at,correlation_request_id) VALUES(p_organisation_id,p_leave_request_id,v_from,p_actor_user_id,p_decision,p_comment,now(),p_request_id);
 UPDATE workflow.instances SET state=v_to,completed_at=CASE WHEN v_to IN ('approved','rejected') THEN now() END WHERE id=v_record.workflow_instance_id;
 INSERT INTO workflow.history(organisation_id,instance_id,from_state,to_state,actor_user_id,payload) VALUES(p_organisation_id,v_record.workflow_instance_id,v_from,v_to,p_actor_user_id,jsonb_build_object('comment',p_comment));
 IF v_to='approved' THEN
   UPDATE leave.requests SET status='APPROVED',updated_at=now(),version=version+1 WHERE id=p_leave_request_id;
   INSERT INTO leave.ledger_entries(organisation_id,employee_id,leave_type_id,policy_version_id,entry_type,quantity,effective_date,reference_type,reference_id,reason,created_by,idempotency_key)
   VALUES(p_organisation_id,v_record.employee_id,v_record.leave_type_id,v_record.policy_version_id,'USAGE',-v_record.total_quantity,v_record.start_date,'leave_request',v_record.id,'Approved leave',p_actor_user_id,'leave-usage:'||v_record.id);
   INSERT INTO leave.domain_outbox(organisation_id,topic,payload,request_id) VALUES(p_organisation_id,'leave.approved',jsonb_build_object('requestId',v_record.id,'employeeId',v_record.employee_id,'startDate',v_record.start_date,'endDate',v_record.end_date),p_request_id);
 ELSIF v_to='rejected' THEN UPDATE leave.requests SET status='REJECTED',updated_at=now(),version=version+1 WHERE id=p_leave_request_id;
 ELSE UPDATE leave.requests SET status='PENDING_APPROVAL',updated_at=now(),version=version+1 WHERE id=p_leave_request_id; END IF;
 INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,new_value,request_id) VALUES(p_organisation_id,p_actor_user_id,'leave_request',p_leave_request_id,'leave.'||p_decision,jsonb_build_object('step',v_from,'next',v_to),p_request_id);
 RETURN v_to;
END $$;

CREATE OR REPLACE FUNCTION leave.close_request(
 p_organisation_id uuid,p_actor_user_id uuid,p_leave_request_id uuid,p_action text,p_reason text,p_request_id uuid
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=leave,audit,public AS $$
DECLARE v_record leave.requests%ROWTYPE;v_status text;
BEGIN
 SELECT * INTO STRICT v_record FROM leave.requests WHERE id=p_leave_request_id AND organisation_id=p_organisation_id FOR UPDATE;
 IF p_action='withdraw' AND v_record.status IN ('SUBMITTED','PENDING_APPROVAL') THEN v_status:='WITHDRAWN';
 ELSIF p_action='cancel' AND v_record.status='APPROVED' THEN
   v_status:='CANCELLED';
   INSERT INTO leave.ledger_entries(organisation_id,employee_id,leave_type_id,policy_version_id,entry_type,quantity,effective_date,reference_type,reference_id,reason,created_by,idempotency_key)
   VALUES(p_organisation_id,v_record.employee_id,v_record.leave_type_id,v_record.policy_version_id,'REVERSAL',v_record.total_quantity,current_date,'leave_request',v_record.id,p_reason,p_actor_user_id,'leave-reversal:'||v_record.id);
   INSERT INTO leave.domain_outbox(organisation_id,topic,payload,request_id) VALUES(p_organisation_id,'leave.cancelled',jsonb_build_object('requestId',v_record.id,'employeeId',v_record.employee_id,'startDate',v_record.start_date,'endDate',v_record.end_date),p_request_id);
 ELSE RAISE EXCEPTION 'request cannot be closed from current state' USING ERRCODE='P0001'; END IF;
 UPDATE leave.requests SET status=v_status,updated_at=now(),version=version+1 WHERE id=v_record.id;
 INSERT INTO audit.events(organisation_id,actor_user_id,entity_type,entity_id,action,new_value,request_id) VALUES(p_organisation_id,p_actor_user_id,'leave_request',v_record.id,'leave.'||p_action,jsonb_build_object('reason',p_reason,'status',v_status),p_request_id);
 RETURN v_status;
END $$;
