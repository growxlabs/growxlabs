module growx/vercel

go 1.24

require (
	growx/commandcenter/capability-service v0.0.0
	growx/commandcenter/crm-service v0.0.0
	growx/commandcenter/execution-engine v0.0.0
	growx/commandcenter/execution-worker v0.0.0
	growx/commandcenter/finance-service v0.0.0
	growx/commandcenter/hr-service v0.0.0
	growx/commandcenter/internal-api-gateway v0.0.0
	growx/commandcenter/marketing-service v0.0.0
	growx/commandcenter/project-service v0.0.0
	growx/commandcenter/skill-service v0.0.0
	growx/commandcenter/task-scheduler v0.0.0
	growx/commandcenter/tool-service v0.0.0
)

replace growx/commandcenter/capability-service => ./services/capability-service

replace growx/commandcenter/crm-service => ./services/crm-service

require (
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/pgx/v5 v5.7.5 // indirect
	github.com/jackc/puddle/v2 v2.2.2 // indirect
	golang.org/x/crypto v0.37.0 // indirect
	golang.org/x/sync v0.13.0 // indirect
	golang.org/x/text v0.24.0 // indirect
	growx/commandcenter/execution v0.0.0 // indirect
	growx/commandcenter/governance v0.0.0 // indirect
	growx/commandcenter/governance-service v0.0.0 // indirect
	growx/commandcenter/phase4 v0.0.0 // indirect
)

replace growx/commandcenter/execution-engine => ./services/execution-engine

replace growx/commandcenter/execution-worker => ./services/execution-worker

replace growx/commandcenter/finance-service => ./services/finance-service

replace growx/commandcenter/internal-api-gateway => ./services/internal-api-gateway

replace growx/commandcenter/marketing-service => ./services/marketing-service

replace growx/commandcenter/hr-service => ./services/hr-service

replace growx/commandcenter/governance-service => ./services/governance-service

replace growx/commandcenter/governance => ./packages/governance-go

replace growx/commandcenter/project-service => ./services/project-service

replace growx/commandcenter/execution => ./packages/execution-go

replace growx/commandcenter/phase4 => ./packages/phase4-go

replace growx/commandcenter/task-scheduler => ./services/task-scheduler

replace growx/commandcenter/tool-service => ./services/tool-service

replace growx/commandcenter/skill-service => ./services/skill-service
