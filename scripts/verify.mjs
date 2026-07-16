// Headless verification of the portfolio: real rAF, real rendering.
// Screenshots land in the scratchpad; findings print as JSON lines.
import puppeteer from "puppeteer-core";

const OUT = process.argv[2];
const URL = "http://localhost:3001";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (name, data) => console.log(`CHECK ${name}: ${JSON.stringify(data)}`);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--window-size=1440,900", "--force-device-scale-factor=1"],
});

try {
  // ---------- DESKTOP / FULL MODE ----------
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto(URL, { waitUntil: "domcontentloaded" });

  // Preloader: sample the counter while frames load.
  await sleep(500);
  const midCounter = await page.evaluate(
    () => document.querySelector(".fixed.inset-0.z-50 .font-mono")?.textContent ?? "gone",
  );
  await page.screenshot({ path: `${OUT}\\v-preloader.png` });

  // Wait for reveal (preloader min 1.8s + wipe 1.1s).
  await page.waitForFunction(
    () => !document.querySelector(".fixed.inset-0.z-50") ||
      getComputedStyle(document.querySelector(".fixed.inset-0.z-50")).display === "none",
    { timeout: 30000 },
  );
  const afterCounter = midCounter; // counter mid-load sample reported below
  log("preloader", { midCounter: afterCounter, revealed: true });
  await sleep(600);
  await page.screenshot({ path: `${OUT}\\v-hero-top.png` });

  // Canvas painted? Sample hero canvas pixels.
  const heroPainted = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    if (!c) return { canvas: false };
    const ctx = c.getContext("2d");
    const d = ctx.getImageData(0, 0, Math.min(200, c.width), Math.min(200, c.height)).data;
    let nonBlack = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 24) nonBlack++;
    return { canvas: true, nonBlackPx: nonBlack };
  });
  log("heroCanvas", heroPainted);

  // Letters hidden at top?
  log("lettersAtTop", await page.evaluate(() => {
    const l = document.querySelectorAll("[data-letter]");
    return { count: l.length, firstOpacity: getComputedStyle(l[0]).opacity };
  }));

  // Scrub: scroll into the hero pin, letters should track in and frame advance.
  const scrollAndShot = async (y, name, settle = 1200) => {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
    await sleep(settle);
    await page.screenshot({ path: `${OUT}\\${name}.png` });
  };

  await scrollAndShot(1400, "v-hero-mid"); // ~50% of 300vh pin
  log("lettersMid", await page.evaluate(() => {
    const l = document.querySelectorAll("[data-letter]");
    const vis = Array.from(l).filter((el) => parseFloat(getComputedStyle(el).opacity) > 0.5).length;
    return { visible: vis, total: l.length };
  }));

  const docH = await page.evaluate(() => document.documentElement.scrollHeight);
  log("pageHeight", { docH, viewports: +(docH / 900).toFixed(1) });

  // Stats strip: scroll to it, counters should fire once.
  const statsY = await page.evaluate(() => {
    const el = document.querySelectorAll("main > div")[0];
    return el ? el.getBoundingClientRect().top + window.scrollY - 500 : 2800;
  });
  await scrollAndShot(statsY, "v-stats", 2000);
  log("stats", await page.evaluate(() => Array.from(document.querySelectorAll("[data-num]")).map((e) => e.textContent)));

  // Chapters: mid-pin screenshots + canvas paint check.
  const chapterInfo = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("main > section")).slice(1, 5).map((s) => ({
      top: s.getBoundingClientRect().top + window.scrollY,
      h: s.getBoundingClientRect().height,
    }));
  });
  for (let i = 0; i < chapterInfo.length; i++) {
    const { top, h } = chapterInfo[i];
    await scrollAndShot(top + h * 0.55, `v-chapter-${i + 1}`, 1600);
  }
  log("chapterCanvases", await page.evaluate(() => {
    return Array.from(document.querySelectorAll("canvas")).map((c) => {
      const ctx = c.getContext("2d");
      if (!c.width) return 0;
      const d = ctx.getImageData(0, 0, Math.min(120, c.width), Math.min(120, c.height)).data;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 24) n++;
      return n;
    });
  }));

  // Work cards: scroll, hover to test tilt.
  const workY = await page.evaluate(() => {
    const h = Array.from(document.querySelectorAll("h2")).find((e) => e.textContent === "Work");
    return h ? h.getBoundingClientRect().top + window.scrollY - 200 : 0;
  });
  await scrollAndShot(workY, "v-work", 1800);
  const card = await page.$("[data-card]");
  if (card) {
    const box = await card.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.3);
      await sleep(700);
      log("cardTilt", await page.evaluate(() => {
        const el = document.querySelector("[data-card]");
        return { transform: getComputedStyle(el).transform.slice(0, 60) };
      }));
      await page.screenshot({ path: `${OUT}\\v-work-hover.png` });
    }
  }

  // Finale.
  await scrollAndShot(docH - 2200, "v-finale-mid", 1500);
  await scrollAndShot(docH - 1200, "v-finale", 1800);
  log("finaleCtas", await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll("#contact a")).map((e) => ({
      text: e.textContent.trim(),
      href: e.getAttribute("href"),
      opacity: getComputedStyle(e.closest("div")).opacity,
    }));
    return a;
  }));
  await scrollAndShot(docH, "v-footer", 1000);

  // Lazy-loading check: which clips actually fetched?
  log("lazyLoad", await page.evaluate(() => {
    const counts = {};
    for (const r of performance.getEntriesByType("resource")) {
      const m = r.name.match(/frames\/(clip-\d)\//);
      if (m) counts[m[1]] = (counts[m[1]] ?? 0) + 1;
    }
    return counts;
  }));

  log("consoleErrors", errors);
  await page.close();

  // ---------- MOBILE / LITE MODE ----------
  const m = await browser.newPage();
  const mErrors = [];
  m.on("console", (msg) => { if (msg.type() === "error") mErrors.push(msg.text()); });
  m.on("pageerror", (e) => mErrors.push(`pageerror: ${e.message}`));
  await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await m.goto(URL, { waitUntil: "domcontentloaded" });
  await m.waitForFunction(
    () => !document.querySelector(".fixed.inset-0.z-50") ||
      getComputedStyle(document.querySelector(".fixed.inset-0.z-50")).display === "none",
    { timeout: 30000 },
  );
  await sleep(500);
  await m.screenshot({ path: `${OUT}\\v-mobile-hero.png` });
  log("mobile", await m.evaluate(() => ({
    canvases: document.querySelectorAll("canvas").length,
    heroClass: document.querySelector("main > section")?.className,
    frameReqs: performance.getEntriesByType("resource").filter((r) => r.name.includes("/frames/")).length,
  })));
  const mDocH = await m.evaluate(() => document.documentElement.scrollHeight);
  await m.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), mDocH * 0.45);
  await sleep(1200);
  await m.screenshot({ path: `${OUT}\\v-mobile-chapter.png` });
  await m.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), mDocH);
  await sleep(1500);
  await m.screenshot({ path: `${OUT}\\v-mobile-footer.png` });
  log("mobileErrors", mErrors);
  await m.close();

  // ---------- REDUCED MOTION ----------
  const r = await browser.newPage();
  await r.setViewport({ width: 1440, height: 900 });
  await r.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await r.goto(URL, { waitUntil: "domcontentloaded" });
  await r.waitForFunction(
    () => !document.querySelector(".fixed.inset-0.z-50") ||
      getComputedStyle(document.querySelector(".fixed.inset-0.z-50")).display === "none",
    { timeout: 30000 },
  );
  await sleep(500);
  await r.screenshot({ path: `${OUT}\\v-reduced.png` });
  log("reducedMotion", await r.evaluate(() => ({
    canvases: document.querySelectorAll("canvas").length,
    posters: document.querySelectorAll("main img").length,
    statsText: Array.from(document.querySelectorAll("[data-num]")).map((e) => e.textContent),
  })));
  await r.close();

  console.log("VERIFY COMPLETE");
} finally {
  await browser.close();
}
