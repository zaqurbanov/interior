"use client";

import { useEffect, useMemo, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectCard from "./ProjectCard";
import type { ProjectData } from "@/lib/types";

export default function ProjectGrid({ projects }: { projects: ProjectData[] }) {
  const categories = useMemo(() => ["All", ...new Set(projects.map((p) => p.category).filter(Boolean))], [projects]);
  const [active, setActive] = useState("All");
  const list = active === "All" ? projects : projects.filter((p) => p.category === active);

  useEffect(() => {
    // Cards already revealed stay visible; newly mounted ones should not wait for a scroll.
    document.querySelectorAll<HTMLElement>("[data-grid] .reveal").forEach((el) => el.setAttribute("data-revealed", ""));
    ScrollTrigger.refresh();
  }, [active]);

  return (
    <>
      <div role="tablist" aria-label="Filter projects" className="container-x mb-14 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={active === c}
            onClick={() => setActive(c)}
            className={`rounded-full border px-5 py-2 text-sm transition ${
              active === c ? "border-ink bg-ink text-ivory" : "border-ink/20 text-ink hover:border-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <section data-grid className="container-x grid gap-x-8 gap-y-20 pb-32 md:grid-cols-2">
        {list.map((p, i) => (
          <div key={p.slug} className={i % 2 === 1 ? "md:mt-32" : ""}>
            <ProjectCard project={p} index={i} />
          </div>
        ))}
        {!list.length && <p className="text-graphite">New projects coming soon.</p>}
      </section>
    </>
  );
}
