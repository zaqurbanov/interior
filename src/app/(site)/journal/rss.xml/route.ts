import { articleDate, getArticles, getSiteContent, siteUrl } from "@/lib/data";

// RSS feed of the journal, for feed readers and aggregators.
export const revalidate = 3600;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function GET() {
  const [articles, site] = await Promise.all([getArticles({ limit: 50 }), getSiteContent()]);
  const url = siteUrl();
  const items = articles
    .map(
      (a) => `    <item>
      <title>${esc(a.title)}</title>
      <link>${url}/journal/${a.slug}</link>
      <guid isPermaLink="true">${url}/journal/${a.slug}</guid>
      <pubDate>${new Date(articleDate(a)).toUTCString()}</pubDate>
      ${a.category ? `<category>${esc(a.category)}</category>` : ""}
      <description>${esc(a.excerpt)}</description>
    </item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(site.brandName)} Journal</title>
    <link>${url}/journal</link>
    <description>${esc(site.tagline)}</description>
    <language>en-gb</language>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
