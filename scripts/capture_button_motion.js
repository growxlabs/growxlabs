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

  await page.goto("http://localhost:3000/services", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));

  // Dismiss cookie banner if present
  try {
    const acceptBtn = await page.$('button:has-text("ACCEPT ALL")');
    if (acceptBtn) await acceptBtn.click();
    await new Promise((r) => setTimeout(r, 300));
  } catch (e) {}

  // Find the first card CTA button
  const buttons = await page.$$("a, button");
  let targetBtn = null;
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes("GET IN TOUCH")) {
      targetBtn = b;
      break;
    }
  }

  if (targetBtn) {
    // Scroll into view
    await page.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }), targetBtn);
    await new Promise((r) => setTimeout(r, 600));

    // 1. Default state
    await page.screenshot({ path: path.join(outDir, "button-motion-01-default.png") });
    console.log("Captured default state scrolled to card");

    const box = await targetBtn.boundingBox();
    if (box) {
      // Hover over button
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      // Wait 300ms for mid-flight rising animation
      await new Promise((r) => setTimeout(r, 300));
      await page.screenshot({ path: path.join(outDir, "button-motion-02-rising.png") });
      console.log("Captured mid-flight rising state (300ms)");

      // Wait until 750ms for completed full hover fill
      await new Promise((r) => setTimeout(r, 450));
      await page.screenshot({ path: path.join(outDir, "button-motion-03-filled.png") });
      console.log("Captured full filled state (750ms)");

      // Move mouse away to trigger downward retreat
      await page.mouse.move(50, 50);
      await new Promise((r) => setTimeout(r, 250));
      await page.screenshot({ path: path.join(outDir, "button-motion-04-retreating.png") });
      console.log("Captured retreating state");
    }
  }

  // Scroll back to top to test Navbar CONTACT button
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 400));

  let navContact = null;
  const allLinks = await page.$$("a, button");
  for (const b of allLinks) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.trim() === "CONTACT") {
      navContact = b;
      break;
    }
  }

  if (navContact) {
    const box = await navContact.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await new Promise((r) => setTimeout(r, 750));
      await page.screenshot({ path: path.join(outDir, "button-motion-05-nav-hover.png") });
      console.log("Captured navbar contact hover state");
    }
  }

  await browser.close();
  console.log("All button motion screenshots captured successfully.");
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
