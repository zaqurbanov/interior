"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/messages", label: "Enquiries" },
  { href: "/admin/content", label: "Site content & SEO" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="mt-6 flex gap-1 overflow-x-auto md:flex-col">
      {items.map((i) => {
        const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm transition ${
              active ? "bg-ink text-ivory" : "text-graphite hover:bg-black/5"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
