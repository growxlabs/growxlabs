import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { supabaseAdmin } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";
import { requiredHrmsGatewayURL } from "@/lib/hrms/gateway";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const emailLower = credentials.email.toLowerCase().trim();

        // 1. Vercel-native employee identity authentication.
        let userData = null;
        let organisationId = process.env.DEFAULT_ORGANISATION_ID;
        {
          const { data: identityUsers, error: identityLookupError } = await supabaseAdmin.schema("identity").from("users")
            .select("id,organisation_id,email,display_name,password_hash,status,locked_until")
            .eq("email", emailLower).eq("status", "active").limit(10);
          if (identityLookupError) console.error("Employee identity login lookup failed.", { code: identityLookupError.code });
          for (const identityUser of identityUsers || []) {
            const locked = identityUser.locked_until && new Date(identityUser.locked_until).getTime() > Date.now();
            if (!identityUser.password_hash || locked) continue;
            const passwordValid = await bcrypt.compare(credentials.password, identityUser.password_hash);
            if (passwordValid) {
              organisationId = identityUser.organisation_id;
              userData = {
                id: identityUser.id,
                email: identityUser.email,
                name: identityUser.display_name || identityUser.email,
                role: "EMPLOYEE",
                organisation_id: identityUser.organisation_id,
                permissions: [],
              };
              await supabaseAdmin.schema("identity").from("users").update({ failed_login_count: 0, locked_until: null, updated_at: new Date().toISOString() }).eq("id", identityUser.id).eq("organisation_id", identityUser.organisation_id);
              break;
            }
          }
        }

        // 2. Dedicated Identity service remains available during migration.
        let identityURL = "";
        try {
          identityURL = requiredHrmsGatewayURL();
        } catch {
          // Credentials authentication can continue through the legacy database
          // path while the dedicated Identity service is not configured.
        }
        if (!userData && identityURL && organisationId) {
          try {
            const identityResponse = await fetch(`${identityURL.replace(/\/$/, "")}/v1/identity/sessions`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Request-Id": crypto.randomUUID() },
              body: JSON.stringify({ email: emailLower, password: credentials.password, organisationId }),
              cache: "no-store",
            });
            if (identityResponse.ok) {
              const identity = await identityResponse.json();
              userData = {
                id: identity.id,
                email: identity.email,
                name: identity.name,
                role: "IDENTITY_USER",
                organisation_id: identity.organisationId,
                permissions: identity.permissions || [],
              };
            }
          } catch (identityError) {
            console.error("Identity service login unavailable; checking legacy login.", identityError);
          }
        }

        // 3. Legacy login remains available during gradual migration.
        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", emailLower)
          .single();

        let isValid = false;
        if (!userData && user && !error) {
          isValid = await bcrypt.compare(credentials.password, user.password);
          if (isValid) {
            userData = {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
        }

        // 4. If not found or invalid in 'users', try legacy team members.
        if (!userData) {
          const { data: member, error: memberError } = await supabaseAdmin
            .from("team_members")
            .select("*")
            .eq("email", emailLower)
            .eq("is_active", true)
            .single();

          if (memberError) {
            console.error(`Database lookup error for ${emailLower}:`, memberError);
          }

          if (member && !memberError) {
            isValid = await bcrypt.compare(credentials.password, member.password_hash);

            if (isValid) {
              console.log(`Auth success: User ${emailLower} logged in successfully!`);
              userData = {
                id: member.id,
                email: member.email,
                name: member.name,
                role: member.role || "crm_agent",
                allowed_paths: member.allowed_paths || [],
              };
            }
          }
        }

        if (!userData) {
          console.warn(`Auth failure: Invalid credentials for ${emailLower}`);
          throw new Error("Invalid email or password");
        }

        return userData;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role || (account?.provider === "google" ? "CANDIDATE" : "USER");
        token.id = user.id || token.sub || `cand_${Date.now()}`;
        token.allowed_paths = user.allowed_paths || [];
        token.organisation_id = user.organisation_id || process.env.DEFAULT_ORGANISATION_ID;
        token.permissions = user.permissions || [];
        const employeeOrganisationId = user.organisation_id || process.env.DEFAULT_ORGANISATION_ID;
        if (employeeOrganisationId) {
          const { data: employeeIdentity } = await supabaseAdmin.schema("identity").from("employee_identities")
            .select("id,employee_id,workspace_status").eq("auth_user_id", user.id).eq("organisation_id", employeeOrganisationId).maybeSingle();
          if (employeeIdentity) {
            token.identityId = employeeIdentity.id;
            token.employeeId = employeeIdentity.employee_id;
            token.workspaceStatus = employeeIdentity.workspace_status;
            const { data: assignedRoles } = await supabaseAdmin.schema("identity").from("user_roles").select("role_id").eq("organisation_id", employeeOrganisationId).eq("user_id", user.id);
            const roleIds = (assignedRoles || []).map(assignment => assignment.role_id);
            if (roleIds.length) {
              const { data: grants } = await supabaseAdmin.schema("identity").from("role_permissions").select("permission_id").eq("organisation_id", employeeOrganisationId).in("role_id", roleIds);
              const permissionIds = [...new Set((grants || []).map(grant => grant.permission_id))];
              if (permissionIds.length) {
                const { data: capabilities } = await supabaseAdmin.schema("identity").from("permissions").select("key").in("id", permissionIds);
                token.permissions = [...new Set([...(token.permissions || []), ...(capabilities || []).map(capability => capability.key)])];
              }
            }
          }
        }
      }

      // Block and invalidate co-admin sessions
      if (
        token.role === "CO_ADMIN" ||
        token.email === "coadmin@growxlabs.tech" ||
        token.email === "coadmin-suspended@growxlabs.tech"
      ) {
        token.role = "CLIENT";
        token.id = "";
        token.email = "";
      }

      return token;
    },
    async session({ session, token }) {
      // Invalidate co-admin sessions
      if (
        token.role === "CO_ADMIN" ||
        session.user?.role === "CO_ADMIN" ||
        session.user?.email === "coadmin@growxlabs.tech" ||
        session.user?.email === "coadmin-suspended@growxlabs.tech"
      ) {
        session.user.id = "";
        session.user.role = "CLIENT";
        session.user.email = null;
        session.user.name = null;
        session.user.permissions = [];
        session.user.allowed_paths = [];
        return session;
      }

      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.allowed_paths = token.allowed_paths || [];
        session.user.organisation_id = token.organisation_id;
        session.user.permissions = token.permissions || [];
        session.user.identityId = token.identityId;
        session.user.employeeId = token.employeeId;
        session.user.workspaceStatus = token.workspaceStatus;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".growxlabs.tech" : undefined,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
