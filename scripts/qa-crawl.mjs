// QA crawl: opens every public page on desktop and phone, scrolls it through,
// and lists what is broken — HTTP errors, JS errors, failed requests, broken
// links and images, horizontal overflow, missing alt text / titles / h1, etc.
// Used by the QA agent (.claude/agents/qa.md); also runs on its own:
//
//   npm run build && npx next start -p 3000 &
//   node scripts/qa-crawl.mjs --base=http://localhost:3000
//
// Options: --base=URL (default http://localhost:3000), --max=N pages (default 150),
// --only=desktop|mobile, --out=DIR (default qa-reports/<timestamp>).
// Writes report.json, report.md and screenshots/ to the output folder.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, devices } from "playwright";

const arg = (name, fallback) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=") ?? fallback;
const BASE = arg("base", process.env.QA_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
const MAX = Number(arg("max", "150"));
const ONLY = arg("only", "");
const OUT = arg("out", path.join("qa-reports", new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)));
const SHOTS = path.join(OUT, "screenshots");
mkdirSync(SHOTS, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", options: { viewport: { width: 1440, height: 900 } } },
  { name: "mobile", options: { ...devices["iPhone 13"] } },
].filter((v) => !ONLY || v.name === ONLY);

/** Found problems: { severity: "error" | "warning" | "info", page, viewport, check, detail } */
const issues = [];
const add = (severity, page, viewport, check, detail) => issues.push({ severity, page, viewport, check, detail });

const origin = new URL(BASE).origin;
const normalise = (href) => {
  try {
    const u = new URL(href, BASE);
    if (u.origin !== origin) return null;
    u.hash = "";
    u.search = "";
    const p = u.pathname.replace(/\/+$/, "") || "/";
    if (p.startsWith("/api") || p.startsWith("/_next") || /\.[a-z0-9]{2,5}$/i.test(p)) return null;
    // The admin needs a session; only its sign-in page is public.
    if (p.startsWith("/admin") && p !== "/admin/login") return null;
    return p;
  } catch {
    return null;
  }
};

// Start from the sitemap (its URLs carry the production domain — keep the paths).
const queue = ["/", "/admin/login"];
try {
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const p = normalise(new URL(m[1]).pathname);
    if (p) queue.push(p);
  }
} catch (err) {
  add("error", "/sitemap.xml", "-", "sitemap", `Could not read the sitemap: ${err.message}`);
}
const seen = new Set();
const pages = [];
for (const p of queue) {
  if (seen.has(p) || pages.length >= MAX) continue;
  seen.add(p);
  pages.push(p);
}

