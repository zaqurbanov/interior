// One-off importer: copies projects, team, services and images from
// https://www.vladimir-fasij.com (with the owner's permission) into
//   public/images/**            (WebP, max 1920px)
//   src/lib/source-content.json (consumed by src/lib/defaults.ts)
// Usage: node scripts/import-source.mjs   (requires ffmpeg on PATH)
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const BASE = "https://www.vladimir-fasij.com";
const UA = { "User-Agent": "Mozilla/5.0 (site migration)" };
const TMP = path.join(os.tmpdir(), "vf-import");
mkdirSync(TMP, { recursive: true });

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
const strip = (s) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

async function html(p) {
  const res = await fetch(BASE + p, { headers: UA });
  if (!res.ok) throw new Error(`${p}: ${res.status}`);
  return res.text();
}

/** Full-size image URLs in document order (drops responsive -p-NNN variants). */
function images(h) {
  const urls = [...h.matchAll(/https:\/\/cdn\.prod\.website-files\.com\/[^"' ,)]+?\.(?:jpe?g|png|webp)/gi)]
    .map((m) => m[0])
    .filter((u) => !/-p-\d+\.\w+$/.test(u) && !u.includes("/img/") && !/logo|icon/i.test(u));
  return [...new Set(urls)];
}

async function saveImage(url, outFile) {
  if (existsSync(outFile)) return true;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) return console.warn("  ! download failed", url), false;
  const src = path.join(TMP, path.basename(outFile) + path.extname(new URL(url).pathname));
  writeFileSync(src, Buffer.from(await res.arrayBuffer()));
  mkdirSync(path.dirname(outFile), { recursive: true });
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", src, "-vf", "scale='min(1920,iw)':-2", "-c:v", "libwebp", "-quality", "80", outFile]);
  rmSync(src);
  return true;
}

const pad = (n) => String(n).padStart(2, "0");
const slugMap = { "villa-at-saadyat-island": "villa-at-saadiyat-island", "cap-martin": "villa-luna-cap-martin", "nudra-uae": "villa-nudra", "cap-d-ail": "cap-d-ail" };

// ---------- Portfolio grid ----------
const portfolio = await html("/portfolio");
const intro = strip((portfolio.match(/Our latest projects[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/) || [])[1] || "");
const cards = portfolio.split(/href="\/portfoliocard\//).slice(1).map((chunk) => {
  const srcSlug = chunk.split('"')[0];
  const texts = chunk.slice(0, 4000).replace(/<[^>]+>/g, "|").split("|").map((s) => decode(s).trim()).filter((s) => s && !s.includes("=") && !s.includes(">"));
  const cover = (chunk.match(/src="(https:[^"]+)"/) || [])[1];
  return { srcSlug, texts, cover };
});

const projects = [];
let order = 0;
for (const card of cards) {
  order++;
  const { srcSlug } = card;
  const slug = slugMap[srcSlug] ?? srcSlug;
  console.log(`project ${slug}`);
  const page = await html(`/portfoliocard/${srcSlug}`);
  const title = strip((page.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || card.texts[0]);
  const paras = [...page.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => strip(m[1])).filter((t) => t.length > 120);
  const categoryRaw = card.texts.find((t) => /^(interior|exterior|3d animation)$/i.test(t)) ?? "";
  const subtitle = card.texts.filter((t) => t !== categoryRaw && !/^(HOME|SERVICES|ABOUT|CONTACT)$/.test(t))[1] ?? "";
  const cardTitle = card.texts[0];

  const urls = images(page);
  if (card.cover && !urls.includes(card.cover)) urls.unshift(card.cover);
  const coverIdx = Math.max(0, urls.indexOf(card.cover));
  const files = [];
  for (let i = 0; i < urls.length; i++) {
    const rel = `/images/projects/${slug}/${pad(i + 1)}.webp`;
    if (await saveImage(urls[i], path.join("public", rel))) files.push(rel);
  }
  const coverImage = files[coverIdx] ?? files[0] ?? "";
  const videos = [
    ...[...page.matchAll(/youtube\.com%2Fwatch%3Fv%3D([A-Za-z0-9_-]{6,})/g)].map((m) => `youtube:${m[1]}`),
    ...[...page.matchAll(/vimeo\.com%2F(\d{5,})/g)].map((m) => `vimeo:${m[1]}`),
  ];

  projects.push({
    slug,
    title: cardTitle || title,
    subtitle,
    category: categoryRaw.replace(/\b\w/g, (c) => c.toUpperCase()).replace("3d", "3D"),
    summary: subtitle,
    content: paras.join("\n\n"),
    coverImage,
    gallery: files.filter((f) => f !== coverImage),
    videos: [...new Set(videos)],
    order,
  });
}

// ---------- Team (about page) ----------
const about = await html("/about");
const team = [];
const teamRe = /(https:\/\/cdn\.prod\.website-files\.com\/[^"' ,]+?\.(?:png|jpe?g))"[\s\S]*?>([A-Z]{3,})<[\s\S]*?>([^<]{3,60})<[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g;
for (const m of about.matchAll(teamRe)) {
  const name = m[2][0] + m[2].slice(1).toLowerCase();
  // A locally supplied portrait (e.g. dmitrij-portrait.webp) replaces the source image.
  const portrait = `/images/team/${name.toLowerCase()}-portrait.webp`;
  const rel = existsSync(path.join("public", portrait)) ? portrait : `/images/team/${name.toLowerCase()}.webp`;
  if (rel !== portrait) await saveImage(m[1], path.join("public", rel));
  team.push({ name, role: strip(m[3]), bio: strip(m[4]).replace(/^Vadimir/, "Vladimir"), photo: rel });
}
const aboutParas = [...about.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => strip(m[1])).filter((t) => t.length > 150).slice(0, 2);

// ---------- Home: about text, services, showreel ----------
const home = await html("/");
const serviceImages = images(home);
// Home-page images in document order, matched to services by what they show
// (villa exterior, living room, garden, Chelsea lounge, armchair detail).
const serviceSlugsWithImage = ["3d-visualisation", "3d-animation", "architecture-landscaping", "interior-design", "furniture-ffe"];
const serviceImageMap = {};
for (let i = 0; i < serviceSlugsWithImage.length && i < serviceImages.length; i++) {
  const rel = `/images/services/${serviceSlugsWithImage[i]}-v2.webp`;
  if (await saveImage(serviceImages[i], path.join("public", rel))) serviceImageMap[serviceSlugsWithImage[i]] = rel;
}
// CAD drawings: a joinery drawing sheet from the Belgravia project.
const belgraviaDrawing = projects.find((p) => p.slug === "belgravia")?.gallery[0];
if (belgraviaDrawing) {
  const rel = "/images/services/cad-drawings-v2.webp";
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", path.join("public", belgraviaDrawing), "-c", "copy", path.join("public", rel)]);
  serviceImageMap["cad-drawings"] = rel;
}
const showreel = (home.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/) || [])[1] ?? "";

const out = { importedAt: new Date().toISOString(), portfolioIntro: intro, aboutParagraphs: aboutParas, team, projects, serviceImages: serviceImageMap, showreel };
writeFileSync("src/lib/source-content.json", JSON.stringify(out, null, 2));
console.log(`\nDone: ${projects.length} projects, ${projects.reduce((n, p) => n + p.gallery.length + 1, 0)} project images, ${team.length} team members.`);
