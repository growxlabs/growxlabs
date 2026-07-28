-- ============================================================================
-- Grow-X Editorial Carousel Production-Grade Schema Migration
-- ============================================================================

-- 1. Editor Documents Table
CREATE TABLE IF NOT EXISTS editor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  workspace_id UUID,
  project_id UUID,

  name TEXT NOT NULL DEFAULT 'Untitled Carousel',
  description TEXT,

  document_type TEXT NOT NULL DEFAULT 'editorial_carousel',

  width INTEGER NOT NULL DEFAULT 1080,
  height INTEGER NOT NULL DEFAULT 1350,

  background JSONB NOT NULL DEFAULT '{"type": "solid", "color": "#ffffff"}',
  safe_margins JSONB NOT NULL DEFAULT '{"top": 60, "right": 72, "bottom": 70, "left": 72}',

  status TEXT NOT NULL DEFAULT 'draft',

  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,

  version INTEGER NOT NULL DEFAULT 1,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_editor_documents_org ON editor_documents(organisation_id);
CREATE INDEX IF NOT EXISTS idx_editor_documents_created_by ON editor_documents(created_by);
CREATE INDEX IF NOT EXISTS idx_editor_documents_status ON editor_documents(status);

-- 2. Editor Slides Table
CREATE TABLE IF NOT EXISTS editor_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES editor_documents(id) ON DELETE CASCADE,

  name TEXT NOT NULL DEFAULT 'Slide',
  position INTEGER NOT NULL,

  width INTEGER NOT NULL DEFAULT 1080,
  height INTEGER NOT NULL DEFAULT 1350,

  background JSONB NOT NULL DEFAULT '{"type": "solid", "color": "#ffffff"}',

  thumbnail_asset_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(document_id, position)
);

CREATE INDEX IF NOT EXISTS idx_editor_slides_doc ON editor_slides(document_id);
CREATE INDEX IF NOT EXISTS idx_editor_slides_pos ON editor_slides(document_id, position);

-- 3. Editor Layers Table
CREATE TABLE IF NOT EXISTS editor_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES editor_documents(id) ON DELETE CASCADE,
  slide_id UUID NOT NULL REFERENCES editor_slides(id) ON DELETE CASCADE,
  parent_layer_id UUID REFERENCES editor_layers(id) ON DELETE CASCADE,

  layer_type TEXT NOT NULL,
  name TEXT NOT NULL,

  position INTEGER NOT NULL DEFAULT 0,

  x NUMERIC NOT NULL DEFAULT 0,
  y NUMERIC NOT NULL DEFAULT 0,
  width NUMERIC NOT NULL DEFAULT 100,
  height NUMERIC NOT NULL DEFAULT 100,
  rotation NUMERIC NOT NULL DEFAULT 0,

  opacity NUMERIC NOT NULL DEFAULT 1,

  visible BOOLEAN NOT NULL DEFAULT true,
  locked BOOLEAN NOT NULL DEFAULT false,

  properties JSONB NOT NULL DEFAULT '{}',
  style JSONB NOT NULL DEFAULT '{}',
  constraints JSONB NOT NULL DEFAULT '{}',

  version INTEGER NOT NULL DEFAULT 1,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_editor_layers_slide ON editor_layers(slide_id);
CREATE INDEX IF NOT EXISTS idx_editor_layers_doc ON editor_layers(document_id);
CREATE INDEX IF NOT EXISTS idx_editor_layers_type ON editor_layers(layer_type);

-- 4. Editor Assets Table
CREATE TABLE IF NOT EXISTS editor_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  uploaded_by UUID NOT NULL,

  asset_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,

  storage_provider TEXT NOT NULL DEFAULT 'cloudflare-r2',
  storage_key TEXT NOT NULL UNIQUE,

  width INTEGER,
  height INTEGER,
  duration_ms INTEGER,
  file_size BIGINT NOT NULL,

  metadata JSONB NOT NULL DEFAULT '{}',
  processing_status TEXT NOT NULL DEFAULT 'completed',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_editor_assets_org ON editor_assets(organisation_id);

-- 5. Editor Versions Table
CREATE TABLE IF NOT EXISTS editor_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES editor_documents(id) ON DELETE CASCADE,

  version_number INTEGER NOT NULL,
  created_by UUID NOT NULL,

  snapshot JSONB NOT NULL,
  reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(document_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_editor_versions_doc ON editor_versions(document_id);

-- 6. Editor Operations Log Table
CREATE TABLE IF NOT EXISTS editor_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES editor_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,

  operation_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,

  payload JSONB NOT NULL,
  inverse_payload JSONB,

  client_operation_id TEXT NOT NULL,
  document_version INTEGER NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(document_id, client_operation_id)
);

CREATE INDEX IF NOT EXISTS idx_editor_ops_doc ON editor_operations(document_id);

-- 7. Editor Exports Table
CREATE TABLE IF NOT EXISTS editor_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES editor_documents(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL,

  export_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',

  options JSONB NOT NULL DEFAULT '{}',

  output_asset_id UUID REFERENCES editor_assets(id),
  progress INTEGER NOT NULL DEFAULT 0,

  error_code TEXT,
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_editor_exports_doc ON editor_exports(document_id);
CREATE INDEX IF NOT EXISTS idx_editor_exports_status ON editor_exports(status);

-- 8. Editor Permissions Table
CREATE TABLE IF NOT EXISTS editor_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES editor_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(document_id, user_id)
);

-- Enable RLS for all tables
ALTER TABLE editor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_permissions ENABLE ROW LEVEL SECURITY;

-- Allow service role bypass
CREATE POLICY service_role_all_documents ON editor_documents FOR ALL USING (true);
CREATE POLICY service_role_all_slides ON editor_slides FOR ALL USING (true);
CREATE POLICY service_role_all_layers ON editor_layers FOR ALL USING (true);
CREATE POLICY service_role_all_assets ON editor_assets FOR ALL USING (true);
CREATE POLICY service_role_all_versions ON editor_versions FOR ALL USING (true);
CREATE POLICY service_role_all_operations ON editor_operations FOR ALL USING (true);
CREATE POLICY service_role_all_exports ON editor_exports FOR ALL USING (true);
CREATE POLICY service_role_all_permissions ON editor_permissions FOR ALL USING (true);
