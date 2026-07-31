import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function POST(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function PUT(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

async function handleProxy(req: Request, params: { path: string[] }) {
  try {
    const subpath = params.path ? params.path.join("/") : "";
    const { search } = new URL(req.url);
    const targetUrl = `http://localhost:8087/v1/performance/${subpath}${search}`;

    const headers = new Headers(req.headers);
    headers.set("X-GXL-Organisation-ID", "org_default");

    const init: RequestInit = {
      method: req.method,
      headers
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body = await req.text();
    }

    const res = await fetch(targetUrl, init);
    const data = await res.text();

    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 502 });
  }
}
