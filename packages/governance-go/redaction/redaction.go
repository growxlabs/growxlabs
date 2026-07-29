package redaction

import (
	"encoding/json"
	"strings"
)

var sensitiveKeys = map[string]string{
	"email": "email", "phone": "phone", "address": "address", "government_id": "government_id",
	"bank_account": "bank", "routing_number": "bank", "salary": "salary", "access_token": "secret",
	"api_key": "secret", "service_credential": "secret", "password": "secret", "secret": "secret",
	"disciplinary_notes": "private_hr", "credit_information": "private_finance",
}

func Object(value map[string]any, classification string) map[string]any {
	result := make(map[string]any, len(value))
	for key, item := range value {
		normalised := strings.ToLower(strings.ReplaceAll(key, "-", "_"))
		if _, sensitive := sensitiveKeys[normalised]; sensitive || classification == "highly_restricted" {
			result[key] = "[REDACTED]"
			continue
		}
		switch typed := item.(type) {
		case map[string]any:
			result[key] = Object(typed, classification)
		case []any:
			items := make([]any, len(typed))
			for index, nested := range typed {
				if object, ok := nested.(map[string]any); ok {
					items[index] = Object(object, classification)
				} else {
					items[index] = nested
				}
			}
			result[key] = items
		default:
			result[key] = item
		}
	}
	return result
}

func JSON(payload json.RawMessage, classification string) (json.RawMessage, error) {
	var value map[string]any
	if err := json.Unmarshal(payload, &value); err != nil {
		return nil, err
	}
	return json.Marshal(Object(value, classification))
}
