"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { IMAGE_ACCEPT } from "@/lib/upload-config";
import { uploadImage } from "@/lib/upload-client";
import { useNotifyChange } from "./fields";
import MediaPicker from "./MediaPicker";

// Description editor. Saves HTML into a hidden input; the server sanitises it
// (lib/rich-text.ts) and the public pages render it with the same allow-list:
// paragraphs, two heading levels, bold/italic/underline, lists, quotes, links.
// With `images` (articles) it can also place images: uploaded here or picked
// from the media library, each with alt text.

function ToolButton({ on, label, title, onClick, disabled }: { on?: boolean; label: React.ReactNode; title: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={on}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the editor's selection
      onClick={onClick}
      className={`grid h-8 min-w-8 cursor-pointer place-items-center rounded px-2 text-sm disabled:cursor-not-allowed disabled:opacity-30 ${
        on ? "bg-ink text-ivory" : "text-graphite hover:bg-black/5 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

/** Insert-image control: upload a new file or reuse one from the library. */
function ImageButton({ editor }: { editor: Editor }) {
  const input = useRef<HTMLInputElement>(null);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);

  const insert = (src: string) => {
    const alt = window.prompt("Describe the image for Google and screen readers (alt text)", "") ?? "";
    editor.chain().focus().setImage({ src, alt: alt.trim() }).run();
  };

  return (
    <>
      <span data-uploading={busy !== null ? "true" : undefined} className="contents">
        <ToolButton title={busy !== null ? `Uploading ${Math.round(busy)}%` : "Upload an image"} label={busy !== null ? `${Math.round(busy)}%` : "Image"} disabled={busy !== null} onClick={() => input.current?.click()} />
      </span>
      <ToolButton title="Image from the media library" label="Library" onClick={() => setPicking(true)} />
      <input
        ref={input}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(0);
          try {
            const done = await uploadImage(file, { onProgress: setBusy });
            insert(done.url);
          } catch (err) {
            window.alert((err as Error).message);
          } finally {
            setBusy(null);
          }
        }}
      />
      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onSelect={([url]) => {
            setPicking(false);
            if (url) insert(url);
          }}
        />
      )}
    </>
  );
}

function Toolbar({ editor, images }: { editor: Editor; images?: boolean }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      undo: e.can().undo(),
      redo: e.can().redo(),
    }),
  });
  const chain = () => editor.chain().focus();

  const setLink = () => {
    const current = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Link address (leave empty to remove)", current ?? "https://");
    if (href === null) return;
    if (!href.trim()) chain().extendMarkRange("link").unsetLink().run();
    else chain().extendMarkRange("link").setLink({ href: href.trim() }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-black/10 p-1">
      <ToolButton title="Heading" label="H2" on={s.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()} />
      <ToolButton title="Subheading" label="H3" on={s.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()} />
      <span className="mx-1 h-5 w-px bg-black/10" />
      <ToolButton title="Bold" label={<b>B</b>} on={s.bold} onClick={() => chain().toggleBold().run()} />
      <ToolButton title="Italic" label={<i>I</i>} on={s.italic} onClick={() => chain().toggleItalic().run()} />
      <ToolButton title="Underline" label={<u>U</u>} on={s.underline} onClick={() => chain().toggleUnderline().run()} />
      <span className="mx-1 h-5 w-px bg-black/10" />
      <ToolButton title="Bulleted list" label="• List" on={s.bullet} onClick={() => chain().toggleBulletList().run()} />
      <ToolButton title="Numbered list" label="1. List" on={s.ordered} onClick={() => chain().toggleOrderedList().run()} />
      <ToolButton title="Quote" label="“ ”" on={s.quote} onClick={() => chain().toggleBlockquote().run()} />
      <ToolButton title="Link" label="Link" on={s.link} onClick={setLink} />
      {images && (
        <>
          <span className="mx-1 h-5 w-px bg-black/10" />
          <ImageButton editor={editor} />
        </>
      )}
      <span className="ml-auto" />
      <ToolButton title="Undo" label="↶" disabled={!s.undo} onClick={() => chain().undo().run()} />
      <ToolButton title="Redo" label="↷" disabled={!s.redo} onClick={() => chain().redo().run()} />
    </div>
  );
}

export default function RichTextEditor({
  name,
  label,
  defaultValue = "",
  error,
  hint,
  images,
}: {
  name: string;
  label: string;
  /** HTML (plain text is converted to paragraphs on the server before it gets here). */
  defaultValue?: string;
  error?: string[];
  hint?: string;
  /** Allow images in the text (articles). */
  images?: boolean;
}) {
  const [html, setHtml] = useState(defaultValue);
  const notify = useNotifyChange(html);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      ...(images ? [Image.configure({ inline: false, allowBase64: false })] : []),
    ],
    content: defaultValue,
    immediatelyRender: false,
    editorProps: { attributes: { class: "rich-text min-h-56 px-3 py-2 focus:outline-none", "aria-label": label } },
    onUpdate: ({ editor: e }) => setHtml(e.isEmpty ? "" : e.getHTML()),
  });

  return (
    <div>
      <p className="label">{label}</p>
      <input ref={notify} type="hidden" name={name} value={html} />
      <div className="overflow-hidden rounded-md border border-[#d8d2c8] bg-white focus-within:border-bronze focus-within:shadow-[0_0_0_3px_rgb(143_113_85/0.15)]">
        {editor ? <Toolbar editor={editor} images={images} /> : <div className="h-10 border-b border-black/10" />}
        <EditorContent editor={editor} />
      </div>
      {hint && !error && <p className="mt-1 text-xs text-graphite">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-700">{error[0]}</p>}
    </div>
  );
}
