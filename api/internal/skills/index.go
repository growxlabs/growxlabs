package handler

import (
	"net/http"

	skills "growx/commandcenter/skill-service/function"
)

func Handler(response http.ResponseWriter, request *http.Request) {
	skills.Handler(response, request)
}
