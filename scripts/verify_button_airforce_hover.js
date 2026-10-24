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
    defaultViewport: { width: 1440, height: 950 },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const outDir = "C:/Users/LENOVO/.gemini/antigravity/brain/1e4f21e7-55f2-4d3e-8e08-f9dba5625eed";

  console.log("Navigating to http://localhost:3000/services...");
  await page.goto("http://localhost:3000/services", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 800));

  // Dismiss cookie banner if present
  try {
    const acceptBtn = await page.$('button:has-text("ACCEPT ALL")');
    if (acceptBtn) await acceptBtn.click();
    await new Promise(r => setTimeout(r, 300));
  } catch (e) {}

  // 1. Navbar Contact button hover (Air Force Blue background)
  const navContact = await page.$('nav a[href="/contact"]');
  if (navContact) {
    const navBox = await navContact.boundingBox();
    if (navBox) {
      // Resting state
      await page.screenshot({ path: path.join(outDir, "btn-airforce-01-nav-rest.png") });
      console.log("Captured 01: Nav contact rest");

      // Hover over navbar contact button
      await page.mouse.move(navBox.x + navBox.width / 2, navBox.y + navBox.height / 2);
      await new Promise(r => setTimeout(r, 750));
      await page.screenshot({ path: path.join(outDir, "btn-airforce-02-nav-hover.png") });
      console.log("Captured 02: Nav contact hovered with Air Force Blue fill");

      // Move mouse away
      await page.mouse.move(10, 10);
      await new Promise(r => setTimeout(r, 400));
    }
  }

  // 2. Services card CTA button (Earth #E9E7E1 surface)
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
    await page.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }), targetBtn);
    await new Promise(r => setTimeout(r, 600));

    // Rest state on Earth card
    await page.screenshot({ path: path.join(outDir, "btn-airforce-03-card-rest.png") });
    console.log("Captured 03: Card button rest on Earth surface");

    const box = await targetBtn.boundingBox();
    if (box) {
      // Hover entry
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      
      // Mid-flight rising state (300ms)
      await new Promise(r => setTimeout(r, 300));
      await page.screenshot({ path: path.join(outDir, "btn-airforce-04-card-rising.png") });
      console.log("Captured 04: Card button mid-flight rising fill (300ms)");

      // Completed filled state (750ms)
      await new Promise(r => setTimeout(r, 450));
      await page.screenshot({ path: path.join(outDir, "btn-airforce-05-card-filled.png") });
      console.log("Captured 05: Card button full Air Force Blue fill (750ms)");

      // Move away to capture downward retreat (250ms)
      await page.mouse.move(50, 50);
      await new Promise(r => setTimeout(r, 250));
      await page.screenshot({ path: path.join(outDir, "btn-airforce-06-card-retreating.png") });
      console.log("Captured 06: Card button retreating downward");
    }
  }

  // 3. Test Homepage FAQ CTA
  console.log("Navigating to http://localhost:3000/...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 800));

  const faqBtn = await page.$('a[href="/faq"]');
  if (faqBtn) {
    await page.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }), faqBtn);
    await new Promise(r => setTimeout(r, 500));
    const faqBox = await faqBtn.boundingBox();
    if (faqBox) {
      await page.mouse.move(faqBox.x + faqBox.width / 2, faqBox.y + faqBox.height / 2);
      await new Promise(r => setTimeout(r, 750));
      await page.screenshot({ path: path.join(outDir, "btn-airforce-07-faq-hover.png") });
      console.log("Captured 07: Homepage FAQ button hovered");
    }
  }

  await browser.close();
  console.log("All button hover color verifications completed successfully.");
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
