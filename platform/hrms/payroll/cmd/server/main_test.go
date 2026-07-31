package main

import (
	"testing"
)

func TestSalaryCalculator(t *testing.T) {
	calc := NewSalaryCalculator()
	res := calc.CalculateMonthlySalary(50000, 25000, 25000, true, false)

	if res.GrossPay != 100000 {
		t.Errorf("expected gross pay 100000, got %f", res.GrossPay)
	}

	if res.PFEmployee != 1800 {
		t.Errorf("expected PF 1800 (12%% of 15000 cap), got %f", res.PFEmployee)
	}

	if res.NetPay >= res.GrossPay {
		t.Errorf("expected net pay to be lower than gross pay")
	}
}

func TestAIPayrollAssistantForecast(t *testing.T) {
	ai := NewAIPayrollAssistant()
	forecast := ai.ForecastCost(10)

	annual, ok := forecast["projected_annual_cost"].(float64)
	if !ok || annual <= 0 {
		t.Errorf("expected positive annual forecast cost, got %v", forecast["projected_annual_cost"])
	}
}
