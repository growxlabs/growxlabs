const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

async function capture() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    defaultViewport: { width: 1440, height: 950 },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const outDir = "C:/Users/LENOVO/.gemini/antigravity/brain/1e4f21e7-55f2-4d3e-8e08-f9dba5625eed";

  // 1. Desktop Research Page
  console.log("Navigating to http://localhost:3000/research...");
  await page.goto("http://localhost:3000/research", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 800));

  try {
    const buttons = await page.$$("button");
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes("ACCEPT ALL")) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 300));
  } catch (e) {}

  // Scroll to research cards section
  const section = await page.$('h2');
  if (section) {
    await page.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }), section);
    await new Promise(r => setTimeout(r, 600));
  }
  await page.screenshot({ path: path.join(outDir, "research-portfolio-cards-desktop.png") });
  console.log("Captured Research cards desktop view");

  // Hover over the first card button (Explore AI Lab)
  const buttonsOnCard = await page.$$("article a");
  let targetBtn = null;
  for (const a of buttonsOnCard) {
    const text = await page.evaluate(el => el.textContent, a);
    if (text && text.includes("EXPLORE AI LAB")) {
      targetBtn = a;
      break;
    }
  }

  if (targetBtn) {
    const box = await targetBtn.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await new Promise(r => setTimeout(r, 750));
      await page.screenshot({ path: path.join(outDir, "research-portfolio-cards-hover.png") });
      console.log("Captured Research card button hover");
    }
  }

  // 2. Mobile Viewport (375x812)
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000/research", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 600));
  const mobileSection = await page.$('h2');
  if (mobileSection) {
    await page.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }), mobileSection);
    await new Promise(r => setTimeout(r, 400));
  }
  await page.screenshot({ path: path.join(outDir, "research-portfolio-cards-mobile.png") });
  console.log("Captured Research cards mobile view");

  await browser.close();
  console.log("All research captures completed successfully.");
}

capture().catch(console.error);
