package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"log"
	"os"
	"path/filepath"
	"sort"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	ctx := context.Background()
	db, err := pgxpool.New(ctx, mustEnv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	connection, err := db.Acquire(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer connection.Release()
	if _, err = connection.Exec(ctx, `SELECT pg_advisory_lock(721001)`); err != nil {
		log.Fatal(err)
	}
	defer connection.Exec(ctx, `SELECT pg_advisory_unlock(721001)`)
	if _, err = connection.Exec(ctx, `CREATE TABLE IF NOT EXISTS public.hrms_schema_migrations(name text PRIMARY KEY,checksum text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())`); err != nil {
		log.Fatal(err)
	}
	directory := env("HRMS_MIGRATIONS_DIR", "../migrations")
	files, err := filepath.Glob(filepath.Join(directory, "*.sql"))
	if err != nil {
		log.Fatal(err)
	}
	sort.Strings(files)
	if len(files) == 0 {
		log.Fatalf("no migrations found in %s", directory)
	}
	for _, file := range files {
		content, readErr := os.ReadFile(file)
		if readErr != nil {
			log.Fatal(readErr)
		}
		sum := sha256.Sum256(content)
		checksum := hex.EncodeToString(sum[:])
		name := filepath.Base(file)
		var existing string
		scanErr := connection.QueryRow(ctx, `SELECT checksum FROM public.hrms_schema_migrations WHERE name=$1`, name).Scan(&existing)
		if scanErr == nil {
			if existing != checksum {
				log.Fatalf("migration %s changed after application", name)
			}
			log.Printf("skip %s", name)
			continue
		}
		if !errors.Is(scanErr, pgx.ErrNoRows) {
			log.Fatal(scanErr)
		}
		tx, beginErr := connection.Begin(ctx)
		if beginErr != nil {
			log.Fatal(beginErr)
		}
		if _, execErr := tx.Exec(ctx, string(content)); execErr != nil {
			_ = tx.Rollback(ctx)
			log.Fatalf("%s failed: %v", name, execErr)
		}
		if _, recordErr := tx.Exec(ctx, `INSERT INTO public.hrms_schema_migrations(name,checksum) VALUES($1,$2)`, name, checksum); recordErr != nil {
			_ = tx.Rollback(ctx)
			log.Fatal(recordErr)
		}
		if commitErr := tx.Commit(ctx); commitErr != nil {
			log.Fatal(commitErr)
		}
		log.Printf("applied %s", name)
	}
}
func env(k, f string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return f
}
func mustEnv(k string) string {
	v := os.Getenv(k)
	if v == "" {
		log.Fatalf("%s is required", k)
	}
	return v
}
