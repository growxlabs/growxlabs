# Legacy proposal dependency inventory

The legacy `proposals` table was used by `/api/proposals/create`, `/api/proposals/list`, `/api/proposals/send`, `/api/proposals/[id]`, `/api/proposals/[id]/view`, and `/proposal/[id]`.

Phase 1 retires legacy create, send, public view, and arbitrary status mutation endpoints with HTTP 410. The authenticated list endpoint exposes only migration inventory metadata. Existing rows are snapshotted into `legacy_proposal_migration_inventory` and marked `needs_mapping`; they are not blindly copied because they do not reliably contain canonical assessment, client, company, deal, architecture, and scope relationships.

The `/proposal/[id]` page remains present for compatibility but receives no proposal data from the retired endpoint. A future authenticated Client Portal proposal page must consume an allowlisted canonical DTO.
