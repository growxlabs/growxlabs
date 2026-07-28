package main

import (
	"archive/zip"
	"bytes"
	"strings"
	"testing"
)

func TestExtractDOCX(t *testing.T) {
	var buffer bytes.Buffer
	archive := zip.NewWriter(&buffer)
	document, err := archive.Create("word/document.xml")
	if err != nil {
		t.Fatal(err)
	}
	_, _ = document.Write([]byte(`<w:document xmlns:w="urn:test"><w:body><w:p><w:r><w:t>Go engineer</w:t></w:r></w:p><w:p><w:r><w:t>PostgreSQL</w:t></w:r></w:p></w:body></w:document>`))
	if err := archive.Close(); err != nil {
		t.Fatal(err)
	}
	text, err := extract(buffer.Bytes(), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(text, "Go engineer") || !strings.Contains(text, "PostgreSQL") {
		t.Fatalf("unexpected extracted text: %q", text)
	}
}

func TestExtractPlainText(t *testing.T) {
	text, err := extract([]byte("Senior platform engineer"), "text/plain")
	if err != nil || text != "Senior platform engineer" {
		t.Fatalf("text=%q err=%v", text, err)
	}
}
