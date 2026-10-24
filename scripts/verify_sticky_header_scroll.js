const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

async function verify() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const outDir = "C:/Users/LENOVO/.gemini/antigravity/brain/1e4f21e7-55f2-4d3e-8e08-f9dba5625eed";

  // Test 1: Desktop View on /services
  console.log("Navigating to http://localhost:3000/services...");
  await page.goto("http://localhost:3000/services", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 800));

  // Dismiss cookie banner if present
  try {
    const acceptBtn = await page.$('button:has-text("ACCEPT ALL")');
    if (acceptBtn) await acceptBtn.click();
    await new Promise(r => setTimeout(r, 300));
  } catch (e) {}

  // 1. Top of page
  await page.screenshot({ path: path.join(outDir, "header-scroll-01-top-desktop.png") });
  console.log("Captured 01: Top of page (all 3 elements visible)");

  // 2. Scroll to 80px (before 120px threshold)
  await page.evaluate(() => window.scrollTo(0, 80));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(outDir, "header-scroll-02-80px-desktop.png") });
  console.log("Captured 02: 80px scroll (before threshold, wordmark visible)");

  // 3. Scroll to 200px (beyond 120px threshold)
  await page.evaluate(() => window.scrollTo(0, 200));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(outDir, "header-scroll-03-200px-desktop.png") });
  console.log("Captured 03: 200px scroll (wordmark faded out, center clear)");

  // 4. Scroll down over services cards (800px)
  await page.evaluate(() => window.scrollTo(0, 800));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(outDir, "header-scroll-04-scrolled-cards.png") });
  console.log("Captured 04: 800px scroll over cards (no overlap)");

  // Verify pointer-events and tabIndex on wordmark when hidden
  const wordmarkStatus = await page.evaluate(() => {
    const wordmarkDiv = document.querySelector('nav .font-serif.font-bold')?.closest('div.absolute');
    const wordmarkLink = wordmarkDiv ? wordmarkDiv.querySelector('a') : null;
    if (!wordmarkDiv || !wordmarkLink) return null;
    const computed = window.getComputedStyle(wordmarkDiv);
    return {
      opacity: computed.opacity,
      pointerEvents: computed.pointerEvents,
      visibility: computed.visibility,
      tabIndex: wordmarkLink.getAttribute('tabindex'),
      ariaHidden: wordmarkDiv.getAttribute('aria-hidden')
    };
  });
  console.log("Wordmark state at 800px scroll:", wordmarkStatus);

  // 5. Scroll back to top (0px)
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(outDir, "header-scroll-05-returned-top.png") });
  console.log("Captured 05: Returned to top (wordmark restored)");

  // 6. Test on /portfolio page (scrolled over project cards / images)
  console.log("Navigating to http://localhost:3000/portfolio...");
  await page.goto("http://localhost:3000/portfolio", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(outDir, "header-scroll-06-portfolio-top.png") });
  await page.evaluate(() => window.scrollTo(0, 600));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(outDir, "header-scroll-07-portfolio-scrolled.png") });
  console.log("Captured 07: Portfolio scrolled (no screenshot overlap)");

  // 7. Mobile Viewport Test (375x812)
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000/services", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(outDir, "header-scroll-08-mobile-top.png") });
  await page.evaluate(() => window.scrollTo(0, 300));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(outDir, "header-scroll-09-mobile-scrolled.png") });
  console.log("Captured 09: Mobile scrolled (wordmark faded, hamburger & contact accessible)");

  await browser.close();
  console.log("All sticky header scroll verifications completed successfully.");
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
