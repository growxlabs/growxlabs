terraform {
  required_version = ">= 1.5.0"

  required_providers {
    openstatus = {
      source  = "openstatusHQ/openstatus"
      version = "~> 0.4.0"
    }
  }
}

provider "openstatus" {
  api_token = var.openstatus_api_token
}

resource "openstatus_http_monitor" "api" {
  name        = "api-health"
  url         = var.api_health_url
  periodicity = "5m"
  active      = true
  regions     = ["fly-ams", "fly-iad", "fly-syd"]
}
