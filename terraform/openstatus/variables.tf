variable "openstatus_api_token" {
  type        = string
  description = "OpenStatus API key with write scope"
  sensitive   = true
}

variable "api_health_url" {
  type        = string
  description = "Target URL for the health check monitor"
  default     = "https://api.acme.dev/health"
}
