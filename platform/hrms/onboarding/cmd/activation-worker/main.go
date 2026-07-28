package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type worker struct{db *pgxpool.Pool;peopleURL,actorID string;client *http.Client}
func main(){ctx:=context.Background();db,err:=pgxpool.New(ctx,mustEnv("DATABASE_URL"));if err!=nil{log.Fatal(err)};defer db.Close();w:=worker{db:db,peopleURL:strings.TrimRight(env("PEOPLE_SERVICE_URL","http://localhost:8081"),"/"),actorID:mustEnv("ONBOARDING_SERVICE_ACTOR_ID"),client:&http.Client{Timeout:20*time.Second}};ticker:=time.NewTicker(10*time.Second);defer ticker.Stop();log.Print("employee activation worker started");for{select{case<-ctx.Done():return;case<-ticker.C:if err=w.runOne(ctx);err!=nil{log.Printf("activation error: %v",err)}}}}
func(w worker)runOne(ctx context.Context)error{var instanceID,orgID,employeeID string;err:=w.db.QueryRow(ctx,`SELECT i.id,i.organisation_id,i.employee_id FROM onboarding.instances i JOIN onboarding.offers o ON o.id=i.offer_id WHERE i.status='completed' AND o.status='accepted' AND i.employee_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM onboarding.identity_verifications v WHERE v.instance_id=i.id AND v.status<>'verified') AND EXISTS(SELECT 1 FROM onboarding.identity_verifications v WHERE v.instance_id=i.id AND v.status='verified') AND NOT EXISTS(SELECT 1 FROM onboarding.tasks t WHERE t.instance_id=i.id AND t.required AND t.task_type='document_upload' AND NOT EXISTS(SELECT 1 FROM onboarding.task_documents d WHERE d.task_id=t.id)) AND NOT EXISTS(SELECT 1 FROM onboarding.activities a WHERE a.instance_id=i.id AND a.action='employee.activated') ORDER BY i.completed_at LIMIT 1`).Scan(&instanceID,&orgID,&employeeID);if err!=nil{return nil};version,err:=w.employeeVersion(ctx,orgID,employeeID);if err!=nil{return err};payload,_:=json.Marshal(map[string]any{"status":"active"});request,err:=http.NewRequestWithContext(ctx,http.MethodPatch,w.peopleURL+"/employees/"+employeeID+"/employment",bytes.NewReader(payload));if err!=nil{return err};request.Header.Set("Content-Type","application/json");request.Header.Set("If-Match",fmt.Sprintf("\"%d\"",version));request.Header.Set("X-Actor-Id",w.actorID);request.Header.Set("X-Organisation-Id",orgID);request.Header.Set("X-Request-Id","00000000-0000-0000-0000-000000000003");request.Header.Set("X-Permissions","employee.edit");response,err:=w.client.Do(request);if err!=nil{return err};defer response.Body.Close();if response.StatusCode>=300{body,_:=io.ReadAll(io.LimitReader(response.Body,4096));return fmt.Errorf("people activation returned %d: %s",response.StatusCode,string(body))};tx,err:=w.db.Begin(ctx);if err!=nil{return err};defer tx.Rollback(ctx);payloadAudit:=map[string]string{"status":"active"};_,err=tx.Exec(ctx,`INSERT INTO onboarding.activities(organisation_id,instance_id,entity_type,entity_id,action,actor_user_id,payload,request_id) VALUES($1,$2,'employee',$3,'employee.activated',$4,$5,'00000000-0000-0000-0000-000000000003')`,orgID,instanceID,employeeID,w.actorID,payloadAudit);if err!=nil{return err};_,err=tx.Exec(ctx,`INSERT INTO notifications.outbox(organisation_id,topic,payload) VALUES($1,'employee.activated',$2)`,orgID,map[string]any{"instanceId":instanceID,"employeeId":employeeID});if err!=nil{return err};return tx.Commit(ctx)}
func(w worker)employeeVersion(ctx context.Context,org,employee string)(int,error){request,err:=http.NewRequestWithContext(ctx,http.MethodGet,w.peopleURL+"/employees/"+employee,nil);if err!=nil{return 0,err};request.Header.Set("X-Actor-Id",w.actorID);request.Header.Set("X-Organisation-Id",org);request.Header.Set("X-Request-Id","00000000-0000-0000-0000-000000000003");request.Header.Set("X-Permissions","employee.view,employee.view_sensitive");response,err:=w.client.Do(request);if err!=nil{return 0,err};defer response.Body.Close();if response.StatusCode>=300{return 0,fmt.Errorf("people lookup returned %d",response.StatusCode)};var body struct{Version int `json:"version"`};if err=json.NewDecoder(response.Body).Decode(&body);err!=nil{return 0,err};return body.Version,nil}
func env(k,f string)string{if v:=os.Getenv(k);v!=""{return v};return f};func mustEnv(k string)string{v:=os.Getenv(k);if v==""{log.Fatalf("%s is required",k)};return v}
