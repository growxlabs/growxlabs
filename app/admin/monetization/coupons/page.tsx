export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { CouponManagementClient } from "@/components/admin/CouponManagementClient";

export default async function CouponManagement() {
  const supabase = supabaseAdmin;
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return <CouponManagementClient initialCoupons={coupons || []} />;
}
