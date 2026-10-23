import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

let _cachedClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_cachedClient) return _cachedClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Required Supabase server configuration is missing: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured."
    );
  }

  _cachedClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _cachedClient;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (prop === "schema") {
      return (schemaName: string) => {
        return new Proxy({}, {
          get(_st, schemaProp, schemaReceiver) {
            const client = getSupabaseAdmin();
            const schemaClient = client.schema(schemaName);
            const value = Reflect.get(schemaClient, schemaProp, schemaReceiver);
            if (typeof value === "function") {
              return value.bind(schemaClient);
            }
            return value;
          },
        });
      };
    }
    const client = getSupabaseAdmin();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
