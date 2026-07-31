package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

func main() {
	repo := NewMemoryPlatformRepository()
	ai := NewAIOrchestrator()
	wf := NewWorkflowEngine()

	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"platform"}`))
	})

	// Workflow Definitions
	mux.HandleFunc("GET /v1/platform/workflows", func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-GXL-Organisation-ID")
		if orgID == "" {
			orgID = "org_default"
		}
		workflows := repo.ListWorkflows(orgID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"workflows": workflows})
	})

	mux.HandleFunc("POST /v1/platform/workflows", func(w http.ResponseWriter, r *http.Request) {
		var def WorkflowDefinition
		if err := json.NewDecoder(r.Body).Decode(&def); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if def.OrganisationID == "" {
			def.OrganisationID = "org_default"
		}
		_ = repo.SaveWorkflow(&def)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(def)
	})

	mux.HandleFunc("POST /v1/platform/workflows/evaluate", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Trigger string                 `json:"trigger"`
			Payload map[string]interface{} `json:"payload"`
		}
		_ = json.NewDecoder(r.Body).Decode(&req)
		res := wf.EvaluateTrigger(req.Trigger, req.Payload)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(res)
	})

	// Webhooks
	mux.HandleFunc("GET /v1/platform/webhooks", func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-GXL-Organisation-ID")
		if orgID == "" {
			orgID = "org_default"
		}
		webhooks := repo.ListWebhooks(orgID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"webhooks": webhooks})
	})

	mux.HandleFunc("POST /v1/platform/webhooks", func(w http.ResponseWriter, r *http.Request) {
		var wh WebhookSubscription
		if err := json.NewDecoder(r.Body).Decode(&wh); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if wh.OrganisationID == "" {
			wh.OrganisationID = "org_default"
		}
		_ = repo.SaveWebhook(&wh)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(wh)
	})

	// Executive AI Summary
	mux.HandleFunc("GET /v1/platform/ai/executive-summary", func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-GXL-Organisation-ID")
		if orgID == "" {
			orgID = "org_default"
		}
		summary := ai.GenerateExecutiveSummary(orgID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(summary)
	})

	addr := env("PLATFORM_SERVICE_ADDR", ":8090")
	server := &http.Server{
		Addr:              addr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
	}

	log.Printf("Platform microservice listening on %s", addr)
	log.Fatal(server.ListenAndServe())
}

func env(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
