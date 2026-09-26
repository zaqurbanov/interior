import "server-only";
import sanitizeHtml from "sanitize-html";
import { isAllowedImageUrl } from "./upload-config";

// Project and service descriptions. The admin editor (Tiptap) saves HTML; older
// records and the imported defaults are plain text with blank lines between
// paragraphs. Both render through toHtml().

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "h2", "h3", "strong", "em", "u", "s", "a", "ul", "ol", "li", "blockquote"],
  allowedAttributes: { a: ["href", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: {
    // External links open in a new tab; internal ones stay put.
    a: (_tag, attribs) => {
      const href = attribs.href ?? "";
      const external: sanitizeHtml.Attributes = /^https?:\/\//.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};
      return { tagName: "a", attribs: { href, ...external } };
    },
  },
};

const isHtml = (s: string) => /^\s*<(p|h[23]|ul|ol|blockquote)[\s>]/i.test(s);

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Plain text (blank-line paragraphs) → HTML paragraphs. */
export const textToHtml = (s: string) =>
  s
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escape(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

/** Clean editor output before it is stored. Empty editors save "". */
export function sanitizeRichText(input: string): string {
  // Empty paragraphs (Enter pressed at the end) would add stray gaps on the page.
  return sanitizeHtml(input, OPTIONS).replace(/<p>(\s|<br\s*\/?>)*<\/p>/g, "").trim();
}

/** Safe HTML for any stored description, old or new. */
export const toHtml = (content: string) => (isHtml(content) ? sanitizeHtml(content, OPTIONS) : textToHtml(content));


/* ---------------- Articles ---------------- */

// Articles may also hold images (uploaded or from the media library only) and
// get anchor ids on their section headings for the table of contents.

const ARTICLE_OPTIONS: sanitizeHtml.IOptions = {
  ...OPTIONS,
  allowedTags: [...(OPTIONS.allowedTags as string[]), "img"],
  allowedAttributes: { ...OPTIONS.allowedAttributes, img: ["src", "alt"] },
  exclusiveFilter: (frame) => frame.tag === "img" && !isAllowedImageUrl(frame.attribs.src ?? ""),
};

/** Clean article HTML before it is stored. */
export function sanitizeArticle(input: string): string {
  return sanitizeHtml(input, ARTICLE_OPTIONS).replace(/<p>(\s|<br\s*\/?>)*<\/p>/g, "").trim();
}

const plain = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&[a-z#0-9]+;/gi, " ").trim();
const anchor = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "section";

/** Safe article HTML for the page, with h2 anchors, plus the h2 list for a table of contents. */
export function articleHtml(content: string): { html: string; headings: { id: string; text: string }[] } {
  const clean = sanitizeHtml(content, ARTICLE_OPTIONS);
  const headings: { id: string; text: string }[] = [];
  const used = new Set<string>();
  const html = clean
    .replace(/<h2>([\s\S]*?)<\/h2>/g, (_m, inner: string) => {
      const text = plain(inner);
      let id = anchor(text);
      for (let n = 2; used.has(id); n++) id = `${anchor(text)}-${n}`;
      used.add(id);
      headings.push({ id, text });
      return `<h2 id="${id}">${inner}</h2>`;
    })
    .replace(/<img /g, '<img loading="lazy" decoding="async" ');
  return { html, headings };
}

/** Image URLs inside article HTML (for the media library's "used by"). */
export const articleImages = (content: string) => [...content.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);

/** About 200 words a minute, at least one. */
export const readingMinutes = (content: string) => Math.max(1, Math.round(plain(content).split(/\s+/).filter(Boolean).length / 200));
