package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestActorFromRejectsPartialIdentity(t *testing.T) {
	request:=httptest.NewRequest(http.MethodGet,"/roles",nil)
	request.Header.Set("X-Actor-Id","2f07c0a7-e3b4-4269-aa2a-4153a9345df8")
	if _,err:=actorFrom(request);err==nil{t.Fatal("expected missing organisation and request ID error")}
}

func TestActorFromDoesNotInferAdminRole(t *testing.T) {
	request:=httptest.NewRequest(http.MethodGet,"/roles",nil)
	request.Header.Set("X-Actor-Id","934a2832-6b3b-4371-b434-944aeac6ba23")
	request.Header.Set("X-Organisation-Id","387f3951-9273-4ec4-bb1d-b726296465dd")
	request.Header.Set("X-Request-Id","108b00ea-b9c8-47ac-8ea5-0548260df927")
	request.Header.Set("X-Role","ADMIN")
	ac,err:=actorFrom(request);if err!=nil{t.Fatal(err)}
	if ac.Permissions["organisation.manage"]{t.Fatal("legacy ADMIN role must not grant database permission")}
}
