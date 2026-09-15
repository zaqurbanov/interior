/** "Vladimir - Fasij" wordmark, as used in the navigation of vladimir-fasij.com. */
export const LEGAL_NAME = "A&V Interiors Ltd";

export function initials(brandName: string) {
  return brandName
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export default function Logo({ brandName, className = "" }: { brandName: string; className?: string }) {
  const [first, ...rest] = brandName.split(/\s*-\s*/);
  return (
    <span className={`inline-flex items-center gap-[0.35em] font-serif font-semibold uppercase tracking-[0.08em] ${className}`}>
      <span>{first}</span>
      {rest.length > 0 && (
        <>
          <span aria-hidden="true" className="inline-block h-px w-[0.7em] bg-current opacity-70" />
          <span className="sr-only"> - </span>
          <span>{rest.join(" ")}</span>
        </>
      )}
    </span>
  );
}
