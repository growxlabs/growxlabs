package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

func main() {
	repo := NewMemoryRepository()
	ai := NewAIWorkforceAssistant()

	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"workforce"}`))
	})

	// Helpdesk Tickets
	mux.HandleFunc("GET /v1/workforce/tickets", func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-GXL-Organisation-ID")
		if orgID == "" {
			orgID = "org_default"
		}
		empID := r.URL.Query().Get("employee_id")
		tickets := repo.ListTickets(orgID, empID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"tickets": tickets})
	})

	mux.HandleFunc("POST /v1/workforce/tickets", func(w http.ResponseWriter, r *http.Request) {
		var ticket HelpdeskTicket
		if err := json.NewDecoder(r.Body).Decode(&ticket); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if ticket.OrganisationID == "" {
			ticket.OrganisationID = "org_default"
		}
		_ = repo.SaveTicket(&ticket)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ticket)
	})

	// Travel Requests
	mux.HandleFunc("GET /v1/workforce/travel", func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-GXL-Organisation-ID")
		if orgID == "" {
			orgID = "org_default"
		}
		empID := r.URL.Query().Get("employee_id")
		travels := repo.ListTravels(orgID, empID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"travels": travels})
	})

	mux.HandleFunc("POST /v1/workforce/travel", func(w http.ResponseWriter, r *http.Request) {
		var tr TravelRequest
		if err := json.NewDecoder(r.Body).Decode(&tr); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if tr.OrganisationID == "" {
			tr.OrganisationID = "org_default"
		}
		_ = repo.SaveTravel(&tr)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(tr)
	})

	// Visitor Logs
	mux.HandleFunc("GET /v1/workforce/visitors", func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-GXL-Organisation-ID")
		if orgID == "" {
			orgID = "org_default"
		}
		visitors := repo.ListVisitors(orgID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"visitors": visitors})
	})

	mux.HandleFunc("POST /v1/workforce/visitors", func(w http.ResponseWriter, r *http.Request) {
		var v VisitorLog
		if err := json.NewDecoder(r.Body).Decode(&v); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if v.OrganisationID == "" {
			v.OrganisationID = "org_default"
		}
		_ = repo.SaveVisitor(&v)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(v)
	})

	// AI Assistant
	mux.HandleFunc("POST /v1/workforce/ai/classify-ticket", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Subject     string `json:"subject"`
			Description string `json:"description"`
		}
		_ = json.NewDecoder(r.Body).Decode(&body)
		classified := ai.ClassifyTicket(body.Subject, body.Description)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(classified)
	})

	addr := env("WORKFORCE_SERVICE_ADDR", ":8089")
	server := &http.Server{
		Addr:              addr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
	}

	log.Printf("Workforce microservice listening on %s", addr)
	log.Fatal(server.ListenAndServe())
}

func env(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
