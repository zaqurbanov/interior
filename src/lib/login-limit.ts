import "server-only";
import { createHash } from "node:crypto";
import { LoginAttempt } from "@/models";

// Slows password guessing on the admin sign-in. Failed attempts are counted per
// IP and per email for 15 minutes; both are stored only as salted hashes.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 5;
// Higher, so someone guessing from many addresses is slowed without an
// easy way to lock the studio out of its own panel.
const MAX_PER_EMAIL = 20;

const hash = (s: string) => createHash("sha256").update(`${process.env.AUTH_SECRET ?? ""}:login:${s}`).digest("hex").slice(0, 32);

export type LoginKeys = string[];

export function loginKeys(ip: string, email: string): LoginKeys {
  return [ip && `ip:${hash(ip)}`, `email:${hash(email.toLowerCase())}`].filter(Boolean);
}

export async function isLoginBlocked(keys: LoginKeys) {
  const since = new Date(Date.now() - WINDOW_MS);
  const counts = await Promise.all(keys.map((key) => LoginAttempt.countDocuments({ key, at: { $gte: since } })));
  return keys.some((key, i) => counts[i] >= (key.startsWith("ip:") ? MAX_PER_IP : MAX_PER_EMAIL));
}

export async function recordLoginFailure(keys: LoginKeys) {
  await LoginAttempt.insertMany(keys.map((key) => ({ key })));
}

export async function clearLoginFailures(keys: LoginKeys) {
  await LoginAttempt.deleteMany({ key: { $in: keys } });
}
