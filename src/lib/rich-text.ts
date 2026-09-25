import "server-only";
import sanitizeHtml from "sanitize-html";

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

