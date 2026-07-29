package handler

import (
	"net/http"

	execution "growx/commandcenter/execution-engine/function"
)

func Handler(response http.ResponseWriter, request *http.Request) {
	execution.Handler(response, request)
}
