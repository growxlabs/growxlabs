package domain

import "testing"

func TestLifecycle(t *testing.T) {
	valid := [][2]State{{Purchased, Available}, {Available, Assigned}, {Assigned, Available}, {Assigned, InRepair}, {InRepair, Retired}, {Retired, Disposed}}
	for _, pair := range valid {
		if !CanTransition(pair[0], pair[1]) {
			t.Fatalf("expected %s -> %s", pair[0], pair[1])
		}
	}
	if CanTransition(Disposed, Available) {
		t.Fatal("disposed assets must be terminal")
	}
	if CanTransition(Purchased, Assigned) {
		t.Fatal("asset must be received before assignment")
	}
}
