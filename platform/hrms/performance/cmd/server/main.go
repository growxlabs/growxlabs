package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

func main() {
	repo := NewMemoryRepository()
	ai := NewAIAssistant()

	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"performance"}`))
	})

	// Config
	mux.HandleFunc("GET /v1/performance/config", func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-GXL-Organisation-ID")
		if orgID == "" {
			orgID = "org_default"
		}
		cfg, _ := repo.GetConfig(orgID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(cfg)
	})

	mux.HandleFunc("POST /v1/performance/config", func(w http.ResponseWriter, r *http.Request) {
		var cfg PerformanceConfig
		if err := json.NewDecoder(r.Body).Decode(&cfg); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_ = repo.SaveConfig(&cfg)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(cfg)
	})

	// Goals (OKRs, KPIs, KRAs, Dept, Business, Project, Personal)
	mux.HandleFunc("GET /v1/performance/goals", func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-GXL-Organisation-ID")
		if orgID == "" {
			orgID = "org_default"
		}
		empID := r.URL.Query().Get("employee_id")
		goals := repo.ListGoals(orgID, empID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"goals": goals})
	})

	mux.HandleFunc("POST /v1/performance/goals", func(w http.ResponseWriter, r *http.Request) {
		var goal Goal
		if err := json.NewDecoder(r.Body).Decode(&goal); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if goal.OrganisationID == "" {
			goal.OrganisationID = "org_default"
		}
		_ = repo.SaveGoal(&goal)

		// Record in Performance Timeline
		_ = repo.AddTimelineEvent(&PerformanceTimelineEvent{
			OrganisationID: goal.OrganisationID,
			EmployeeID:     goal.EmployeeID,
			EventType:      "goals_created",
			Title:          fmt.Sprintf("Goal Created: %s", goal.Title),
		})

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(goal)
	})

	// Performance Reviews
	mux.HandleFunc("GET /v1/performance/reviews", func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-GXL-Organisation-ID")
		if orgID == "" {
			orgID = "org_default"
		}
		empID := r.URL.Query().Get("employee_id")
		reviews := repo.ListReviews(orgID, empID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"reviews": reviews})
	})

	mux.HandleFunc("POST /v1/performance/reviews", func(w http.ResponseWriter, r *http.Request) {
		var review PerformanceReview
		if err := json.NewDecoder(r.Body).Decode(&review); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if review.OrganisationID == "" {
			review.OrganisationID = "org_default"
		}
		_ = repo.SaveReview(&review)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(review)
	})

	// AI Assistant
	mux.HandleFunc("POST /v1/performance/ai/smart-goals", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			RoleTitle string `json:"role_title"`
		}
		_ = json.NewDecoder(r.Body).Decode(&body)
		goals := ai.GenerateSMARTGoals(body.RoleTitle)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"smart_goals": goals})
	})

	mux.HandleFunc("POST /v1/performance/ai/compensation-advice", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Rating float64 `json:"rating"`
		}
		_ = json.NewDecoder(r.Body).Decode(&body)
		advice := ai.RecommendCompensation(body.Rating)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(advice)
	})

	// Employee Performance Timeline
	mux.HandleFunc("GET /v1/performance/timeline", func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-GXL-Organisation-ID")
		if orgID == "" {
			orgID = "org_default"
		}
		empID := r.URL.Query().Get("employee_id")
		events := repo.GetTimeline(orgID, empID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"timeline": events})
	})

	addr := env("PERFORMANCE_SERVICE_ADDR", ":8087")
	server := &http.Server{
		Addr:              addr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
	}

	log.Printf("Performance microservice listening on %s", addr)
	log.Fatal(server.ListenAndServe())
}

func env(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
