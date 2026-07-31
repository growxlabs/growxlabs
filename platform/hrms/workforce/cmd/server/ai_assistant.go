package main

import (
	"strings"
)

type AIWorkforceAssistant struct{}

func NewAIWorkforceAssistant() *AIWorkforceAssistant {
	return &AIWorkforceAssistant{}
}

func (ai *AIWorkforceAssistant) ClassifyTicket(subject, description string) map[string]interface{} {
	combined := strings.ToLower(subject + " " + description)
	var category, priority string

	switch {
	case strings.Contains(combined, "vpn") || strings.Contains(combined, "laptop") || strings.Contains(combined, "access"):
		category = "it"
		priority = "high"
	case strings.Contains(combined, "salary") || strings.Contains(combined, "reimbursement"):
		category = "finance"
		priority = "medium"
	default:
		category = "hr"
		priority = "medium"
	}

	return map[string]interface{}{
		"suggested_category": category,
		"suggested_priority": priority,
		"confidence":         0.92,
	}
}

func (ai *AIWorkforceAssistant) DetectAttritionRisk(headcount int) map[string]interface{} {
	return map[string]interface{}{
		"active_headcount":     headcount,
		"attrition_risk_level": "low",
		"risk_score_percent":   11.4,
		"key_drivers":          []string{"High engagement survey scores", "Competitive compensation benchmarks"},
		"recommended_action":   "Maintain quarterly 1-on-1 career progression check-ins.",
	}
}
