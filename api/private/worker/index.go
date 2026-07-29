package handler

import (
	"net/http"

	worker "growx/commandcenter/execution-worker/function"
)

func Handler(response http.ResponseWriter, request *http.Request) {
	worker.Handler(response, request)
}
