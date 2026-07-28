import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseAdmin } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const emailLower = credentials.email.toLowerCase().trim();

        // 1. New service-oriented Identity foundation.
        let userData = null;
        const identityURL = process.env.HRMS_GATEWAY_URL;
        const organisationId = process.env.DEFAULT_ORGANISATION_ID;
        if (identityURL && organisationId) {
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

        // 2. Legacy login remains available during gradual migration.
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

        // 3. If not found or invalid in 'users', try legacy team members.
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
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.allowed_paths = user.allowed_paths || [];
        token.organisation_id = user.organisation_id;
        token.permissions = user.permissions || [];
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
      }
      return session;
    }
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
      name: process.env.NODE_ENV === 'production' ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.growxlabs.tech' : undefined,
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

