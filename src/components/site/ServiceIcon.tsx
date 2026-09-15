const paths: Record<string, React.ReactNode> = {
  cube: <><path d="M12 3 3 7.5v9L12 21l9-4.5v-9L12 3Z" /><path d="M3 7.5 12 12l9-4.5M12 12v9" /></>,
  play: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m10 9 5 3-5 3V9Z" /></>,
  vr: <><path d="M3 8h18v8h-6l-2-2h-2l-2 2H3V8Z" /><circle cx="7.5" cy="12" r="1.5" /><circle cx="16.5" cy="12" r="1.5" /></>,
  building: <><path d="M4 21V8l8-5 8 5v13" /><path d="M9 21v-6h6v6M3 21h18" /></>,
  sofa: <><path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" /><path d="M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2v-5ZM5 18v2M19 18v2" /></>,
  chair: <><path d="M7 3h10v8H7z" /><path d="M5 11h14v3H5zM7 14v7M17 14v7" /></>,
  ruler: <><path d="m3 17 14-14 4 4L7 21l-4-4Z" /><path d="m7 13 2 2M10 10l2 2M13 7l2 2" /></>,
};

export const serviceIconNames = Object.keys(paths);

export default function ServiceIcon({ name, className = "h-7 w-7" }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.1} className={className} aria-hidden="true">
      {paths[name] ?? paths.cube}
    </svg>
  );
}
