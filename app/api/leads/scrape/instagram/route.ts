import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getToken } from "next-auth/jwt";
import { upsertCanonicalLead } from "@/lib/leads/canonical";

// List of ignored Instagram paths that are not usernames
const IGNORED_PATHS = new Set([
  "p", "reels", "reel", "explore", "tags", "tv", "stories", "direct", 
  "developer", "about", "legal", "press", "jobs", "blog", "accounts"
]);

export async function POST(req: Request) {
  try {
    // 1. Session authorization
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const organisationId=String((token as any).organisation_id||process.env.DEFAULT_ORGANISATION_ID||"");
    if(!organisationId||String((token as any).role)!=="ADMIN")return NextResponse.json({error:"Admin organisation access required"},{status:403});

    const { niche, city, emailDomain } = await req.json();

    if (!niche || !city) {
      return NextResponse.json({ error: "Niche and City are required" }, { status: 400 });
    }

    const targetEmailDomain = emailDomain || "@gmail.com";
    
    let nicheQuery = `"${niche}"`;
    if (niche === "All Niches") {
      nicheQuery = `("clothing brand" OR "restaurant" OR "salon" OR "gym" OR "boutique" OR "founder" OR "sarees")`;
    }

    let cityQuery = `"${city}"`;
    if (city === "All Cities") {
      cityQuery = `"India"`; // Scope to all of India
    }

    const searchQuery = `site:instagram.com ${nicheQuery} ${cityQuery} "${targetEmailDomain}"`;

    let leads: any[] = [];
    let methodUsed = "";
    
    const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const googleCx = process.env.GOOGLE_SEARCH_CX;

    // 1. TRY OFFICIAL GOOGLE CUSTOM SEARCH API (Best for Cloud)
    if (googleApiKey && googleCx && googleApiKey !== "your_api_key_here") {
      try {
        console.log(`Instagram X-Ray Search via Google Custom Search API: ${searchQuery}`);
        leads = await scrapeViaGoogleApi(searchQuery, city, googleApiKey, googleCx);
        methodUsed = "Google API";
      } catch (err: any) {
        console.error("Google API failed, falling back:", err.message);
      }
    }

    // 2. TRY DUCKDUCKGO LITE
    if (leads.length === 0) {
      try {
        console.log(`Instagram X-Ray Search via DuckDuckGo Lite: ${searchQuery}`);
        leads = await scrapeViaDuckDuckGoLite(searchQuery, city);
        methodUsed = "DuckDuckGo Lite";
      } catch (err: any) {
        console.error("DuckDuckGo Lite failed, falling back:", err.message);
      }
    }

    // 3. TRY YAHOO SEARCH FALLBACK (Fetches both page 1 and page 2 for double results!)
    if (leads.length === 0) {
      try {
        console.log(`Instagram X-Ray Search via Yahoo Fallback (Pages 1 & 2): ${searchQuery}`);
        const page1Leads = await scrapeViaYahoo(searchQuery, city, 1);
        const page2Leads = await scrapeViaYahoo(searchQuery, city, 11);
        leads = [...page1Leads, ...page2Leads];
        methodUsed = "Yahoo Search";
      } catch (err: any) {
        console.error("Yahoo search failed, falling back:", err.message);
      }
    }

    // 4. TRY DUCKDUCKGO HTML FALLBACK
    if (leads.length === 0) {
      try {
        console.log(`Instagram X-Ray Search via DuckDuckGo HTML Fallback: ${searchQuery}`);
        leads = await scrapeViaDuckDuckGoHtml(searchQuery, city);
        methodUsed = "DuckDuckGo HTML";
      } catch (err: any) {
        console.error("DuckDuckGo HTML failed:", err.message);
      }
    }

    if (leads.length === 0) {
      return NextResponse.json({
        error: "All search scraping backends were rate-limited or blocked by anti-bot challenges. Please configure GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_CX in your environment settings for 100% reliable, official Google search integration."
      }, { status: 429 });
    }

    // Save/check leads in Supabase
    const savedLeads: any[] = [];
    for (const lead of leads) {
      const saved=await upsertCanonicalLead(organisationId,{businessName:lead.business_name,contactName:lead.name,email:lead.email,phone:lead.phone,instagramUrl:lead.website_url,city:lead.city,source:"instagram",sourceTool:methodUsed,sourceUrl:lead.website_url,notes:lead.notes,customFields:{implementation:"search_discovery_not_direct_instagram_api"}});
      savedLeads.push({...saved.lead,alreadyExists:saved.outcome!=="created"});
    }

    console.log(`Instagram X-Ray Scrape completed using ${methodUsed}: Saved/Retrieved ${savedLeads.length} leads.`);

    return NextResponse.json({
      success: true,
      count: savedLeads.length,
      method: methodUsed,
      leads: savedLeads
    });

  } catch (error: any) {
    console.error("Instagram Scraper API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 1. Google Custom Search JSON API implementation
async function scrapeViaGoogleApi(query: string, city: string, apiKey: string, cx: string): Promise<any[]> {
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Google Custom Search API responded with status ${res.status}`);
  }
  const data = await res.json();
  const items = data.items || [];
  const leads: any[] = [];

  for (const item of items) {
    const link = item.link || "";
    if (!link.includes("instagram.com")) continue;

    const igUrlMatch = link.match(/instagram\.com\/([a-zA-Z0-9_\.]+)/);
    if (!igUrlMatch) continue;

    const rawUsername = igUrlMatch[1];
    const username = rawUsername.split(/[/?#]/)[0].trim().toLowerCase();

    if (!username || IGNORED_PATHS.has(username) || username.length < 3) {
      continue;
    }

    const title = item.title || "";
    let name = title.replace(/\s*[•|(-]\s*Instagram.*$/i, "").trim();
    name = name.replace(/^@/, "").trim();

    const snippet = item.snippet || "";
    const emailMatch = snippet.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (!emailMatch) continue;
    const email = emailMatch[0].trim().toLowerCase();

    const linksInSnippet = snippet.match(/[a-zA-Z0-9-]+\.(com|in|org|net|co|io|me|linktr\.ee|info)/gi) || [];
    const externalLink = linksInSnippet.find((l: string) => {
      const low = l.toLowerCase();
      return !low.includes("instagram") && !low.includes("facebook") && !low.includes("gmail") && !low.includes("yahoo") && !low.includes("outlook");
    });

    const hasWebsite = !!externalLink;

    let score = 7;
    if (!hasWebsite) score += 2;
    if (snippet.toLowerCase().includes("whatsapp") || snippet.toLowerCase().includes("contact") || snippet.toLowerCase().includes("dm")) {
      score += 1;
    }

    leads.push({
      name: name || username,
      business_name: name || username,
      phone: "",
      website_url: `https://instagram.com/${username}`,
      has_website: hasWebsite,
      google_rating: 0,
      reviews_count: 0,
      city,
      lead_score: score,
      status: "new",
      message: "",
      requirement: "",
      notes: `Instagram: @${username} | Email: ${email} | Bio: ${snippet}`,
      created_at: new Date().toISOString()
    });
  }

  return leads;
}

