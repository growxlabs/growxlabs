import { supabaseAdmin } from "@/lib/supabase/admin";
import { Lead } from "@/types";
import crypto from "crypto";
import { upsertCanonicalLead } from "@/lib/leads/canonical";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

export class ScrapingService {
  static async scrapeLeads(organisationId:string,city: string, category: string, options: { radius?: number, maxResults?: number } = {}) {
    if (APIFY_TOKEN && APIFY_TOKEN !== "your_apify_token_here") {
      // 1. Run Apify logic...
      // Target Small/Local businesses for better conversion
      const enhancedCategory = category.toLowerCase().includes('small') || category.toLowerCase().includes('local') 
        ? category 
        : `small ${category}`;
        
      console.log(`Pivoting to High-Conversion Leads (Apify): ${enhancedCategory} in ${city}...`);

      try {
        // Trigger Apify Run
        const runResponse = await fetch(`https://api.apify.com/v2/acts/compass~crawler-google-places/runs?token=${APIFY_TOKEN}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            searchStringsArray: [
              `${category} in ${city}`,
              `${category} near me ${city}`,
              `local ${category} ${city}`,
              `small ${category} ${city}`
            ],
            maxCrawledPlacesPerSearch: options.maxResults || 100,
            language: "en",
            includeReviews: false
          })
        });

        if (!runResponse.ok) {
          throw new Error(`Apify start error: ${await runResponse.text()}`);
        }

        const runData = await runResponse.json();
        const runId = runData.data.id;
        const datasetId = runData.data.defaultDatasetId;

        // Poll for completion
        let isFinished = false;
        let attempts = 0;
        while (!isFinished && attempts < 20) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
          const statusData = await statusRes.json();
          if (statusData.data.status === 'SUCCEEDED') isFinished = true;
          else if (['FAILED', 'ABORTED'].includes(statusData.data.status)) throw new Error("Scraping failed");
          attempts++;
        }

        // Fetch & Process
        const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`);
        const rawItems = await itemsRes.json();
        
        const processedLeads: Lead[] = [];

        for (const item of rawItems) {
          // FILTER: Skip if they already have a website (Low conversion potential)
          if (item.website) continue;

          const businessName = item.title || item.name;
          if (!businessName) continue;

          const phone = item.phone || "";
          const googleRating = item.totalScore || 0;
          const reviewsCount = item.reviewsCount || 0;
          
          // SCORING SYSTEM (Target: No Website / Low Digital Presence)
          let score = 0;
          if (!item.website) score += 4;
          if (!phone) score += 2;
          if (reviewsCount < 50) score += 2;
          if (googleRating < 4.2) score += 1;

          // FILTER: Only high-potential leads (Score >= 6)
          if (score < 6) continue;

          const lead = {
            name: businessName,
            business_name: businessName,
            phone: phone ? phone.replace(/\s+/g, '') : "",
            website_url: null,
            has_website: false,
            google_rating: googleRating,
            reviews_count: reviewsCount,
            city,
            lead_score: score,
            status: "new",
            message: "", // Safe fallback for DB
            requirement: "", // Safe fallback for DB
            notes: `LDP Lead: ${item.address || ''}`,
            created_at: new Date().toISOString()
          };

          const result=await upsertCanonicalLead(organisationId,{businessName:lead.business_name,phone:lead.phone,city,source:"apify",sourceTool:"apify",notes:lead.notes,customFields:{google_rating:googleRating,reviews_count:reviewsCount,lead_score:score}});
          processedLeads.push(result.lead);
        }

        console.log(`SUCCESS (Apify): Captured ${processedLeads.length} High-Potential Leads.`);
        return processedLeads;
      } catch (error: any) {
        console.error("ScrapingService Error:", error.message);
        throw new Error("Scraping failed. Check API or actor configuration.");
      }
    } else {
      // 2. Run Free Overpass API Logic
      console.log(`Running free Overpass API local lead scrape for ${category} in ${city}...`);
      return await this.scrapeOverpassLeads(organisationId,city, category, options);
    }
  }