const browser = await chromium.launch();
const linkStatus = new Map(); // path -> status, checked once
const slug = (p) => (p === "/" ? "home" : p.slice(1).replace(/\//g, "__"));

async function checkPage(context, viewport, p) {
  const page = await context.newPage();
  const consoleErrors = [];
  const failed = [];
  const external = [];
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
  page.on("pageerror", (e) => add("error", p, viewport, "js-exception", e.message.slice(0, 300)));
  page.on("requestfailed", (r) => {
    const reason = r.failure()?.errorText ?? "";
    // Media requests are cancelled on purpose (range requests, navigation away).
    if (/ERR_ABORTED|NS_BINDING_ABORTED/.test(reason)) return;
    // Other sites (YouTube thumbnails, fonts…) are reported apart: a blocked
    // network in the test machine is not a site bug.
    if (r.url().startsWith(origin)) failed.push(`${r.url().replace(origin, "")} — ${reason}`);
    else external.push(`${new URL(r.url()).host} — ${reason}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400 && r.url().startsWith(origin)) failed.push(`${r.url().replace(origin, "")} — HTTP ${r.status()}`);
  });

  let status = 0;
  try {
    const res = await page.goto(BASE + p, { waitUntil: "load", timeout: 45000 });
    status = res?.status() ?? 0;
  } catch (err) {
    add("error", p, viewport, "load", `Page did not load: ${err.message.split("\n")[0]}`);
    await page.close();
    return [];
  }
  if (status >= 400) add("error", p, viewport, "http-status", `HTTP ${status}`);

  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SHOTS, `${slug(p)}--${viewport}--top.png`) });

  // Phones hold the page on an autoplaying walkthrough until its arrow is tapped.
  const cont = page.getByRole("button", { name: /continue/i }).first();
  if (viewport === "mobile" && (await cont.isVisible().catch(() => false))) await cont.click().catch(() => {});

  // Scroll through in screen-sized steps so reveals, lazy images and sequences run.
  await page.evaluate(async () => {
    const lenis = window.__lenis;
    const step = window.innerHeight * 0.9;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    await new Promise((r) => setTimeout(r, 600));
  });
  await page.screenshot({ path: path.join(SHOTS, `${slug(p)}--${viewport}--bottom.png`) });

  const facts = await page.evaluate(() => {
    const vw = window.innerWidth;
    const visible = (el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.display !== "none" && s.visibility !== "hidden" && r.width > 0 && r.height > 0;
    };
    const describe = (el) =>
      `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${el.className && typeof el.className === "string" ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}` : ""}`;
    // Content cut off by an overflow-hidden frame (shimmers, parallax, sliders) is not an overflow.
    const clipped = (el) => {
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const s = getComputedStyle(a);
        if (/hidden|clip|auto|scroll/.test(s.overflowX)) return true;
      }
      return false;
    };
    const docOverflow = document.documentElement.scrollWidth > vw + 1;
    const overflow = [...document.querySelectorAll("body *")]
      .filter((el) => {
        if (!docOverflow) return false;
        const r = el.getBoundingClientRect();
        return r.right > vw + 1 && r.width > 0 && visible(el) && getComputedStyle(el).position !== "fixed" && !clipped(el);
      })
      // Only the outermost offenders.
      .filter((el, _, all) => !all.some((o) => o !== el && o.contains(el)))
      .slice(0, 5)
      .map((el) => `${describe(el)} (right edge ${Math.round(el.getBoundingClientRect().right)}px > ${vw}px)`);
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
      try {
        JSON.parse(s.textContent);
        return null;
      } catch (e) {
        return e.message;
      }
    });
    return {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content ?? "",
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? "",
      lang: document.documentElement.lang,
      h1: [...document.querySelectorAll("h1")].filter(visible).map((h) => h.textContent.trim().slice(0, 80)),
      docOverflow,
      overflow,
      brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).map((i) => i.currentSrc),
      noAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).map((i) => i.currentSrc || i.src).slice(0, 10),
      stillHidden: [...document.querySelectorAll(".reveal:not([data-revealed])")].filter((e) => e.getBoundingClientRect().top < window.innerHeight).length,
      duplicateIds: [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))],
      badJsonLd: jsonLd.filter(Boolean),
      unsafeBlank: [...document.querySelectorAll('a[target="_blank"]')].filter((a) => !/noopener|noreferrer/.test(a.rel)).map((a) => a.href),
      emptyLinks: [...document.querySelectorAll("a, button")].filter((el) => visible(el) && !el.textContent.trim() && !el.getAttribute("aria-label") && !el.querySelector("img[alt]:not([alt=''])") && !el.title).map(describe).slice(0, 5),
      smallTargets: [...document.querySelectorAll("a, button, input, select, textarea")]
        .filter((el) => {
          if (!visible(el) || el.classList.contains("sr-only")) return false;
          const r = el.getBoundingClientRect();
          return r.width < 24 || r.height < 24;
        })
        .map((el) => `${describe(el)} ${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)}`)
        .slice(0, 5),
      links: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
    };
  });

  if (!facts.title) add("error", p, viewport, "seo", "Missing <title>");
  if (viewport === "desktop") {
    if (!facts.description && p !== "/admin/login") add("warning", p, viewport, "seo", "Missing meta description");
    else if (facts.description.length > 170) add("info", p, viewport, "seo", `Meta description is ${facts.description.length} characters (Google shows ~155)`);
    if (!facts.lang) add("warning", p, viewport, "a11y", "<html> has no lang attribute");
    if (facts.h1.length !== 1 && p !== "/admin/login") add("warning", p, viewport, "seo", `${facts.h1.length} visible <h1> elements${facts.h1.length ? `: ${facts.h1.join(" | ")}` : ""}`);
    for (const e of facts.badJsonLd) add("error", p, viewport, "structured-data", `JSON-LD does not parse: ${e}`);
    for (const id of facts.duplicateIds) add("warning", p, viewport, "html", `Duplicate id="${id}"`);
    for (const h of facts.unsafeBlank) add("info", p, viewport, "security", `target=_blank without rel=noopener: ${h}`);
  }
  if (facts.docOverflow || facts.overflow.length) add("warning", p, viewport, "layout", `Horizontal overflow: ${facts.overflow.join("; ") || "document wider than the screen"}`);
  for (const src of facts.brokenImages) {
    if (src.startsWith(origin) || src.startsWith("/")) add("error", p, viewport, "image", `Broken image: ${src.replace(origin, "")}`);
    else add("info", p, viewport, "external-request", `External image did not load: ${src}`);
  }
  if (facts.noAlt.length) add("warning", p, viewport, "a11y", `Images without alt: ${facts.noAlt.map((s) => s.replace(origin, "")).join(", ")}`);
  if (facts.stillHidden) add("warning", p, viewport, "reveal", `${facts.stillHidden} .reveal elements still hidden after scrolling`);
  for (const d of facts.emptyLinks) add("warning", p, viewport, "a11y", `Link/button with no accessible name: ${d}`);
  if (viewport === "mobile" && facts.smallTargets.length) add("info", p, viewport, "a11y", `Tap targets under 24px: ${facts.smallTargets.join(", ")}`);
  for (const e of [...new Set(consoleErrors)]) {
    // "Failed to load resource" repeats a request already listed above.
    if (/^Failed to load resource/.test(e)) continue;
    add("warning", p, viewport, "console", e.slice(0, 300));
  }
  for (const f of [...new Set(failed)]) add("error", p, viewport, "request", f);
  for (const f of [...new Set(external)]) add("info", p, viewport, "external-request", f);

  await page.close();
  return facts.links;
}

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ ...vp.options, ignoreHTTPSErrors: true });
  // Crawl: the queue grows with links found on each page (desktop pass only).
  const todo = [...pages];
  for (let i = 0; i < todo.length && i < MAX; i++) {
    const p = todo[i];
    process.stdout.write(`\r${vp.name}: ${i + 1}/${todo.length} ${p}`.padEnd(90));
    const links = await checkPage(context, vp.name, p);
    for (const href of links) {
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) continue;
      const n = normalise(href);
      if (!n) continue;
      if (!linkStatus.has(n)) linkStatus.set(n, { from: p, status: null });
      if (!seen.has(n) && vp.name === VIEWPORTS[0].name && todo.length < MAX) {
        seen.add(n);
        pages.push(n);
        todo.push(n);
      }
    }
  }
  await context.close();
  console.log();
}

