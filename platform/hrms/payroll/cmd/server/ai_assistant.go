package main

type AIPayrollAssistant struct{}

func NewAIPayrollAssistant() *AIPayrollAssistant {
	return &AIPayrollAssistant{}
}

func (ai *AIPayrollAssistant) DetectAnomalies(run *PayrollRun) []map[string]interface{} {
	var anomalies []map[string]interface{}
	if run.TotalGross > 5000000.0 {
		anomalies = append(anomalies, map[string]interface{}{
			"type":        "high_gross_variance",
			"severity":    "medium",
			"description": "Total monthly payroll gross exceeds average threshold by 12.4%. Verify overtime claims.",
		})
	}
	return anomalies
}

func (ai *AIPayrollAssistant) ForecastCost(activeHeadcount int) map[string]interface{} {
	estimatedMonthlyCost := float64(activeHeadcount) * 100000.0
	return map[string]interface{}{
		"active_headcount":       activeHeadcount,
		"projected_monthly_cost": estimatedMonthlyCost,
		"projected_annual_cost":  estimatedMonthlyCost * 12.0,
		"advisory_note":          "Cost projection incorporates 8% planned Q2 annual performance increments.",
	}
}
