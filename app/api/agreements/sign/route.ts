export async function POST() { return Response.json({ error: "LEGACY_AGREEMENT_ENDPOINT: use structured agreement signing in Client Suite or Admin Suite." }, { status: 410 }); }
