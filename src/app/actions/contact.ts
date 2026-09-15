"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { contactSchema, type FormState } from "@/lib/validators";
import { Message } from "@/models";

export async function sendMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: "Please check the highlighted fields.", errors: parsed.error.flatten().fieldErrors };
  }
  // Honeypot filled: pretend success for bots.
  if (parsed.data.company) return { ok: true, message: "Thank you — we will be in touch shortly." };

  try {
    await connectDB();
    const { company: _c, ...data } = parsed.data;
    await Message.create(data);
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Thank you — we will be in touch shortly." };
  } catch (err) {
    console.error("[contact]", err);
    return { ok: false, message: "Sorry, your message could not be sent. Please email us directly." };
  }
}
