import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (process.env.NODE_ENV === "production" && (!supabaseUrl || !supabaseServiceKey)) {
  throw new Error("Required Supabase server configuration is missing");
}

export const supabaseAdmin = createClient(supabaseUrl || "https://placeholder-url.supabase.co", supabaseServiceKey || "placeholder-service-key");
