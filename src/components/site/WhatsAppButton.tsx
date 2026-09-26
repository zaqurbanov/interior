"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { whatsappHref } from "@/lib/contact-links";

// Desktop and tablet: a round WhatsApp button fixed to the bottom right, with a
// soft pulse. Phones already have it in the bottom contact bar. Shown only
// when a WhatsApp number is set (admin → Site content → Contact).
export default function WhatsAppButton({ number }: { number: string }) {
  const pathname = usePathname();
  // On a project page the message names the project.
  const [project, setProject] = useState("");
  useEffect(() => {
    const t = window.setTimeout(
      () => setProject(pathname.startsWith("/projects/") ? (document.querySelector("main h1")?.textContent?.trim().slice(0, 120) ?? "") : ""),
      50,
    );
    return () => window.clearTimeout(t);
  }, [pathname]);

  if (!number) return null;
  const text = project ? `Hello, I saw ${project} on your website and would like to talk about my project.` : "Hello, I would like to talk about my project.";

  return (
    <a
      href={whatsappHref(number, text)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="whatsapp-float group fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-105 md:flex"
    >
      <svg viewBox="0 0 32 32" className="relative h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M16.004 3C8.826 3 3 8.826 3 16c0 2.294.6 4.535 1.74 6.51L3 29l6.66-1.713A12.94 12.94 0 0 0 16.004 29C23.18 29 29 23.174 29 16S23.18 3 16.004 3Zm0 23.64c-2.01 0-3.98-.54-5.7-1.56l-.41-.24-3.95 1.02 1.05-3.85-.27-.42A10.6 10.6 0 0 1 5.36 16c0-5.87 4.77-10.64 10.644-10.64 5.87 0 10.636 4.77 10.636 10.64 0 5.87-4.766 10.64-10.636 10.64Zm5.83-7.97c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.66 0 1.57 1.14 3.08 1.3 3.3.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.15-1.52.27-.74.27-1.38.19-1.52-.08-.13-.29-.21-.61-.37Z" />
      </svg>
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs text-ivory opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
        Chat on WhatsApp
      </span>
    </a>
  );
}
