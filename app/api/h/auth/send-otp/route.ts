import { NextResponse } from "next/server";
import { sendHealthcareOtp } from "@/lib/employee-os/healthcare-otp-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid work email address." },
        { status: 400 }
      );
    }

    const result = await sendHealthcareOtp(email);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          cooldownSeconds: result.cooldownSeconds,
        },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      cooldownSeconds: result.cooldownSeconds || 60,
    });
  } catch (error: any) {
    console.error("POST /api/h/auth/send-otp error:", error?.message);
    return NextResponse.json(
      { success: false, error: "Unable to process request. Please try again." },
      { status: 500 }
    );
  }
}
