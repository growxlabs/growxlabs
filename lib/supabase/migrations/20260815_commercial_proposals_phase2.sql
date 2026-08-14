BEGIN;
ALTER TABLE public.commercial_document_versions ADD COLUMN IF NOT EXISTS superseded_at TIMESTAMPTZ;
ALTER TABLE public.commercial_proposals ADD COLUMN IF NOT EXISTS communication_message_id UUID REFERENCES public.communication_messages(id) ON DELETE SET NULL;
ALTER TABLE public.commercial_proposals ADD COLUMN IF NOT EXISTS rejected_by_user_id UUID;
ALTER TABLE public.commercial_proposals ADD COLUMN IF NOT EXISTS rejected_by_name TEXT;
ALTER TABLE public.commercial_proposals ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE public.commercial_proposals ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE TABLE IF NOT EXISTS public.proposal_internal_reviews (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), proposal_id UUID NOT NULL REFERENCES public.commercial_proposals(id) ON DELETE RESTRICT,
 proposal_version INTEGER NOT NULL, reviewer_id UUID, decision TEXT NOT NULL CHECK(decision IN ('submitted','approved','changes_required')),
 comment TEXT, decided_at TIMESTAMPTZ NOT NULL DEFAULT now(), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.proposal_change_requests (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), proposal_id UUID NOT NULL REFERENCES public.commercial_proposals(id) ON DELETE RESTRICT,
 proposal_version_id UUID NOT NULL REFERENCES public.commercial_document_versions(id) ON DELETE RESTRICT,
 requested_by_user_id UUID NOT NULL, requested_by_name TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'other', feedback TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved','cancelled')), requested_at TIMESTAMPTZ NOT NULL DEFAULT now(), resolved_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS public.proposal_acceptances (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), proposal_id UUID NOT NULL REFERENCES public.commercial_proposals(id) ON DELETE RESTRICT,
 proposal_version_id UUID NOT NULL REFERENCES public.commercial_document_versions(id) ON DELETE RESTRICT,
 accepted_by_user_id UUID NOT NULL, accepted_by_name TEXT NOT NULL, accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(), content_hash TEXT NOT NULL,
 acknowledgement TEXT NOT NULL, request_metadata JSONB NOT NULL DEFAULT '{}', UNIQUE(proposal_id), UNIQUE(proposal_version_id)
);
CREATE INDEX IF NOT EXISTS proposal_change_requests_open_idx ON public.proposal_change_requests(proposal_id,status,requested_at DESC);
CREATE INDEX IF NOT EXISTS proposal_reviews_idx ON public.proposal_internal_reviews(proposal_id,created_at DESC);
ALTER TABLE public.proposal_internal_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_acceptances ENABLE ROW LEVEL SECURITY;
COMMIT;
