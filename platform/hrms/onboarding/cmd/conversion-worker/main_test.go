package main

import "testing"

func TestNullable(t *testing.T) {
	if nullable("") != nil {
		t.Fatal("empty optional identifier must be SQL null")
	}
	if nullable("value") != "value" {
		t.Fatal("non-empty value must be preserved")
	}
}
