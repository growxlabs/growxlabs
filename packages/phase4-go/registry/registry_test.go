package registry

import "testing"

func TestRegistryVersioning(t *testing.T) {
	t.Parallel()
	registry := New[Tool]()
	active := Tool{ID: "crm.leads.read", Version: "1.0.0", Status: "active"}
	if err := registry.Register(active); err != nil {
		t.Fatal(err)
	}
	if err := registry.Register(active); err == nil {
		t.Fatal("expected duplicate version rejection")
	}
	got, err := registry.Get(active.ID, "", false)
	if err != nil {
		t.Fatal(err)
	}
	if got.Version != active.Version {
		t.Fatalf("version = %q, want %q", got.Version, active.Version)
	}
}

func TestRegistryRejectsDisabled(t *testing.T) {
	t.Parallel()
	registry := New[Tool]()
	if err := registry.Register(Tool{ID: "tool", Version: "1", Status: "disabled"}); err != nil {
		t.Fatal(err)
	}
	if _, err := registry.Get("tool", "1", false); err == nil {
		t.Fatal("expected disabled definition rejection")
	}
}
