import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resumeForgeClient } from "@/lib/integrations/resumeforge";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || !["ADMIN", "CO_ADMIN"].includes(role)) {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "summary";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const status = searchParams.get("status") || undefined;
    const plan = searchParams.get("plan") || undefined;

    const isConfigured = resumeForgeClient.isConfigured();

    if (type === "summary") {
      const summary = await resumeForgeClient.getSummary();
      return NextResponse.json({
        success: true,
        summary,
        configured: isConfigured,
      });
    }

    if (type === "invoices") {
      const result = await resumeForgeClient.getInvoices({ page, limit, status });
      return NextResponse.json(result);
    }

    if (type === "payments") {
      const result = await resumeForgeClient.getPayments({ page, limit });
      return NextResponse.json(result);
    }

    if (type === "users") {
      const result = await resumeForgeClient.getUsers({ page, limit, plan });
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Invalid type requested. Valid types: summary, invoices, payments, users." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[ResumeForge Admin API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process ResumeForge request",
        configured: resumeForgeClient.isConfigured(),
      },
      { status: 500 }
    );
  }
}
