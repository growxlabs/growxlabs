-- Supabase owns the storage schema. HRMS owns only this private bucket.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hrms-documents',
  'hrms-documents',
  false,
  26214400,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Browser users never receive the service-role key. All signing and metadata
-- authorization happens in the People service through StorageProvider.
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
