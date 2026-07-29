package handler

import (
	finance "growx/commandcenter/finance-service/function"
	"net/http"
)

func Handler(response http.ResponseWriter, request *http.Request) { finance.Handler(response, request) }
