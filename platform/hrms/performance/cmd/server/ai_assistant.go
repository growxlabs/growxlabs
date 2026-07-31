package main

import (
	"fmt"
	"strings"
)

type AIAssistant struct{}

func NewAIAssistant() *AIAssistant {
	return &AIAssistant{}
}

func (ai *AIAssistant) GenerateSMARTGoals(roleTitle string) []string {
	return []string{
		fmt.Sprintf("Increase %s project delivery velocity by 15%% in Q1 2026", roleTitle),
		fmt.Sprintf("Achieve 98%% automated test coverage across %s core services", roleTitle),
		"Complete 2 cross-functional architecture reviews with zero critical security vulnerabilities",
	}
}

func (ai *AIAssistant) SummarizeReview(selfComments, managerComments string) string {
	return fmt.Sprintf("AI Summary (Advisory): Performance demonstrates strong technical execution. Key strengths highlighted in manager notes (%s). Alignment with self-assessment (%s).",
		strings.TrimSpace(managerComments), strings.TrimSpace(selfComments))
}

func (ai *AIAssistant) DetectBias(text string) map[string]interface{} {
	lowered := strings.ToLower(text)
	hasGenderedTerms := strings.Contains(lowered, "aggressive") || strings.Contains(lowered, "emotional")
	return map[string]interface{}{
		"bias_detected":    hasGenderedTerms,
		"confidence_score": 0.85,
		"advisory_note":    "Check for subjective gendered or personality-focused phrasing. Prefer objective KPI metrics.",
	}
}

func (ai *AIAssistant) RecommendCompensation(rating float64) map[string]interface{} {
	var recType string
	var incrementPercent float64

	switch {
	case rating >= 4.5:
		recType = "Promotion & Outstanding Bonus"
		incrementPercent = 15.0
	case rating >= 3.5:
		recType = "Merit Salary Increment"
		incrementPercent = 10.0
	case rating >= 2.5:
		recType = "Standard Adjustment"
		incrementPercent = 5.0
	default:
		recType = "Performance Improvement Plan (PIP)"
		incrementPercent = 0.0
	}

	return map[string]interface{}{
		"rating":                   rating,
		"advisory_recommendation":  recType,
		"suggested_increment_pct":  incrementPercent,
		"human_approval_mandatory": true,
	}
}
