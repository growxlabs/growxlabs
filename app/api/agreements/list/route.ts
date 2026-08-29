export async function GET() { return Response.json({ error: "LEGACY_AGREEMENT_ENDPOINT: use the authenticated Master Service Agreement register." }, { status: 410 }); }
