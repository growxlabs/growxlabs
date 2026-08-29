export async function GET() { return Response.json({ error: "LEGACY_AGREEMENT_ENDPOINT: use Client Suite or the active Master Service Agreement API." }, { status: 410 }); }
