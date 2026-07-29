package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"time"
)

type Claims struct {
	Issuer    string `json:"iss"`
	Audience  string `json:"aud"`
	Service   string `json:"service"`
	Env       string `json:"env"`
	RequestID string `json:"requestId"`
	IssuedAt  int64  `json:"iat"`
	ExpiresAt int64  `json:"exp"`
}

func Sign(claims Claims, secret string) (string, error) {
	if secret == "" {
		return "", errors.New("service token secret is required")
	}
	header, err := json.Marshal(map[string]string{"alg": "HS256", "typ": "JWT"})
	if err != nil {
		return "", err
	}
	payload, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}
	unsigned := base64.RawURLEncoding.EncodeToString(header) + "." +
		base64.RawURLEncoding.EncodeToString(payload)
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(unsigned))
	return unsigned + "." + base64.RawURLEncoding.EncodeToString(mac.Sum(nil)), nil
}

func Verify(token, secret, issuer, audience, environment string, now time.Time) (Claims, error) {
	var claims Claims
	parts := strings.Split(token, ".")
	if len(parts) != 3 || secret == "" {
		return claims, errors.New("invalid service token")
	}
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(parts[0] + "." + parts[1]))
	expected := mac.Sum(nil)
	signature, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil || !hmac.Equal(signature, expected) {
		return claims, errors.New("invalid service token signature")
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil || json.Unmarshal(payload, &claims) != nil {
		return claims, errors.New("invalid service token claims")
	}
	if claims.Issuer != issuer || claims.Audience != audience || claims.Env != environment {
		return claims, errors.New("service token scope mismatch")
	}
	unix := now.Unix()
	if claims.ExpiresAt <= unix || claims.IssuedAt > unix+30 || claims.ExpiresAt-claims.IssuedAt > 300 {
		return claims, errors.New("service token expired or lifetime invalid")
	}
	return claims, nil
}
