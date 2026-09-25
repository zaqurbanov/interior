/**
 * A summary shortened for <meta name="description">: Google shows about 155
 * characters, so longer text is cut at the last full sentence (or word) that fits.
 * Descriptions written in the admin's SEO field are used as they are.
 */
export function metaDescription(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const sentence = cut.lastIndexOf(". ");
  if (sentence > max * 0.6) return cut.slice(0, sentence + 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:–—-]$/, "")}…`;
}
