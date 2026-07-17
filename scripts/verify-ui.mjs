// Headless verification of the contact/WEI modals, social stack, resume,
// and work-card links. Usage: node scripts/verify-ui.mjs <screenshot-dir>
import puppeteer from "puppeteer-core";

const OUT = process.argv[2];
const URL = "http://localhost:3001";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (name, data) => console.log(`CHECK ${name}: ${JSON.stringify(data)}`);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--window-size=1440,900"],
});

try {
  const ctx = browser.defaultBrowserContext();
  await ctx.overridePermissions(URL, ["clipboard-read", "clipboard-write", "clipboard-sanitized-write"]);

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

  // Resume must be served
  const res = await page.goto(`${URL}/resume.pdf`);
  log("resumePdf", { status: res.status(), type: res.headers()["content-type"] });

  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => !document.querySelector(".fixed.inset-0.z-50") ||
      getComputedStyle(document.querySelector(".fixed.inset-0.z-50")).display === "none",
    { timeout: 30000 },
  );

  // --- Work cards: hrefs + WEI button ---
  const workY = await page.evaluate(() => {
    const h = Array.from(document.querySelectorAll("h2")).find((e) => e.textContent === "Work");
    return h.getBoundingClientRect().top + window.scrollY - 100;
  });
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), workY);
  await sleep(1500);
  log("cardLinks", await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-card]")).map((c) => {
      const a = c.closest("a");
      const b = c.closest("button");
      return { wrapper: a ? "a" : b ? "button" : "none", href: a?.href ?? null, target: a?.target ?? null };
    }),
  ));
  await page.screenshot({ path: `${OUT}\\u-work.png` });

  // --- WEI gate modal ---
  const weiCard = (await page.$$("[data-card]"))[2];
  await weiCard.click();
  await sleep(700);
  const gate = await page.evaluate(() => {
    const overlay = document.querySelector(".modal-overlay");
    return {
      open: !!overlay,
      blur: overlay ? getComputedStyle(overlay).backdropFilter : null,
      closeX: !!overlay?.querySelector('[aria-label="Close"]'),
      demoHref: overlay?.querySelector("a")?.href ?? null,
    };
  });
  log("weiModal", gate);
  await page.screenshot({ path: `${OUT}\\u-wei-modal.png` });
  // Esc must NOT close it
  await page.keyboard.press("Escape");
  await sleep(400);
  log("weiEscIgnored", await page.evaluate(() => !!document.querySelector(".modal-overlay")));
  // "Back to portfolio" closes
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll(".modal-overlay button"));
    btns.find((b) => /back/i.test(b.textContent))?.click();
  });
  await sleep(400);
  log("weiBackCloses", await page.evaluate(() => !document.querySelector(".modal-overlay")));

  // --- Contact modal ---
  const docH = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), docH - 1100);
  await sleep(1800);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("#contact button"));
    btns.find((b) => /contact me/i.test(b.textContent))?.click();
  });
  await sleep(700);
  log("contactModal", await page.evaluate(() => {
    const overlay = document.querySelector(".modal-overlay");
    return {
      open: !!overlay,
      rows: Array.from(overlay?.querySelectorAll(".font-mono.text-base, .font-mono.text-lg") ?? []).map((e) => e.textContent),
      closeX: !!overlay?.querySelector('[aria-label="Close"]'),
    };
  }));
  await page.screenshot({ path: `${OUT}\\u-contact-modal.png` });

  // Copy the phone number, check feedback + clipboard content
  await page.evaluate(() => {
    document.querySelector('[aria-label="Copy phone"]')?.click();
  });
  await sleep(400);
  const copied = await page.evaluate(async () => ({
    feedback: document.querySelector('[aria-label="Copy phone"]')?.textContent.trim(),
    clipboard: await navigator.clipboard.readText().catch(() => "unreadable"),
  }));
  log("copyPhone", copied);
  await page.screenshot({ path: `${OUT}\\u-contact-copied.png` });
  await sleep(2300);
  log("copyReverts", await page.evaluate(() =>
    document.querySelector('[aria-label="Copy phone"]')?.textContent.trim() === "",
  ));
  // Esc closes contact modal
  await page.keyboard.press("Escape");
  await sleep(400);
  log("contactEscCloses", await page.evaluate(() => !document.querySelector(".modal-overlay")));

  // --- Social stack ---
  log("socials", await page.evaluate(() =>
    Array.from(document.querySelectorAll(".social-stack")).map((a) => ({
      label: a.getAttribute("aria-label"),
      href: a.href,
    })),
  ));
  const li = await page.$('.social-stack[aria-label="LinkedIn"]');
  const box = await li.boundingBox();
  await page.mouse.move(box.x + 26, box.y + 26);
  await sleep(700);
  await page.screenshot({ path: `${OUT}\\u-social-hover.png` });

  // --- Footer: old link row gone ---
  log("footerLinks", await page.evaluate(() =>
    Array.from(document.querySelectorAll("footer a")).map((a) => a.textContent),
  ));

  log("consoleErrors", errors);
  console.log("UI VERIFY COMPLETE");
} finally {
  await browser.close();
}
