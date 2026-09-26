/** "12 March 2026" — the site's date style (UTC, so server and browser agree). */
export const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";
