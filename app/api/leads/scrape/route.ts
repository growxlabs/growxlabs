import { NextResponse } from "next/server";
import { ScrapingService } from "@/services/scraping.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session=await getServerSession(authOptions),user=session?.user;
    if(!user?.id||!user.organisation_id||user.role!=="ADMIN")return NextResponse.json({error:"Admin access required"},{status:403});
    const { city, category, radius, maxResults } = await req.json();

    if (!city || !category) {
      return NextResponse.json({ error: "City and Category are required" }, { status: 400 });
    }

    // Support Bulk Mode (Comma separated strings from UI)
    const cities = city.split(",").map((c: string) => c.trim());
    const categories = category.split(",").map((c: string) => c.trim());
    
    const allLeads = new Map();

    for (const c of cities) {
      for (const cat of categories) {
        try {
          const leads = await ScrapingService.scrapeLeads(user.organisation_id,c, cat, {
            radius: radius || 100,
            maxResults: maxResults || 100
          });
          leads.forEach(l => allLeads.set(l.id, l));
        } catch (err) {
          console.error(`Bulk Scrape Failed for ${cat} in ${c}:`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: allLeads.size,
      leads: Array.from(allLeads.values())
    });
  } catch (error: any) {
    console.error("Scrape API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
