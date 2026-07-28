BEGIN;
CREATE OR REPLACE FUNCTION documents.run_expiry(p_run_date date,p_limit integer DEFAULT 100)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,documents AS $$
DECLARE v_row record;v_processed integer:=0;
BEGIN
 IF p_limit<1 OR p_limit>500 THEN RAISE EXCEPTION 'limit must be between 1 and 500';END IF;
 FOR v_row IN SELECT d.id,d.organisation_id,d.owner_entity_id,d.name,d.expires_at FROM documents.documents d
  WHERE d.deleted_at IS NULL AND d.expires_at IS NOT NULL AND d.expires_at<=p_run_date
   AND d.verification_status<>'EXPIRED' ORDER BY d.expires_at LIMIT p_limit FOR UPDATE SKIP LOCKED
 LOOP
  UPDATE documents.documents SET verification_status='EXPIRED',updated_at=now()WHERE id=v_row.id;
  INSERT INTO documents.outbox(organisation_id,topic,payload)VALUES(v_row.organisation_id,'document.expired',jsonb_build_object('documentId',v_row.id,'ownerEntityId',v_row.owner_entity_id,'name',v_row.name,'expiredAt',v_row.expires_at));
  v_processed:=v_processed+1;
 END LOOP;
 RETURN jsonb_build_object('processed',v_processed,'runDate',p_run_date);
END $$;
CREATE OR REPLACE FUNCTION assets.run_warranty_reminders(p_run_date date,p_limit integer DEFAULT 100)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,assets AS $$
DECLARE v_row record;v_processed integer:=0;
BEGIN
 IF p_limit<1 OR p_limit>500 THEN RAISE EXCEPTION 'limit must be between 1 and 500';END IF;
 FOR v_row IN SELECT id,organisation_id,asset_code,warranty_expires_at FROM assets.assets
  WHERE warranty_expires_at BETWEEN p_run_date AND p_run_date+30 AND state NOT IN('DISPOSED','RETIRED')
  ORDER BY warranty_expires_at LIMIT p_limit
 LOOP
  INSERT INTO assets.outbox(organisation_id,topic,payload)
  SELECT v_row.organisation_id,'asset.warranty_reminder',jsonb_build_object('assetId',v_row.id,'assetCode',v_row.asset_code,'warrantyExpiresAt',v_row.warranty_expires_at)
  WHERE NOT EXISTS(SELECT 1 FROM assets.outbox WHERE topic='asset.warranty_reminder' AND payload->>'assetId'=v_row.id::text AND created_at::date=p_run_date);
  IF FOUND THEN v_processed:=v_processed+1;END IF;
 END LOOP;
 RETURN jsonb_build_object('processed',v_processed,'runDate',p_run_date);
END $$;
CREATE OR REPLACE FUNCTION learning.run_due_reminders(p_run_date date,p_limit integer DEFAULT 100)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,learning AS $$
DECLARE v_row record;v_processed integer:=0;
BEGIN
 IF p_limit<1 OR p_limit>500 THEN RAISE EXCEPTION 'limit must be between 1 and 500';END IF;
 FOR v_row IN SELECT e.id,e.organisation_id,e.employee_id,e.course_id,e.due_at FROM learning.enrollments e
  WHERE e.status IN('NOT_STARTED','IN_PROGRESS','OVERDUE')AND e.due_at::date<=p_run_date+7
  ORDER BY e.due_at LIMIT p_limit FOR UPDATE SKIP LOCKED
 LOOP
  IF v_row.due_at::date<p_run_date THEN UPDATE learning.enrollments SET status='OVERDUE' WHERE id=v_row.id;END IF;
  INSERT INTO learning.outbox(organisation_id,topic,payload)
  SELECT v_row.organisation_id,'learning.due_reminder',jsonb_build_object('enrollmentId',v_row.id,'employeeId',v_row.employee_id,'courseId',v_row.course_id,'dueAt',v_row.due_at)
  WHERE NOT EXISTS(SELECT 1 FROM learning.outbox WHERE topic='learning.due_reminder' AND payload->>'enrollmentId'=v_row.id::text AND created_at::date=p_run_date);
  IF FOUND THEN v_processed:=v_processed+1;END IF;
 END LOOP;
 UPDATE learning.certificates SET status='EXPIRED' WHERE expires_at<p_run_date AND status='ISSUED';
 RETURN jsonb_build_object('processed',v_processed,'runDate',p_run_date);
END $$;
REVOKE ALL ON FUNCTION documents.run_expiry(date,integer)FROM PUBLIC;
REVOKE ALL ON FUNCTION assets.run_warranty_reminders(date,integer)FROM PUBLIC;
REVOKE ALL ON FUNCTION learning.run_due_reminders(date,integer)FROM PUBLIC;
COMMIT;
