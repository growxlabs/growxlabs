module growx/commandcenter/internal-api-gateway

go 1.24

require growx/commandcenter/execution v0.0.0

require growx/commandcenter/governance-service v0.0.0

require growx/commandcenter/governance v0.0.0 // indirect

require growx/commandcenter/phase4 v0.0.0 // indirect

require (
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/pgx/v5 v5.7.5 // indirect
	github.com/jackc/puddle/v2 v2.2.2 // indirect
	golang.org/x/crypto v0.37.0 // indirect
	golang.org/x/sync v0.13.0 // indirect
	golang.org/x/text v0.24.0 // indirect
)

replace growx/commandcenter/execution => ../../packages/execution-go

replace growx/commandcenter/governance-service => ../governance-service

replace growx/commandcenter/governance => ../../packages/governance-go

replace growx/commandcenter/phase4 => ../../packages/phase4-go
