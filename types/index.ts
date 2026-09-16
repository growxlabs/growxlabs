export interface Lead {
  id?: string;
  name?: string;
  business_name: string;
  phone?: string;
  email?: string;
  website_url?: string;
  has_website?: boolean;
  instagram_followers?: number;
  linkedin_url?: string;
  google_rating?: number;
  reviews_count?: number;
  lead_score: number;
  status: 'new' | 'qualified' | 'outreach' | 'enriching' | 'enriched' | 'contacted' | 'following_up' | 'warm' | 'cold' | 'client' | 'closed';
  outreach_channel?: 'email' | 'whatsapp' | 'linkedin';
  follow_up_date?: string;
  notes?: string;
  message?: string;
  assigned_to?: string;
  assigned_to_member?: {
    name: string;
    email?: string;
    role?: string;
  };
  city?: string;
  created_at?: string;
  source?: string;
  created_by?: string;
  created_by_name?: string;
  outreach_generated?: boolean;
  outreach_sent?: boolean;
  outreach_content?: {
    whatsapp: string;
    email: string;
    call: string;
  };
}

export type OutreachStatus = Lead['status'];
