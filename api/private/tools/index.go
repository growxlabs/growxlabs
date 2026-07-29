package handler

import (
	"net/http"

	tools "growx/commandcenter/tool-service/function"
)

func Handler(response http.ResponseWriter, request *http.Request) {
	tools.Handler(response, request)
}