  private static async scrapeOverpassLeads(organisationId:string,city: string, category: string, options: { radius?: number, maxResults?: number } = {}) {
    const limit = options.maxResults || 50;
    
    // Map UI category to OSM tags
    const catLower = category.toLowerCase();
    let queryTags = 'node["office"="company"](area.searchArea);\n  way["office"="company"](area.searchArea);';
    
    if (catLower.includes("logistics") || catLower.includes("warehous")) {
      queryTags = 'node["office"="logistics"](area.searchArea);\n  way["office"="logistics"](area.searchArea);\n  node["industrial"="warehouse"](area.searchArea);\n  way["industrial"="warehouse"](area.searchArea);';
    } else if (catLower.includes("manufacturing") || catLower.includes("factory") || catLower.includes("plant")) {
      queryTags = 'node["industrial"="factory"](area.searchArea);\n  way["industrial"="factory"](area.searchArea);';
    } else if (catLower.includes("chemical") || catLower.includes("industrial distributor")) {
      queryTags = 'node["office"="distributor"](area.searchArea);\n  way["office"="distributor"](area.searchArea);\n  node["shop"="wholesale"](area.searchArea);\n  way["shop"="wholesale"](area.searchArea);';
    } else if (catLower.includes("real estate") || catLower.includes("estate agent")) {
      queryTags = 'node["office"="estate_agent"](area.searchArea);\n  way["office"="estate_agent"](area.searchArea);';
    } else if (catLower.includes("hospital") || catLower.includes("clinic") || catLower.includes("lab")) {
      queryTags = 'node["amenity"="hospital"](area.searchArea);\n  way["amenity"="hospital"](area.searchArea);\n  node["amenity"="clinic"](area.searchArea);\n  way["amenity"="clinic"](area.searchArea);';
    } else if (catLower.includes("financial") || catLower.includes("accounting") || catLower.includes("accountant")) {
      queryTags = 'node["office"="financial"](area.searchArea);\n  way["office"="financial"](area.searchArea);\n  node["office"="accountant"](area.searchArea);\n  way["office"="accountant"](area.searchArea);';
    } else if (catLower.includes("law") || catLower.includes("legal") || catLower.includes("lawyer")) {
      queryTags = 'node["office"="lawyer"](area.searchArea);\n  way["office"="lawyer"](area.searchArea);';
    } else if (catLower.includes("consulting") || catLower.includes("company")) {
      queryTags = 'node["office"="company"](area.searchArea);\n  way["office"="company"](area.searchArea);\n  node["office"="consulting"](area.searchArea);\n  way["office"="consulting"](area.searchArea);';
    } else if (catLower.includes("wholesale") || catLower.includes("retail distributor")) {
      queryTags = 'node["shop"="wholesale"](area.searchArea);\n  way["shop"="wholesale"](area.searchArea);\n  node["office"="distributor"](area.searchArea);\n  way["office"="distributor"](area.searchArea);';
    } else {
      queryTags = `node["office"="${catLower}"](area.searchArea);\n  way["office"="${catLower}"](area.searchArea);`;
    }

    const overpassQuery = `[out:json][timeout:30];
area[name="${city}"]->.searchArea;
(
  ${queryTags}
);
out body ${limit};`;

    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: `data=${encodeURIComponent(overpassQuery)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      if (!response.ok) {
        throw new Error(`Overpass API responded with status ${response.status}`);
      }

      const result = await response.json();
      const elements = result.elements || [];
      const processedLeads: Lead[] = [];

      for (const element of elements) {
        const tags = element.tags || {};
        const businessName = tags.name;
        if (!businessName) continue;

        // Skip if website is present (we want low digital presence, high potential)
        const website = tags.website || tags["contact:website"] || null;
        if (website) continue;

        const phone = tags.phone || tags["contact:phone"] || "";
        const addrStreet = tags["addr:street"] || "";
        const addrHousenumber = tags["addr:housenumber"] || "";
        const address = `${addrHousenumber} ${addrStreet}`.trim() || `${city}, India`;

        // SCORING SYSTEM (Target: No Website / Low Digital Presence)
        let score = 6; // Base score since it has no website
        if (!phone) score += 2;

        const lead = {
          name: businessName,
          business_name: businessName,
          phone: phone ? phone.replace(/\s+/g, '') : "",
          website_url: null,
          has_website: false,
          google_rating: 0,
          reviews_count: 0,
          city,
          lead_score: score,
          status: "new",
          message: "",
          requirement: "",
          notes: `OSM Lead: ${address}`,
          created_at: new Date().toISOString()
        };

        const saved=await upsertCanonicalLead(organisationId,{businessName:lead.business_name,phone:lead.phone,city,source:"other",sourceTool:"overpass",notes:lead.notes,customFields:{lead_score:score}});
        processedLeads.push(saved.lead);
      }

      console.log(`Overpass scrape finished. Found ${elements.length} raw, saved ${processedLeads.length} high-potential leads.`);
      return processedLeads;
    } catch (error: any) {
      console.error("Overpass Scraping Error:", error.message);
      return [];
    }
  }

  private static async triggerAlert(lead: Lead) {
    console.log(`🚨 LEAD DETECTED: ${lead.business_name} (Score: ${lead.lead_score})`);
  }
}
