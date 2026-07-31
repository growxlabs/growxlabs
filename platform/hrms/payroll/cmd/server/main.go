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
	calc := NewSalaryCalculator()
	ai := NewAIPayrollAssistant()

	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"payroll"}`))
	})

	// Compensation
	mux.HandleFunc("GET /v1/payroll/compensation", func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-GXL-Organisation-ID")
		if orgID == "" {
			orgID = "org_default"
		}
		empID := r.URL.Query().Get("employee_id")
		comp, _ := repo.GetCompensation(orgID, empID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(comp)
	})

	mux.HandleFunc("POST /v1/payroll/compensation", func(w http.ResponseWriter, r *http.Request) {
		var comp EmployeeCompensation
		if err := json.NewDecoder(r.Body).Decode(&comp); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if comp.OrganisationID == "" {
			comp.OrganisationID = "org_default"
		}
		_ = repo.SaveCompensation(&comp)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(comp)
	})

	// Payroll Runs & Calculations
	mux.HandleFunc("POST /v1/payroll/runs", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			OrganisationID string `json:"organisation_id"`
			EmployeeID     string `json:"employee_id"`
		}
		_ = json.NewDecoder(r.Body).Decode(&body)
		if body.OrganisationID == "" {
			body.OrganisationID = "org_default"
		}

		comp, _ := repo.GetCompensation(body.OrganisationID, body.EmployeeID)
		res := calc.CalculateMonthlySalary(comp.BasicMonthly, comp.HRAMonthly, comp.SpecialAllowance, true, true)

		run := &PayrollRun{
			OrganisationID:  body.OrganisationID,
			TotalGross:      res.GrossPay,
			TotalDeductions: res.PFEmployee + res.ESIEmployee + res.IncomeTax,
			TotalNet:        res.NetPay,
			EmployeeCount:   1,
			Status:          "approved",
		}
		_ = repo.SavePayrollRun(run)

		payslip := &Payslip{
			PayrollRunID: run.ID,
			EmployeeID:   body.EmployeeID,
			GrossPay:     res.GrossPay,
			NetPay:       res.NetPay,
		}
		_ = repo.SavePayslip(payslip)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"run":         run,
			"payslip":     payslip,
			"calculation": res,
		})
	})

	// Reimbursements
	mux.HandleFunc("GET /v1/payroll/reimbursements", func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-GXL-Organisation-ID")
		if orgID == "" {
			orgID = "org_default"
		}
		empID := r.URL.Query().Get("employee_id")
		claims := repo.ListReimbursements(orgID, empID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"reimbursements": claims})
	})

	mux.HandleFunc("POST /v1/payroll/reimbursements", func(w http.ResponseWriter, r *http.Request) {
		var claim ReimbursementClaim
		if err := json.NewDecoder(r.Body).Decode(&claim); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if claim.OrganisationID == "" {
			claim.OrganisationID = "org_default"
		}
		_ = repo.SaveReimbursement(&claim)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(claim)
	})

	// AI Assistant
	mux.HandleFunc("POST /v1/payroll/ai/forecast", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Headcount int `json:"headcount"`
		}
		_ = json.NewDecoder(r.Body).Decode(&body)
		if body.Headcount == 0 {
			body.Headcount = 25
		}
		forecast := ai.ForecastCost(body.Headcount)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(forecast)
	})

	addr := env("PAYROLL_SERVICE_ADDR", ":8088")
	server := &http.Server{
		Addr:              addr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
	}

	log.Printf("Payroll microservice listening on %s", addr)
	log.Fatal(server.ListenAndServe())
}

func env(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
