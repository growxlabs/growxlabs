package handler

import (
	marketing "growx/commandcenter/marketing-service/function"
	"net/http"
)

func Handler(response http.ResponseWriter, request *http.Request) {
	marketing.Handler(response, request)
}
