/**
 * The visitor's IP. On Vercel the platform sets x-forwarded-for itself; behind
 * our own server, only trust it when the proxy (nginx) overwrites it.
 */
export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "";
}
