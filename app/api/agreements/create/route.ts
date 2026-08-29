export async function POST() { return Response.json({ error: "LEGACY_AGREEMENT_ENDPOINT: use the authenticated Master Service Agreement workflow." }, { status: 410 }); }
