import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type DockTab = "activity" | "audit" | "errors";
export class DockAuthError extends Error { constructor(public status: number, message: string) { super(message); } }

export async function requireDockClient() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "CLIENT") throw new DockAuthError(403, "A client account is required.");
  const { data, error } = await supabaseAdmin.from("client_profiles").select("id,company_id").eq("user_id", session.user.id).maybeSingle();
  if (error) throw new Error(error.message); if (!data) throw new DockAuthError(403, "Client account is not linked.");
  return { userId: session.user.id, clientId: data.id as string, companyId: data.company_id as string | null };
}

export async function requireDockAdmin() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session?.user?.id || !["ADMIN", "CO_ADMIN"].includes(role || "")) throw new DockAuthError(403, "Operations access is required.");
  return { userId: session.user.id, role };
}

export function dockError(error: unknown) { const status = error instanceof DockAuthError ? error.status : 500; return Response.json({ error: error instanceof Error ? error.message : "Dock unavailable." }, { status }); }

export function displayActivityType(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()); }
