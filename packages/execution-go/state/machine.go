package state

import (
	"fmt"

	"growx/commandcenter/execution/contract"
)

var runTransitions = map[contract.RunStatus]map[contract.RunStatus]bool{
	contract.RunCreated:    {contract.RunValidating: true, contract.RunCancelled: true},
	contract.RunValidating: {contract.RunReady: true, contract.RunFailed: true},
	contract.RunReady:      {contract.RunQueued: true, contract.RunCancelled: true},
	contract.RunQueued:     {contract.RunRunning: true, contract.RunCancelled: true},
	contract.RunRunning:    {contract.RunWaiting: true, contract.RunSucceeded: true, contract.RunFailed: true, contract.RunTimedOut: true, contract.RunCancelling: true},
	contract.RunWaiting:    {contract.RunRunning: true, contract.RunFailed: true, contract.RunTimedOut: true, contract.RunCancelling: true},
	contract.RunCancelling: {contract.RunCancelled: true, contract.RunFailed: true},
}

var stepTransitions = map[contract.StepStatus]map[contract.StepStatus]bool{
	contract.StepPending:   {contract.StepBlocked: true, contract.StepReady: true, contract.StepCancelled: true, contract.StepSkipped: true},
	contract.StepBlocked:   {contract.StepReady: true, contract.StepCancelled: true, contract.StepSkipped: true},
	contract.StepReady:     {contract.StepQueued: true, contract.StepCancelled: true},
	contract.StepQueued:    {contract.StepClaimed: true, contract.StepCancelled: true},
	contract.StepClaimed:   {contract.StepRunning: true, contract.StepQueued: true, contract.StepCancelled: true},
	contract.StepRunning:   {contract.StepSucceeded: true, contract.StepFailed: true, contract.StepTimedOut: true, contract.StepWaiting: true, contract.StepRetryWait: true, contract.StepCancelled: true},
	contract.StepRetryWait: {contract.StepReady: true, contract.StepCancelled: true},
	contract.StepWaiting:   {contract.StepReady: true, contract.StepFailed: true, contract.StepTimedOut: true, contract.StepCancelled: true},
}

func ValidateRunTransition(from, to contract.RunStatus) error {
	if !runTransitions[from][to] {
		return fmt.Errorf("invalid run transition %q -> %q", from, to)
	}
	return nil
}

func ValidateStepTransition(from, to contract.StepStatus) error {
	if !stepTransitions[from][to] {
		return fmt.Errorf("invalid step transition %q -> %q", from, to)
	}
	return nil
}

func TerminalRun(status contract.RunStatus) bool {
	return status == contract.RunSucceeded || status == contract.RunFailed || status == contract.RunCancelled || status == contract.RunTimedOut
}

func TerminalStep(status contract.StepStatus) bool {
	return status == contract.StepSucceeded || status == contract.StepFailed || status == contract.StepCancelled || status == contract.StepSkipped || status == contract.StepTimedOut
}
