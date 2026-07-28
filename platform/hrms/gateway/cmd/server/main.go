package main

import (
	"bytes"
	"crypto/rand"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

type limiter struct {
	mu sync.Mutex
	hits map[string][]time.Time
	limit int
	window time.Duration
	redisURL string
	redisToken string
	client *http.Client
}

func main() {
	people := mustURL(env("PEOPLE_SERVICE_URL", "http://localhost:8081"))
	identity := mustURL(env("IDENTITY_SERVICE_URL", "http://localhost:8082"))
	recruitment := mustURL(env("RECRUITMENT_SERVICE_URL", "http://localhost:8083"))
	onboarding := mustURL(env("ONBOARDING_SERVICE_URL", "http://localhost:8084"))
	rateLimit := &limiter{hits:map[string][]time.Time{},limit:120,window:time.Minute,redisURL:strings.TrimRight(os.Getenv("UPSTASH_REDIS_REST_URL"),"/"),redisToken:os.Getenv("UPSTASH_REDIS_REST_TOKEN"),client:&http.Client{Timeout:2*time.Second}}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) { w.Write([]byte("ok")) })
	mux.Handle("/v1/people/", secured(proxy(people, "/v1/people")))
	mux.Handle("/v1/identity/invitations/", proxy(identity, "/v1/identity"))
	mux.Handle("/v1/identity/sessions", proxy(identity, "/v1/identity"))
	mux.Handle("/v1/identity/bootstrap", proxy(identity, "/v1/identity"))
	mux.Handle("/v1/identity/", secured(proxy(identity, "/v1/identity")))
	mux.Handle("/v1/recruitment/public/", proxy(recruitment, "/v1/recruitment"))
	mux.Handle("/v1/recruitment/", secured(proxy(recruitment, "/v1/recruitment")))
	mux.Handle("/v1/onboarding/public/", proxy(onboarding, "/v1/onboarding"))
	mux.Handle("/v1/onboarding/", secured(proxy(onboarding, "/v1/onboarding")))
	server := &http.Server{Addr: env("HRMS_GATEWAY_ADDR", ":8080"), Handler: requestContext(rateLimit.wrap(mux)), ReadHeaderTimeout: 5 * time.Second, ReadTimeout:15*time.Second, WriteTimeout:30*time.Second}
	log.Printf("HRMS gateway listening on %s", server.Addr)
	log.Fatal(server.ListenAndServe())
}

func (l *limiter) wrap(next http.Handler)http.Handler{
	return http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){
		key:=r.Header.Get("X-Actor-Id");if key==""{key=r.RemoteAddr}
		if l.redisURL!=""&&l.redisToken!=""{allowed,err:=l.allowRedis(r,key);if err==nil{if !allowed{w.Header().Set("Retry-After","60");http.Error(w,`{"error":"rate_limited"}`,http.StatusTooManyRequests);return};next.ServeHTTP(w,r);return}}
		now:=time.Now();cutoff:=now.Add(-l.window);l.mu.Lock();recent:=l.hits[key][:0]
		for _,hit:=range l.hits[key]{if hit.After(cutoff){recent=append(recent,hit)}}
		if len(recent)>=l.limit{l.hits[key]=recent;l.mu.Unlock();w.Header().Set("Retry-After","60");http.Error(w,`{"error":"rate_limited"}`,http.StatusTooManyRequests);return}
		l.hits[key]=append(recent,now);l.mu.Unlock();next.ServeHTTP(w,r)
	})
}
func(l *limiter)allowRedis(r *http.Request,key string)(bool,error){
	window:=time.Now().Unix()/int64(l.window.Seconds());redisKey:="hrms:ratelimit:"+key+":"+strconv.FormatInt(window,10)
	body,_:=json.Marshal([][]any{{"INCR",redisKey},{"EXPIRE",redisKey,int(l.window.Seconds()),"NX"}})
	request,err:=http.NewRequestWithContext(r.Context(),http.MethodPost,l.redisURL+"/pipeline",bytes.NewReader(body));if err!=nil{return false,err}
	request.Header.Set("Authorization","Bearer "+l.redisToken);request.Header.Set("Content-Type","application/json")
	response,err:=l.client.Do(request);if err!=nil{return false,err};defer response.Body.Close();if response.StatusCode<200||response.StatusCode>=300{return false,fmt.Errorf("redis returned %d",response.StatusCode)}
	var result []struct{Result int `json:"result"`};if err=json.NewDecoder(response.Body).Decode(&result);err!=nil{return false,err};if len(result)==0{return false,errors.New("empty redis response")};return result[0].Result<=l.limit,nil
}

func proxy(target *url.URL, prefix string) http.Handler {
	p := httputil.NewSingleHostReverseProxy(target)
	original := p.Director
	p.Director = func(r *http.Request) {
		original(r)
		r.URL.Path = strings.TrimPrefix(r.URL.Path, prefix)
		if r.URL.Path == "" { r.URL.Path = "/" }
	}
	return p
}

// Production auth middleware replaces trusted headers with claims from the signed
// session token. Downstream services independently enforce the permission list.
func secured(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		expected:=os.Getenv("HRMS_BFF_SHARED_SECRET")
		provided:=r.Header.Get("X-HRMS-BFF-Token")
		if expected==""||len(expected)!=len(provided)||subtle.ConstantTimeCompare([]byte(expected),[]byte(provided))!=1{
			http.Error(w,`{"error":"untrusted_gateway_client"}`,http.StatusUnauthorized)
			return
		}
		r.Header.Del("X-HRMS-BFF-Token")
		if r.Header.Get("X-Actor-Id") == "" || r.Header.Get("X-Organisation-Id") == "" {
			http.Error(w, `{"error":"unauthenticated"}`, http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func requestContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-Request-Id") == "" { r.Header.Set("X-Request-Id", requestID()) }
		w.Header().Set("X-Request-Id", r.Header.Get("X-Request-Id"))
		w.Header().Set("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}

func requestID() string { b := make([]byte, 16); _, _ = rand.Read(b); return hex.EncodeToString(b) }
func env(k, fallback string) string { if v := os.Getenv(k); v != "" { return v }; return fallback }
func mustURL(v string) *url.URL { u, err := url.Parse(v); if err != nil { panic(err) }; return u }
