package handler

import (
	"net/http"

	scheduler "growx/commandcenter/task-scheduler/function"
)

func Handler(response http.ResponseWriter, request *http.Request) {
	scheduler.Handler(response, request)
}
