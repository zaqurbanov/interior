import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import StoryEditor from "@/components/admin/StoryEditor";
import { connectDB } from "@/lib/db";
import { toStoryAdmin } from "@/lib/data";
import { getProjectStory } from "@/lib/project-story";
import { Project, Story } from "@/models";

export const metadata = { title: "Walkthrough" };

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const project = await Project.findById(id, { title: 1, slug: 1 }).lean();
  if (!project) notFound();
  const story = await Story.findOne({ slug: project.slug }).lean();

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/projects/${id}`} className="text-sm text-graphite hover:text-ink">← {project.title}</Link>
        <h1 className="mt-2 font-serif text-4xl">Walkthrough</h1>
        <p className="mt-2 max-w-2xl text-sm text-graphite">
          The scroll video at the top of the project page. Desktop visitors scrub it by scrolling; phones play it like a video. Here you edit its text and timing; new walkthroughs are made on a computer (docs/animasiya-yaratmaq.md).
        </p>
      </div>
      <StoryEditor
        projectId={id}
        projectTitle={project.title}
        slug={project.slug}
        story={story ? toStoryAdmin(story) : null}
        hasBuiltIn={Boolean(getProjectStory(project.slug))}
      />
    </div>
  );
}
