import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!email) {
      return new NextResponse(
        `<html>
          <body style="background-color: #0d0d0d; color: #f5f3ee; font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #CC1F1F;">Error</h1>
            <p>Invalid unsubscribe request.</p>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html" }, status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("wish_subscribers")
      .delete()
      .eq("email", email);

    if (error) {
      console.error("Unsubscribe error:", error);
      return new NextResponse(
        `<html>
          <body style="background-color: #0d0d0d; color: #f5f3ee; font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #CC1F1F;">Error</h1>
            <p>Could not process your unsubscription request at this time.</p>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html" }, status: 500 }
      );
    }

    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Unsubscribed · GrowxLabs Dispatch</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              background-color: #08080a;
              color: #f3f4f6;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 24px;
              box-sizing: border-box;
            }
            .container {
              max-width: 480px;
              width: 100%;
              text-align: center;
              border: 1px solid rgba(255, 255, 255, 0.12);
              border-radius: 16px;
              padding: 44px 36px;
              background-color: #0f0f13;
              box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
            }
            .badge {
              display: inline-block;
              font-family: 'Courier New', Courier, monospace;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.14em;
              text-transform: uppercase;
              color: #9ca3af;
              margin-bottom: 20px;
            }
            h1 {
              color: #ffffff;
              font-size: 22px;
              font-weight: 700;
              margin: 0 0 14px 0;
              letter-spacing: -0.01em;
            }
            p {
              color: #9ca3af;
              font-size: 14px;
              line-height: 1.6;
              margin: 0 0 28px 0;
            }
            .home-btn {
              display: inline-block;
              background: #ffffff;
              color: #000000;
              font-weight: 600;
              font-size: 13px;
              padding: 10px 22px;
              text-decoration: none;
              border-radius: 8px;
              transition: background 0.2s;
            }
            .home-btn:hover {
              background: #e5e7eb;
            }
            .footer {
              margin-top: 32px;
              padding-top: 20px;
              border-top: 1px solid rgba(255, 255, 255, 0.08);
              color: #6b7280;
              font-size: 11px;
              font-family: 'Courier New', Courier, monospace;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <span class="badge">GROWX LABS DISPATCH</span>
            <h1>You have been unsubscribed</h1>
            <p>Your email has been safely removed from our subscriber roster. You will no longer receive newsletter briefings or technical editions.</p>
            <a href="https://growxlabs.tech" class="home-btn">Return to Homepage →</a>
            <div class="footer">GrowxLabs · High-Performance Software & Frontier AI</div>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("Unsubscribe API catch error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
