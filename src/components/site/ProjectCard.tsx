import Image from "next/image";
import Link from "next/link";
import type { ProjectData } from "@/lib/types";

export default function ProjectCard({ project, index, large }: { project: ProjectData; index: number; large?: boolean }) {
  return (
    <Link href={`/projects/${project.slug}`} className="reveal group block">
      <div className={`relative overflow-hidden bg-sand ${large ? "aspect-[4/3] md:aspect-[16/10]" : "aspect-[4/3]"}`}>
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={`${project.title} — ${project.category || "interior project"} in ${project.location}`}
            fill
            sizes={large ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 768px) 40vw, 100vw"}
            className="object-cover transition duration-[1.4s] ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center font-serif text-5xl text-stone">{project.title}</div>
        )}
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-6">
        <div>
          <h3 className="font-serif text-3xl leading-tight text-ink md:text-4xl">{project.title}</h3>
          <p className="mt-1 text-sm text-graphite">
            {[project.category, project.location].filter(Boolean).join(" · ")}
          </p>
        </div>
        <span className="eyebrow shrink-0 text-[0.62rem] text-ink/40">{String(index + 1).padStart(2, "0")}</span>
      </div>
    </Link>
  );
}
