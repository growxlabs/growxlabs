import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { randomBytes, createHash } from "node:crypto";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const targetEmail = (process.argv[2] || "saivarshith8284@gmail.com").trim().toLowerCase();
  const targetName = process.argv[3] || "Healthcare Specialist";

  console.log(`\n======================================================`);
  console.log(`Generating Invitation for: ${targetEmail}`);
  console.log(`======================================================`);

  // 1. Check if user exists in identity.users
  let { data: user } = await supabase
    .schema("identity")
    .from("users")
    .select("id, organisation_id, email")
    .eq("email", targetEmail)
    .maybeSingle();

  let orgId = user?.organisation_id;

  if (!orgId) {
    // Fetch default orgId from any existing organisation or user
    const { data: anyUser } = await supabase
      .schema("identity")
      .from("users")
      .select("organisation_id")
      .not("organisation_id", "is", null)
      .limit(1)
      .single();

    orgId = anyUser?.organisation_id || "8e7d6c54-68f1-4d19-9bf5-c20fe6c37721";
  }

  // If user doesn't exist yet, provision employee & identity records
  if (!user) {
    console.log(`User not found in identity.users. Provisioning new employee record...`);
    const nameParts = targetName.split(" ");
    const firstName = nameParts[0] || "Employee";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Insert into identity.users
    const { data: newUser, error: userError } = await supabase
      .schema("identity")
      .from("users")
      .insert({
        organisation_id: orgId,
        email: targetEmail,
        display_name: targetName,
        status: "invited",
        invited_at: new Date().toISOString(),
      })
      .select("id, organisation_id, email")
      .single();

    if (userError || !newUser) {
      console.error("Failed to provision identity.users:", userError?.message);
      return;
    }
    user = newUser;

    // Check if designation exists
    let { data: desig } = await supabase
      .schema("people")
      .from("designations")
      .select("id")
      .eq("organisation_id", orgId)
      .ilike("name", "Healthcare Lead Manager")
      .maybeSingle();

    if (!desig) {
      const { data: newDesig } = await supabase
        .schema("people")
        .from("designations")
        .insert({
          organisation_id: orgId,
          name: "Healthcare Lead Manager",
        })
        .select("id")
        .single();
      desig = newDesig;
    }

    // Insert into people.employees
    const { data: emp, error: empError } = await supabase
      .schema("people")
      .from("employees")
      .insert({
        organisation_id: orgId,
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        employee_number: `EMP-${Date.now().toString().slice(-4)}`,
      })
      .select("id")
      .single();

    if (empError || !emp) {
      console.error("Failed to provision people.employees:", empError?.message);
      return;
    }

    // Find Sales department
    const { data: dept } = await supabase
      .schema("people")
      .from("departments")
      .select("id")
      .eq("organisation_id", orgId)
      .ilike("name", "Sales")
      .maybeSingle();

    // Insert employment record
    await supabase
      .schema("people")
      .from("employment_records")
      .insert({
        organisation_id: orgId,
        employee_id: emp.id,
        status: "active",
        joining_date: new Date().toISOString().split("T")[0],
        department_id: dept?.id || null,
        designation_id: desig?.id || null,
      });

    // Insert employee_identity
    await supabase
      .schema("identity")
      .from("employee_identities")
      .insert({
        organisation_id: orgId,
        auth_user_id: user.id,
        employee_id: emp.id,
        email: targetEmail,
        identity_type: "employee",
        workspace_status: "pending",
      });

    // Assign workspace role
    const { data: role } = await supabase
      .schema("identity")
      .from("roles")
      .select("id")
      .eq("organisation_id", orgId)
      .ilike("name", "%Business Development%")
      .maybeSingle();

    if (role) {
      await supabase
        .schema("identity")
        .from("user_roles")
        .insert({
          organisation_id: orgId,
          user_id: user.id,
          role_id: role.id,
        });
    }
  }

  // 2. Invalidate any old/expired invitations for this user
  await supabase
    .schema("identity")
    .from("invitations")
    .update({ expires_at: new Date().toISOString(), delivery_error: "superseded_for_safe_retry" })
    .eq("user_id", user.id)
    .eq("organisation_id", orgId);

  // 3. Generate fresh 72-hour cryptographic token
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 72 * 3600000).toISOString();

  const { error: invError } = await supabase
    .schema("identity")
    .from("invitations")
    .insert({
      organisation_id: orgId,
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
      delivered_at: new Date().toISOString(),
    });

  if (invError) {
    console.error("Failed to create invitation:", invError.message);
    return;
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const activationUrl = `${baseUrl}/activate/${rawToken}`;
  const prodUrl = `https://growxlabs.tech/activate/${rawToken}`;

  console.log(`\nSUCCESS! Private activation token created (Valid for 72 hours).`);
  console.log(`\nLocal Activation Link:\n  ${activationUrl}`);
  console.log(`\nProduction Activation Link:\n  ${prodUrl}`);
  console.log(`\n------------------------------------------------------`);
  console.log(`How the employee uses this:`);
  console.log(`1. Send the private link above to the employee.`);
  console.log(`2. They open the link and create their password (at least 12 characters).`);
  console.log(`3. Once activated, they sign in at: ${baseUrl}/login`);
  console.log(`4. Upon sign in, they are immediately redirected to their Healthcare Lead Manager Workspace:`);
  console.log(`   ${baseUrl}/workspace/h`);
  console.log(`======================================================\n`);
}

main();
