import { NextResponse } from "next/server";

export async function POST() {
  // Public self-registration is disabled for elite studio security.
  // Clients are onboarded via tokenized invitations (/api/client/invitations/accept).
  return NextResponse.json(
    { 
      error: "Public self-registration is disabled. Client onboarding is strictly by invitation." 
    }, 
    { status: 403 }
  );
}
