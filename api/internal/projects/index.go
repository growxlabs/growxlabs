package handler

import (
	"net/http"

	projects "growx/commandcenter/project-service/function"
)

func Handler(response http.ResponseWriter, request *http.Request) {
	projects.Handler(response, request)
}