// Every internal link, once.
for (const [p, info] of linkStatus) {
  try {
    const res = await fetch(BASE + p, { redirect: "follow" });
    info.status = res.status;
    if (res.status >= 400) add("error", info.from, "-", "broken-link", `Link to ${p} returns HTTP ${res.status}`);
  } catch (err) {
    add("error", info.from, "-", "broken-link", `Link to ${p} failed: ${err.message}`);
  }
}
await browser.close();

// Same problem on many pages → one line with the page list.
const grouped = new Map();
for (const i of issues) {
  const key = `${i.severity}|${i.check}|${i.viewport}|${i.detail}`;
  const g = grouped.get(key) ?? { ...i, pages: [] };
  g.pages.push(i.page);
  grouped.set(key, g);
}
const order = { error: 0, warning: 1, info: 2 };
const rows = [...grouped.values()].sort((a, b) => order[a.severity] - order[b.severity] || a.check.localeCompare(b.check));

writeFileSync(path.join(OUT, "report.json"), JSON.stringify({ base: BASE, pages, issues: rows }, null, 2));
const md = [
  `# QA report — ${BASE}`,
  "",
  `${pages.length} pages × ${VIEWPORTS.map((v) => v.name).join(" + ")}, ${linkStatus.size} internal links checked. ${new Date().toISOString()}`,
  "",
  `**${rows.filter((r) => r.severity === "error").length} errors, ${rows.filter((r) => r.severity === "warning").length} warnings, ${rows.filter((r) => r.severity === "info").length} info.**`,
  "",
  "| # | Severity | Check | Viewport | Detail | Pages |",
  "|---|---|---|---|---|---|",
  ...rows.map((r, i) => {
    const where = r.pages.length > 4 ? `${r.pages.slice(0, 4).join(", ")} +${r.pages.length - 4}` : r.pages.join(", ");
    return `| ${i + 1} | ${r.severity} | ${r.check} | ${r.viewport} | ${r.detail.replace(/\|/g, "\\|").replace(/\n/g, " ")} | ${where} |`;
  }),
  "",
  "## Pages",
  "",
  ...pages.map((p) => `- ${p}`),
  "",
].join("\n");
writeFileSync(path.join(OUT, "report.md"), md);
console.log(`\n${rows.length} distinct issues → ${path.join(OUT, "report.md")}`);
