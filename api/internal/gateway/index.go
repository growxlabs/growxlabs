package handler

import (
	"net/http"

	gateway "growx/commandcenter/internal-api-gateway/function"
)

func Handler(response http.ResponseWriter, request *http.Request) {
	gateway.Handler(response, request)
}
