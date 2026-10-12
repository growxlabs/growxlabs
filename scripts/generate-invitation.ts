import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { randomBytes, createHash } from "node:crypto";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const email = "saivarshith8284@gmail.com";
  const { data: user } = await supabase
    .schema("identity")
    .from("users")
    .select("id, organisation_id, email")
    .eq("email", email)
    .single();

  if (!user) {
    console.error("User not found in identity.users");
    return;
  }

  // Invalidate old invitations
  await supabase
    .schema("identity")
    .from("invitations")
    .update({ expires_at: new Date().toISOString(), delivery_error: "superseded_for_safe_retry" })
    .eq("user_id", user.id)
    .eq("organisation_id", user.organisation_id);

  // Generate fresh 72-hour token
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 72 * 3600000).toISOString();

  const { data: inv, error } = await supabase
    .schema("identity")
    .from("invitations")
    .insert({
      organisation_id: user.organisation_id,
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
      delivered_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create invitation:", error.message);
    return;
  }

  console.log("=== INVITATION ACTIVATION LINK GENERATED ===");
  console.log(`URL: http://localhost:3000/activate/${rawToken}`);
}

main();
