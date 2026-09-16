import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data: invoices, error } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Safely attach client details
    const clientIds = Array.from(new Set((invoices || []).map((inv: any) => inv.client_id).filter(Boolean)));
    const clientsMap = new Map();
    if (clientIds.length > 0) {
      const { data: clients } = await supabaseAdmin
        .from("clients")
        .select("id, name, business_name")
        .in("id", clientIds);
      if (clients) {
        clients.forEach((c: any) => clientsMap.set(c.id, c));
      }
    }

    const enriched = (invoices || []).map((inv: any) => {
      const client = clientsMap.get(inv.client_id);
      return {
        ...inv,
        client_name: inv.client_name || client?.name || "Client",
        business_name: inv.business_name || client?.business_name || client?.name || "GrowX Client",
        invoice_number: inv.invoice_number || `INV-${inv.id.slice(0, 8).toUpperCase()}`
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
