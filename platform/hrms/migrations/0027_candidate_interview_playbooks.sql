-- Candidate interview preparation delivery. Additive and reusable by role.
BEGIN;

CREATE TABLE IF NOT EXISTS recruitment.interview_playbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id text NOT NULL DEFAULT 'org_default',
  slug text NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  role_key text NOT NULL,
  description text NOT NULL DEFAULT '',
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, slug, version)
);

CREATE TABLE IF NOT EXISTS recruitment.candidate_playbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id text NOT NULL DEFAULT 'org_default',
  candidate_id text NOT NULL,
  application_id uuid NOT NULL REFERENCES recruitment.careers_applications(id),
  interview_id uuid REFERENCES recruitment.interviews(id),
  playbook_id uuid NOT NULL REFERENCES recruitment.interview_playbooks(id),
  assigned_by text,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  opened_at timestamptz,
  last_viewed_at timestamptz,
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned','published','opened','withdrawn')),
  UNIQUE (application_id, playbook_id)
);

CREATE INDEX IF NOT EXISTS candidate_playbooks_candidate_idx ON recruitment.candidate_playbooks (organisation_id, candidate_id, status);
CREATE INDEX IF NOT EXISTS candidate_playbooks_application_idx ON recruitment.candidate_playbooks (organisation_id, application_id, status);

INSERT INTO recruitment.interview_playbooks (organisation_id, slug, title, subtitle, role_key, description, content, version, status)
VALUES ('org_default', 'business-development-executive', 'Business Development Executive Interview Playbook', 'Candidate Interview Preparation Guide', 'business_development_executive', 'A concise guide to preparing for your GrowXLabs interview.', '[
  {"heading":"Welcome","body":"We are looking forward to meeting you. Use this guide to prepare thoughtfully and bring your own perspective."},
  {"heading":"What we are looking for","body":"We look for clear communication, curiosity, commercial judgment, disciplined follow-through, and the ability to learn quickly."},
  {"heading":"Understand GrowXLabs before your interview","body":"Review what GrowXLabs builds, who we serve, and how our software, AI, and automation work helps businesses operate better."},
  {"heading":"Prepare for discovery","body":"Practice asking thoughtful questions about a prospect’s goals, current process, constraints, urgency, and definition of success."},
  {"heading":"Prepare a prospecting approach","body":"Be ready to explain how you would identify a relevant prospect, research their context, choose a channel, and earn a first conversation."},
  {"heading":"Prepare a short outreach example","body":"Bring a concise email or message that is specific to the prospect and focused on a useful business outcome rather than a generic pitch."},
  {"heading":"Prepare for a mock client conversation","body":"Listen carefully, clarify before recommending, summarize what you heard, and propose a sensible next step."},
  {"heading":"Be ready for objections","body":"Expect questions about timing, budget, trust, existing tools, and priorities. Acknowledge the concern, ask one useful follow-up, and respond honestly."},
  {"heading":"Know your numbers","body":"Understand the activity, response, meeting, conversion, and pipeline measures you would watch. Explain how numbers guide improvement."},
  {"heading":"Prepare one previous example","body":"Bring one specific example of persuasion, ownership, learning from rejection, or creating a measurable result. Explain the situation, action, and outcome."},
  {"heading":"What not to do","body":"Do not overpromise, dominate the conversation, use vague claims, or pretend to know something you do not know."},
  {"heading":"Before joining the interview","body":"Test your connection, microphone, camera, meeting link, and environment. Keep your resume and a few notes nearby."},
  {"heading":"How to approach the interview","body":"Be prepared, direct, warm, and curious. Treat the conversation as a chance to understand whether we can create value together."},
  {"heading":"Final principle","body":"Understand first. Sell second."}
]'::jsonb, 1, 'published')
ON CONFLICT (organisation_id, slug, version) DO UPDATE SET content = EXCLUDED.content, title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description, updated_at = now();

COMMIT;
