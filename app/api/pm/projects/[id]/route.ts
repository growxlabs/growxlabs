import { NextResponse } from "next/server";
import { EnterprisePmService } from "@/services/enterprise-pm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing project id" }, { status: 400 });
    }

    const data = await EnterprisePmService.getProjectDashboard(id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GET /api/pm/projects/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch project dashboard" },
      { status: 500 }
    );
  }
}