// 2. DuckDuckGo Lite Scraper
async function scrapeViaDuckDuckGoLite(query: string, city: string): Promise<any[]> {
  const url = "https://lite.duckduckgo.com/lite/";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    body: `q=${encodeURIComponent(query)}`
  });

  if (!res.ok) {
    throw new Error(`DDG Lite responded with status ${res.status}`);
  }

  const html = await res.text();
  if (html.toLowerCase().includes("captcha") || html.toLowerCase().includes("challenge") || html.length < 5000) {
    throw new Error("DDG Lite triggered a CAPTCHA challenge");
  }

  const leads: any[] = [];
  const regex = /<a[^>]*href="([^"]+)"[^>]*class='result-link'[^>]*>([\s\S]*?)<\/a>[\s\S]*?class='result-snippet'[^>]*>([\s\S]*?)<\/td>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const link = match[1];
    const rawTitle = match[2];
    const rawSnippet = match[3];

    const title = rawTitle.replace(/<[^>]*>/g, "").trim();
    const snippet = rawSnippet.replace(/<[^>]*>/g, "").trim();

    // Check for email inside snippet
    const emailMatch = snippet.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (!emailMatch) continue;
    const email = emailMatch[0].trim().toLowerCase();

    let username = "";

    // Try link URL path
    const igUrlMatch = link.match(/instagram\.com\/([a-zA-Z0-9_\.]+)/i);
    if (igUrlMatch) {
      const pathPart = igUrlMatch[1].split(/[/?#&%]/)[0].trim().toLowerCase();
      if (pathPart && !IGNORED_PATHS.has(pathPart) && pathPart.length >= 3) {
        username = pathPart;
      }
    }

    // Try snippet "username on Date"
    if (!username) {
      const onDateMatch = snippet.match(/([a-zA-Z0-9_\.]+)\s+on\s+[a-zA-Z]+\s+\d+/i);
      if (onDateMatch) {
        const u = onDateMatch[1].trim().toLowerCase();
        if (u && !IGNORED_PATHS.has(u) && u.length >= 3) {
          username = u;
        }
      }
    }

    // Try snippet "username Verified"
    if (!username) {
      const verifiedMatch = snippet.match(/([a-zA-Z0-9_\.]+)\s+Verified/i);
      if (verifiedMatch) {
        const u = verifiedMatch[1].trim().toLowerCase();
        if (u && !IGNORED_PATHS.has(u) && u.length >= 3) {
          username = u;
        }
      }
    }

    // Try snippet inner link
    if (!username) {
      const snippetLinkMatch = snippet.match(/instagram\.com\/([a-zA-Z0-9_\.]+)/i);
      if (snippetLinkMatch) {
        const u = snippetLinkMatch[1].split(/[/?#&%:\s]/)[0].trim().toLowerCase();
        if (u && !IGNORED_PATHS.has(u) && u.length >= 3) {
          username = u;
        }
      }
    }

    if (!username) continue;

    let name = title.replace(/\s*[•|(-]\s*Instagram.*$/i, "").trim();
    name = name.replace(/^@/, "").trim();

    const linksInSnippet = snippet.match(/[a-zA-Z0-9-]+\.(com|in|org|net|co|io|me|linktr\.ee|info)/gi) || [];
    const externalLink = linksInSnippet.find((l: string) => {
      const low = l.toLowerCase();
      return !low.includes("instagram") && !low.includes("facebook") && !low.includes("gmail") && !low.includes("yahoo") && !low.includes("outlook");
    });

    const hasWebsite = !!externalLink;

    let score = 7;
    if (!hasWebsite) score += 2;
    if (snippet.toLowerCase().includes("whatsapp") || snippet.toLowerCase().includes("contact") || snippet.toLowerCase().includes("dm")) {
      score += 1;
    }

    leads.push({
      name: name || username,
      business_name: name || username,
      phone: "",
      website_url: `https://instagram.com/${username}`,
      has_website: hasWebsite,
      google_rating: 0,
      reviews_count: 0,
      city,
      lead_score: score,
      status: "new",
      message: "",
      requirement: "",
      notes: `Instagram: @${username} | Email: ${email} | Bio: ${snippet}`,
      created_at: new Date().toISOString()
    });
  }

  return leads;
}

// 3. Yahoo Search Scraper implementation
async function scrapeViaYahoo(query: string, city: string, offset: number = 1): Promise<any[]> {
  const yahooUrl = `https://search.yahoo.com/search?q=${encodeURIComponent(query)}&b=${offset}`;
  const res = await fetch(yahooUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5"
    }
  });

  if (!res.ok) {
    throw new Error(`Yahoo Search responded with status ${res.status}`);
  }

  const html = await res.text();
  const resultBlocks = html.split(/<li[^>]*>\s*<div class="dd algo algo-sr/i);
  const blocksToProcess = resultBlocks.slice(1);
  const leads: any[] = [];

  for (const block of blocksToProcess) {
    const urlMatch = block.match(/RU=https?%3a%2f%2f(?:www\.)?instagram\.com%2f([a-zA-Z0-9_\.]+)/i) || 
                     block.match(/instagram\.com\/([a-zA-Z0-9_\.]+)/i);
                     
    if (!urlMatch) continue;

    const snippetMatch = block.match(/class="compText aAbs"[^>]*>([\s\S]*?)<\/div>/i);
    const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, "").trim() : "";

    // Check for email inside snippet
    const emailMatch = snippet.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (!emailMatch) continue;
    const email = emailMatch[0].trim().toLowerCase();

    let username = "";

    // Try URL path
    const pathPart = urlMatch[1].split(/[/?#&%]/)[0].trim().toLowerCase();
    if (pathPart && !IGNORED_PATHS.has(pathPart) && pathPart.length >= 3) {
      username = pathPart;
    }

    // Try snippet "username on Date"
    if (!username) {
      const onDateMatch = snippet.match(/([a-zA-Z0-9_\.]+)\s+on\s+[a-zA-Z]+\s+\d+/i);
      if (onDateMatch) {
        const u = onDateMatch[1].trim().toLowerCase();
        if (u && !IGNORED_PATHS.has(u) && u.length >= 3) {
          username = u;
        }
      }
    }

    // Try snippet "username Verified"
    if (!username) {
      const verifiedMatch = snippet.match(/([a-zA-Z0-9_\.]+)\s+Verified/i);
      if (verifiedMatch) {
        const u = verifiedMatch[1].trim().toLowerCase();
        if (u && !IGNORED_PATHS.has(u) && u.length >= 3) {
          username = u;
        }
      }
    }

    // Try snippet inner link
    if (!username) {
      const snippetLinkMatch = snippet.match(/instagram\.com\/([a-zA-Z0-9_\.]+)/i);
      if (snippetLinkMatch) {
        const u = snippetLinkMatch[1].split(/[/?#&%:\s]/)[0].trim().toLowerCase();
        if (u && !IGNORED_PATHS.has(u) && u.length >= 3) {
          username = u;
        }
      }
    }

    if (!username) continue;

    const titleMatch = block.match(/class="title"[^>]*>([\s\S]*?)<\/h3>/i);
    let name = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "").trim() : `@${username}`;
    name = name.replace(/\s*[•|(-]\s*Instagram.*$/i, "").trim();
    name = name.replace(/^@/, "").trim();

    const linksInSnippet = snippet.match(/[a-zA-Z0-9-]+\.(com|in|org|net|co|io|me|linktr\.ee|info)/gi) || [];
    const externalLink = linksInSnippet.find((l: string) => {
      const low = l.toLowerCase();
      return !low.includes("instagram") && !low.includes("facebook") && !low.includes("gmail") && !low.includes("yahoo") && !low.includes("outlook");
    });

    const hasWebsite = !!externalLink;

    let score = 7;
    if (!hasWebsite) score += 2;
    if (snippet.toLowerCase().includes("whatsapp") || snippet.toLowerCase().includes("contact") || snippet.toLowerCase().includes("dm")) {
      score += 1;
    }

    leads.push({
      name: name || username,
      business_name: name || username,
      phone: "",
      website_url: `https://instagram.com/${username}`,
      has_website: hasWebsite,
      google_rating: 0,
      reviews_count: 0,
      city,
      lead_score: score,
      status: "new",
      message: "",
      requirement: "",
      notes: `Instagram: @${username} | Email: ${email} | Bio: ${snippet}`,
      created_at: new Date().toISOString()
    });
  }

  return leads;
}

// 4. DuckDuckGo HTML Scraper implementation
async function scrapeViaDuckDuckGoHtml(query: string, city: string): Promise<any[]> {
  const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const response = await fetch(ddgUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });

  if (!response.ok) {
    throw new Error(`DDG HTML responded with status ${response.status}`);
  }

  const html = await response.text();
  const resultBlocks = html.split(/class="result results_links/);
  const blocksToProcess = resultBlocks.slice(1);
  const leads: any[] = [];

  for (const block of blocksToProcess) {
    const urlMatch = block.match(/uddg=https?(?:%3A%2F%2F|:\/\/)(?:www\.)?instagram\.com%2F([a-zA-Z0-9_\.]+)/i) || 
                     block.match(/instagram\.com\/([a-zA-Z0-9_\.]+)/i);
                     
    if (!urlMatch) continue;

    const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i);
    const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, "").trim() : "";

    const emailMatch = block.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (!emailMatch) continue;
    const email = emailMatch[0].trim().toLowerCase();

    let username = "";

    const pathPart = decodeURIComponent(urlMatch[1]).split(/[/?#&%]/)[0].trim().toLowerCase();
    if (pathPart && !IGNORED_PATHS.has(pathPart) && pathPart.length >= 3) {
      username = pathPart;
    }

    if (!username) {
      const onDateMatch = snippet.match(/([a-zA-Z0-9_\.]+)\s+on\s+[a-zA-Z]+\s+\d+/i);
      if (onDateMatch) {
        const u = onDateMatch[1].trim().toLowerCase();
        if (u && !IGNORED_PATHS.has(u) && u.length >= 3) {
          username = u;
        }
      }
    }

    if (!username) {
      const verifiedMatch = snippet.match(/([a-zA-Z0-9_\.]+)\s+Verified/i);
      if (verifiedMatch) {
        const u = verifiedMatch[1].trim().toLowerCase();
        if (u && !IGNORED_PATHS.has(u) && u.length >= 3) {
          username = u;
        }
      }
    }

    if (!username) {
      const snippetLinkMatch = snippet.match(/instagram\.com\/([a-zA-Z0-9_\.]+)/i);
      if (snippetLinkMatch) {
        const u = snippetLinkMatch[1].split(/[/?#&%:\s]/)[0].trim().toLowerCase();
        if (u && !IGNORED_PATHS.has(u) && u.length >= 3) {
          username = u;
        }
      }
    }

    if (!username) continue;

    const titleMatch = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/i);
    let name = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "").trim() : `@${username}`;
    name = name.replace(/\s*[•|(-]\s*Instagram.*$/i, "").trim();
    name = name.replace(/^@/, "").trim();

    const linksInSnippet = snippet.match(/[a-zA-Z0-9-]+\.(com|in|org|net|co|io|me|linktr\.ee|info)/gi) || [];
    const externalLink = linksInSnippet.find((l: string) => {
      const low = l.toLowerCase();
      return !low.includes("instagram") && !low.includes("facebook") && !low.includes("gmail") && !low.includes("yahoo") && !low.includes("outlook");
    });

    const hasWebsite = !!externalLink;

    let score = 7;
    if (!hasWebsite) score += 2;
    if (snippet.toLowerCase().includes("whatsapp") || snippet.toLowerCase().includes("contact") || snippet.toLowerCase().includes("dm")) {
      score += 1;
    }

    leads.push({
      name: name || username,
      business_name: name || username,
      phone: "",
      website_url: `https://instagram.com/${username}`,
      has_website: hasWebsite,
      google_rating: 0,
      reviews_count: 0,
      city,
      lead_score: score,
      status: "new",
      message: "",
      requirement: "",
      notes: `Instagram: @${username} | Email: ${email} | Bio: ${snippet}`,
      created_at: new Date().toISOString()
    });
  }

  return leads;
}
