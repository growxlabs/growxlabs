package main

import "time"

type Organization struct {
	ID              string    `json:"id"`
	Name            string    `json:"name"`
	Code            string    `json:"code"`
	DefaultCurrency string    `json:"default_currency"`
	DefaultTimezone string    `json:"default_timezone"`
	CreatedAt       time.Time `json:"created_at"`
}

type WorkflowDefinition struct {
	ID             string    `json:"id"`
	OrganisationID string    `json:"organisation_id"`
	Name           string    `json:"name"`
	TriggerEvent   string    `json:"trigger_event"` // leave_requested, promotion_submitted, expense_filed
	IsActive       bool      `json:"is_active"`
	CreatedAt      time.Time `json:"created_at"`
}

type WebhookSubscription struct {
	ID             string    `json:"id"`
	OrganisationID string    `json:"organisation_id"`
	TargetURL      string    `json:"target_url"`
	Events         []string  `json:"events"`
	IsActive       bool      `json:"is_active"`
	CreatedAt      time.Time `json:"created_at"`
}

type ReportTemplate struct {
	ID             string    `json:"id"`
	OrganisationID string    `json:"organisation_id"`
	Title          string    `json:"title"`
	Module         string    `json:"module"`        // workforce, payroll, performance, learning
	ExportFormat   string    `json:"export_format"` // pdf, excel, csv
	CreatedAt      time.Time `json:"created_at"`
}

type PlatformMetric struct {
	ID          string    `json:"id"`
	ServiceName string    `json:"service_name"`
	MetricKey   string    `json:"metric_key"`
	MetricValue float64   `json:"metric_value"`
	RecordedAt  time.Time `json:"recorded_at"`
}
