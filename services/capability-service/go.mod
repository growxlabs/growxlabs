module growx/commandcenter/capability-service

go 1.24

require (
	growx/commandcenter/execution v0.0.0
	growx/commandcenter/phase4 v0.0.0
)

replace growx/commandcenter/execution => ../../packages/execution-go

replace growx/commandcenter/phase4 => ../../packages/phase4-go
