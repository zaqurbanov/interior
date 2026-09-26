import "server-only";
import type { MessageData } from "./types";

// Transactional email through Resend's HTTP API (no SDK needed).
//   RESEND_API_KEY  — without it nothing is sent (the enquiry is still saved)
//   MAIL_FROM       — a sender on a domain verified in Resend,
//                     e.g. "Vladimir - Fasij <studio@vladimir-fasij.com>"
//   NOTIFY_EMAIL    — who gets new-enquiry alerts (comma-separated); falls
//                     back to the contact email from Site content
// Until a domain is verified Resend only accepts its test sender
// onboarding@resend.dev, which can mail the Resend account owner only.

type Mail = { to: string[]; subject: string; html: string; text: string; replyTo?: string };

export const mailConfigured = () => Boolean(process.env.RESEND_API_KEY);

async function send(mail: Mail) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "Vladimir - Fasij <onboarding@resend.dev>",
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const para = (s: string) => esc(s).replace(/\n/g, "<br>");

function layout(inner: string, brand: string) {
  return `<!doctype html><html><body style="margin:0;background:#f5f2ed;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#1b1a18">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
<p style="margin:0 0 24px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#8f7155">${esc(brand)}</p>
${inner}
</div></body></html>`;
}

/** Alert to the studio. Replying goes straight to the client (Reply-To). */
export async function sendEnquiryAlert(m: MessageData, opts: { to: string[]; brand: string; adminUrl: string }) {
  if (!opts.to.length) return;
  const rows = [
    ["Name", m.name],
    ["Email", m.email],
    ["Phone", m.phone],
    ["Project type", m.subject],
  ].filter(([, v]) => v);
  const html = layout(
    `<h1 style="margin:0 0 16px;font-size:20px">New enquiry from ${esc(m.name)}</h1>
<table style="border-collapse:collapse;font-size:14px;margin-bottom:16px">${rows
      .map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#6b665f">${k}</td><td style="padding:4px 0">${esc(v)}</td></tr>`)
      .join("")}</table>
<p style="font-size:15px;line-height:1.6;margin:0 0 24px">${para(m.body)}</p>
<a href="${esc(opts.adminUrl)}" style="display:inline-block;background:#1b1a18;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:14px">Open in admin</a>
<p style="font-size:12px;color:#6b665f;margin:24px 0 0">Reply to this email to answer ${esc(m.name)} directly.</p>`,
    opts.brand,
  );
  const text = `New enquiry from ${m.name}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${m.body}\n\n${opts.adminUrl}`;
  await send({ to: opts.to, subject: `New enquiry — ${m.name}${m.subject ? ` (${m.subject})` : ""}`, html, text, replyTo: m.email });
}

/**
 * Acknowledgement to the client. Anyone can type any address into the form, so
 * this must carry nothing the sender wrote — otherwise it is a free way to mail
 * their text from the studio's domain. Only a plain first name is kept.
 */
export async function sendEnquiryReceipt(m: MessageData, opts: { brand: string; replyTo: string; siteUrl: string }) {
  const first = m.name.trim().split(/\s+/)[0] ?? "";
  const greeting = /^[\p{L}'-]{1,30}$/u.test(first) ? `Thank you, ${first}` : "Thank you";
  const html = layout(
    `<h1 style="margin:0 0 16px;font-size:20px">${esc(greeting)}</h1>
<p style="font-size:15px;line-height:1.6;margin:0 0 24px">We have received your enquiry and will reply within one or two working days.</p>
<p style="font-size:14px;margin:0">${esc(opts.brand)}<br><a href="${esc(opts.siteUrl)}" style="color:#8f7155">${esc(opts.siteUrl.replace(/^https?:\/\//, ""))}</a></p>`,
    opts.brand,
  );
  const text = `${greeting}.\n\nWe have received your enquiry and will reply within one or two working days.\n\n${opts.brand}\n${opts.siteUrl}`;
  await send({ to: [m.email], subject: `We received your enquiry — ${opts.brand}`, html, text, replyTo: opts.replyTo || undefined });
}
