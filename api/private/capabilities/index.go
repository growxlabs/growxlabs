package handler

import (
	"net/http"

	capabilities "growx/commandcenter/capability-service/function"
)

func Handler(response http.ResponseWriter, request *http.Request) {
	capabilities.Handler(response, request)
}
