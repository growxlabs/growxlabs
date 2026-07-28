package main

import "testing"

func TestValidateDocumentFile(t *testing.T) {
	checksum := "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
	if err := validateDocumentFile("passport.pdf", "application/pdf", checksum, 1024); err != nil {
		t.Fatalf("expected valid document: %v", err)
	}
	for _, test := range []struct {
		name, mime, checksum string
		size                 int64
	}{
		{"", "application/pdf", checksum, 1},
		{"file.exe", "application/octet-stream", checksum, 1},
		{"file.pdf", "application/pdf", "bad", 1},
		{"file.pdf", "application/pdf", checksum, 26 << 20},
	} {
		if err := validateDocumentFile(test.name, test.mime, test.checksum, test.size); err == nil {
			t.Fatalf("expected validation failure for %#v", test)
		}
	}
}

func TestSafeObjectNamePreservesSafeExtension(t *testing.T) {
	name := safeObjectName("Identity.PDF")
	if len(name) < 5 || name[len(name)-4:] != ".pdf" {
		t.Fatalf("expected lowercase extension, got %q", name)
	}
}
