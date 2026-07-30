package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"strings"
	"time"
)

type SignedUpload struct {
	URL     string
	Method  string
	Headers map[string]string
}

// StorageProvider is the only storage dependency visible to document business
// logic. R2StorageProvider can implement this contract later without handler,
// workflow, audit, or database changes.
type StorageProvider interface {
	Name() string
	Upload(context.Context, string, io.Reader, string) error
	Download(context.Context, string) (io.ReadCloser, error)
	Delete(context.Context, string) error
	GetSignedURL(context.Context, string, time.Duration) (string, error)
	GetSignedUploadURL(context.Context, string, string, time.Duration) (SignedUpload, error)
}

type SupabaseStorageProvider struct {
	baseURL    string
	serviceKey string
	bucket     string
	client     *http.Client
}

func NewSupabaseStorageProviderFromEnv() (StorageProvider, error) {
	base, key, bucket := strings.TrimRight(os.Getenv("SUPABASE_URL"), "/"), os.Getenv("SUPABASE_SERVICE_ROLE_KEY"), os.Getenv("SUPABASE_HRMS_DOCUMENTS_BUCKET")
	if base == "" {
		base = strings.TrimRight(os.Getenv("NEXT_PUBLIC_SUPABASE_URL"), "/")
	}
	if bucket == "" {
		bucket = "hrms-documents"
	}
	if base == "" || key == "" {
		return nil, errors.New("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required")
	}
	parsed, err := url.Parse(base)
	if err != nil || parsed.Scheme != "https" && parsed.Hostname() != "localhost" {
		return nil, errors.New("Supabase URL must use HTTPS")
	}
	return &SupabaseStorageProvider{baseURL: base + "/storage/v1", serviceKey: key, bucket: bucket, client: &http.Client{Timeout: 30 * time.Second}}, nil
}
func (s *SupabaseStorageProvider) Name() string { return "supabase" }
func (s *SupabaseStorageProvider) Upload(ctx context.Context, key string, body io.Reader, contentType string) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.objectURL("object", key), body)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("x-upsert", "false")
	response, err := s.do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return storageError(response)
	}
	return nil
}
func (s *SupabaseStorageProvider) Download(ctx context.Context, key string) (io.ReadCloser, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, s.objectURL("object/authenticated", key), nil)
	if err != nil {
		return nil, err
	}
	response, err := s.do(req)
	if err != nil {
		return nil, err
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		defer response.Body.Close()
		return nil, storageError(response)
	}
	return response.Body, nil
}
func (s *SupabaseStorageProvider) Delete(ctx context.Context, key string) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, s.objectURL("object", key), nil)
	if err != nil {
		return err
	}
	response, err := s.do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return storageError(response)
	}
	return nil
}
func (s *SupabaseStorageProvider) GetSignedURL(ctx context.Context, key string, ttl time.Duration) (string, error) {
	payload, _ := json.Marshal(map[string]int64{"expiresIn": int64(ttl.Seconds())})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.objectURL("object/sign", key), bytes.NewReader(payload))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	response, err := s.do(req)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return "", storageError(response)
	}
	var result struct {
		SignedURL string `json:"signedURL"`
	}
	if err = json.NewDecoder(response.Body).Decode(&result); err != nil {
		return "", err
	}
	if result.SignedURL == "" {
		return "", errors.New("Supabase returned an empty signed URL")
	}
	if strings.HasPrefix(result.SignedURL, "http") {
		return result.SignedURL, nil
	}
	return s.baseURL + result.SignedURL, nil
}
func (s *SupabaseStorageProvider) GetSignedUploadURL(ctx context.Context, key, contentType string, _ time.Duration) (SignedUpload, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.objectURL("object/upload/sign", key), bytes.NewReader([]byte(`{}`)))
	if err != nil {
		return SignedUpload{}, err
	}
	req.Header.Set("Content-Type", "application/json")
	response, err := s.do(req)
	if err != nil {
		return SignedUpload{}, err
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return SignedUpload{}, storageError(response)
	}
	var result struct {
		URL   string `json:"url"`
		Token string `json:"token"`
	}
	if err = json.NewDecoder(response.Body).Decode(&result); err != nil {
		return SignedUpload{}, err
	}
	signed := result.URL
	if signed == "" {
		signed = s.objectURL("object/upload/sign", key)
		separator := "?"
		if strings.Contains(signed, "?") {
			separator = "&"
		}
		signed += separator + "token=" + url.QueryEscape(result.Token)
	}
	if !strings.HasPrefix(signed, "http") {
		signed = s.baseURL + signed
	}
	return SignedUpload{URL: signed, Method: http.MethodPut, Headers: map[string]string{"Content-Type": contentType}}, nil
}
func (s *SupabaseStorageProvider) objectURL(prefix, key string) string {
	clean := strings.TrimPrefix(path.Clean("/"+key), "/")
	segments := strings.Split(clean, "/")
	for i := range segments {
		segments[i] = url.PathEscape(segments[i])
	}
	return s.baseURL + "/" + prefix + "/" + url.PathEscape(s.bucket) + "/" + strings.Join(segments, "/")
}
func (s *SupabaseStorageProvider) do(req *http.Request) (*http.Response, error) {
	req.Header.Set("Authorization", "Bearer "+s.serviceKey)
	req.Header.Set("apikey", s.serviceKey)
	return s.client.Do(req)
}
func storageError(response *http.Response) error {
	body, _ := io.ReadAll(io.LimitReader(response.Body, 4096))
	return fmt.Errorf("storage request failed (%d): %s", response.StatusCode, strings.TrimSpace(string(body)))
}

var _ StorageProvider = (*SupabaseStorageProvider)(nil)
