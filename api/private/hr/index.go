package handler

import (
	"net/http"

	hr "growx/commandcenter/hr-service/function"
)

func Handler(response http.ResponseWriter, request *http.Request) {
	hr.Handler(response, request)
}
