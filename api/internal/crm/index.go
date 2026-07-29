package handler

import (
	crm "growx/commandcenter/crm-service/function"
	"net/http"
)

func Handler(response http.ResponseWriter, request *http.Request) { crm.Handler(response, request) }
