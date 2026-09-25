"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState, useTransition } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { deleteProject, reorderProjects } from "@/app/actions/admin";
import DeleteButton from "./DeleteButton";

export type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  location: string;
  coverImage: string;
  featured: boolean;
  status: "draft" | "scheduled" | "live";
  publishAt: string;
};

/** Formatted in the browser, in the admin's time zone (the server's differs). */
function LocalTime({ iso }: { iso: string }) {
  const [text, setText] = useState("");
  useEffect(() => setText(new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })), [iso]);
  return <time dateTime={iso}>{text}</time>;
}

function StatusBadge({ row }: { row: ProjectRow }) {
  if (row.status === "draft") return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Draft</span>;
  if (row.status === "scheduled")
    return <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-800">Scheduled · <LocalTime iso={row.publishAt} /></span>;
  return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">Published</span>;
}

function Row({ row, position }: { row: ProjectRow; position: number }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 bg-white p-3 md:gap-4 md:p-4 ${isDragging ? "relative z-10 shadow-lg" : ""}`}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`Move ${row.title}`}
        className="cursor-grab touch-none px-1 text-lg leading-none text-graphite hover:text-ink active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <span className="w-5 text-right text-xs tabular-nums text-graphite">{position}</span>
      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-sand">
        {row.coverImage && <Image src={row.coverImage} alt="" fill sizes="64px" className="object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{row.title}</p>
        <p className="truncate text-xs text-graphite">/{row.slug} · {row.location}</p>
      </div>
      <div className="hidden flex-wrap justify-end gap-2 sm:flex">
        <StatusBadge row={row} />
        {row.featured && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Featured</span>}
      </div>
      <div className="flex shrink-0 gap-4">
        <Link href={`/admin/projects/${row.id}`} className="text-sm hover:underline">Edit</Link>
        <DeleteButton action={deleteProject.bind(null, row.id)} />
      </div>
    </li>
  );
}

/** Projects in site order; drag the handle to reorder (saved immediately). */
export default function ProjectList({ projects }: { projects: ProjectRow[] }) {
  const [rows, setRows] = useState(projects);
  const [status, setStatus] = useState("");
  const [pending, start] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const dndId = useId(); // stable ids for dnd-kit's aria attributes across SSR and hydration

  // A deleted or added project arrives as new props after revalidation.
  const [seen, setSeen] = useState(projects);
  if (seen !== projects) {
    setSeen(projects);
    setRows(projects);
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const next = arrayMove(rows, rows.findIndex((r) => r.id === active.id), rows.findIndex((r) => r.id === over.id));
    const previous = rows;
    setRows(next);
    setStatus("Saving…");
    start(async () => {
      const res = await reorderProjects(next.map((r) => r.id)).catch((e: Error) => ({ ok: false, message: e.message }));
      if (!res.ok) setRows(previous);
      setStatus(res.message);
    });
  }

  if (!rows.length) {
    return (
      <p className="rounded-lg border border-black/5 bg-white p-6 text-sm text-graphite">
        No projects yet. Run <code>npm run seed</code> or create one.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-graphite" role="status">
        {pending || status ? status : "Drag ⠿ to change the order projects appear in on the site."}
      </p>
      <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <ul className="divide-y divide-black/5 overflow-hidden rounded-lg border border-black/5 bg-white">
            {rows.map((r, i) => (
              <Row key={r.id} row={r} position={i + 1} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
