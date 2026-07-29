package contract

import (
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
)

const (
	maxSteps       = 50
	maxInputBytes  = 64_000
	maxTimeoutMS   = 300_000
	maxAttempts    = 5
	requiredPlanV1 = "gxl.execution-plan.v1"
)

var uuidPattern = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$`)

func ValidatePlan(plan Plan) error {
	if !uuidPattern.MatchString(plan.ID) || plan.Version != requiredPlanV1 || plan.RequestID == "" ||
		plan.OrganisationID == "" || plan.WorkspaceID == "" || plan.UserID == "" ||
		plan.AgentID == "" || plan.CapabilityID == "" {
		return errors.New("plan identity, version, and trusted scope are required")
	}
	if len(plan.Steps) == 0 || len(plan.Steps) > maxSteps {
		return fmt.Errorf("plan must contain between 1 and %d steps", maxSteps)
	}
	steps := make(map[string]Step, len(plan.Steps))
	for index, step := range plan.Steps {
		if !uuidPattern.MatchString(step.ID) || step.Index != index {
			return errors.New("step IDs must be unique and indexes contiguous")
		}
		if _, exists := steps[step.ID]; exists {
			return fmt.Errorf("duplicate step ID %q", step.ID)
		}
		if step.TimeoutMS < 100 || step.TimeoutMS > maxTimeoutMS {
			return fmt.Errorf("step %q timeout is outside policy", step.ID)
		}
		if step.RetryPolicy.MaxAttempts < 1 || step.RetryPolicy.MaxAttempts > maxAttempts {
			return fmt.Errorf("step %q retry count is outside policy", step.ID)
		}
		if len(step.Input) > maxInputBytes || !json.Valid(step.Input) {
			return fmt.Errorf("step %q input is invalid or too large", step.ID)
		}
		switch step.Type {
		case "tool":
			if step.ToolID == "" {
				return fmt.Errorf("tool step %q has no tool ID", step.ID)
			}
		case "model", "transform", "decision", "wait":
		default:
			return fmt.Errorf("step %q has unsupported type %q", step.ID, step.Type)
		}
		steps[step.ID] = step
	}
	visiting := make(map[string]bool, len(steps))
	visited := make(map[string]bool, len(steps))
	var visit func(string) error
	visit = func(id string) error {
		if visiting[id] {
			return errors.New("plan contains a dependency cycle")
		}
		if visited[id] {
			return nil
		}
		visiting[id] = true
		for _, dependency := range steps[id].DependsOn {
			if dependency == id {
				return fmt.Errorf("step %q depends on itself", id)
			}
			if _, exists := steps[dependency]; !exists {
				return fmt.Errorf("step %q has unknown dependency %q", id, dependency)
			}
			if err := visit(dependency); err != nil {
				return err
			}
		}
		visiting[id] = false
		visited[id] = true
		return nil
	}
	for id := range steps {
		if err := visit(id); err != nil {
			return err
		}
	}
	return nil
}
