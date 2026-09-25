"use client";

/** Shown on phones when an autoplayed sequence has finished. */
export default function ReplayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-4 bottom-[calc(1.75rem+env(safe-area-inset-bottom))] flex cursor-pointer items-center gap-2 rounded-full border border-ink/50 bg-ivory/35 px-4 py-2 text-xs tracking-wide text-ink backdrop-blur-sm transition-colors hover:bg-ink hover:text-ivory"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-4 w-4" aria-hidden="true">
        <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Replay
    </button>
  );
}
