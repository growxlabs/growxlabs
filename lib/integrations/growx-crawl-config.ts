export function getGrowXCrawlConfig() {
  const token = process.env.GROWX_CRAWL_INGESTION_TOKEN?.trim();
  if (!token) throw new Error("GrowX Crawl ingestion is not configured");
  return {
    token,
    organisationId: process.env.GROWX_CRAWL_ORGANISATION_ID?.trim() || null,
  };
}
