package servicekit

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// OpenPostgresPool creates a conservative pool suitable for cold-started
// serverless functions. Warm invocations may reuse it, but correctness never
// depends on the instance remaining alive.
func OpenPostgresPool(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, err
	}
	config.MaxConns, config.MinConns = 3, 0
	config.MaxConnLifetime = 5 * time.Minute
	config.MaxConnIdleTime = 30 * time.Second
	config.HealthCheckPeriod = 30 * time.Second
	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}
	return pool, nil
}
