package main

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func testStorage(t *testing.T, handler http.HandlerFunc) *SupabaseStorageProvider {
	t.Helper()
	server := httptest.NewServer(handler)
	t.Cleanup(server.Close)
	return &SupabaseStorageProvider{baseURL: server.URL, serviceKey: "service-secret", bucket: "hrms-documents", client: server.Client()}
}
func TestSupabaseSignedDownload(t *testing.T) {
	storage := testStorage(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer service-secret" {
			t.Fatal("missing service authorization")
		}
		if !strings.Contains(r.URL.Path, "/object/sign/hrms-documents/org/employee/document.pdf") {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		io.WriteString(w, `{"signedURL":"/signed/document-token"}`)
	})
	signed, err := storage.GetSignedURL(context.Background(), "org/employee/document.pdf", 5*time.Minute)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasSuffix(signed, "/signed/document-token") {
		t.Fatalf("unexpected URL: %s", signed)
	}
}
func TestSupabaseSignedUpload(t *testing.T) {
	storage := testStorage(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Fatalf("expected POST, got %s", r.Method)
		}
		w.Header().Set("Content-Type", "application/json")
		io.WriteString(w, `{"url":"https://storage.example/upload-token"}`)
	})
	signed, err := storage.GetSignedUploadURL(context.Background(), "org/employee/file.pdf", "application/pdf", 10*time.Minute)
	if err != nil {
		t.Fatal(err)
	}
	if signed.Method != http.MethodPut || signed.Headers["Content-Type"] != "application/pdf" {
		t.Fatalf("unexpected signed upload: %#v", signed)
	}
}
func TestSupabaseDelete(t *testing.T) {
	storage := testStorage(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodDelete {
			t.Fatalf("expected DELETE")
		}
		w.WriteHeader(http.StatusOK)
	})
	if err := storage.Delete(context.Background(), "org/document.pdf"); err != nil {
		t.Fatal(err)
	}
}

var _ StorageProvider = (*SupabaseStorageProvider)(nil)
