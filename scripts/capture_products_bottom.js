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

  await page.goto("http://localhost:3000/products", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 600));

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

  // Find the first product card button and scroll it into center
  const articleLinks = await page.$$("article a");
  let firstProductBtn = null;
  for (const a of articleLinks) {
    const text = await page.evaluate(el => el.textContent, a);
    if (text && (text.includes("LAUNCH") || text.includes("Launch"))) {
      firstProductBtn = a;
      break;
    }
  }

  if (firstProductBtn) {
    await page.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }), firstProductBtn);
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(outDir, "products-card-bottom-rest.png") });

    const box = await firstProductBtn.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await new Promise(r => setTimeout(r, 750));
      await page.screenshot({ path: path.join(outDir, "products-card-bottom-hover.png") });
    }
  }

  await browser.close();
  console.log("Captured bottom cards successfully.");
}

capture().catch(console.error);
