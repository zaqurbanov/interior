"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { after } from "next/server";
import { getSiteContent, siteUrl, toMessage } from "@/lib/data";
import { connectDB } from "@/lib/db";
import { sendEnquiryAlert, sendEnquiryReceipt } from "@/lib/mail";
import { contactSchema, type FormState } from "@/lib/validators";
import { Message } from "@/models";

const THANKS = "Thank you — we will be in touch shortly.";

// Spam rules. Bots get the normal thank-you so they learn nothing.
const MIN_FILL_MS = 3000; // faster than a person can fill the form
const LIMITS = [
  { windowMs: 10 * 60 * 1000, max: 3 },
  { windowMs: 24 * 60 * 60 * 1000, max: 10 },
];
const MAX_LINKS = 3;

async function clientIpHash() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
  if (!ip) return "";
  // Salted so the stored value cannot be turned back into an address.
  return createHash("sha256").update(`${process.env.AUTH_SECRET ?? ""}:${ip}`).digest("hex").slice(0, 32);
}

export async function sendMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: "Please check the highlighted fields.", errors: parsed.error.flatten().fieldErrors };
  }
  const { company, startedAt, ...data } = parsed.data;
  // Honeypot filled, or submitted faster than a person could type: drop quietly.
  if (company) return { ok: true, message: THANKS };
  if (startedAt && Date.now() - Number(startedAt) < MIN_FILL_MS) return { ok: true, message: THANKS };

  try {
    await connectDB();
    const ipHash = await clientIpHash();
    if (ipHash) {
      for (const { windowMs, max } of LIMITS) {
        const recent = await Message.countDocuments({ ipHash, createdAt: { $gte: new Date(Date.now() - windowMs) } });
        if (recent >= max) {
          return { ok: false, message: "You have sent several messages already — we will reply to those. For anything urgent, please email us." };
        }
      }
    }

    // Link-stuffed messages are kept (in case of a false positive) but filed as spam, with no emails.
    const links = (data.body.match(/https?:\/\/|www\./gi) ?? []).length;
    const spam = links > MAX_LINKS;
    const doc = await Message.create({ ...data, ipHash, status: spam ? "spam" : "new" });
    revalidatePath("/admin", "layout");

    if (!spam) {
      const message = toMessage(doc.toObject());
      // Sent after the response, so the visitor never waits on the mail provider.
      after(async () => {
        const site = await getSiteContent();
        const to = (process.env.NOTIFY_EMAIL || site.contact.email).split(",").map((s) => s.trim()).filter(Boolean);
        const results = await Promise.allSettled([
          sendEnquiryAlert(message, { to, brand: site.brandName, adminUrl: `${siteUrl()}/admin/messages?q=${encodeURIComponent(message.email)}` }),
          sendEnquiryReceipt(message, { brand: site.brandName, replyTo: site.contact.email, siteUrl: siteUrl() }),
        ]);
        for (const r of results) if (r.status === "rejected") console.error("[contact] email failed:", r.reason);
      });
    }
    return { ok: true, message: THANKS };
  } catch (err) {
    console.error("[contact]", err);
    return { ok: false, message: "Sorry, your message could not be sent. Please email us directly." };
  }
}
