import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useState, useRef } from "react";

export default function ReportEditor({ initialContent, saveUrl }) {
  const saveTimeout = useRef(null);

  const doSave = async (html) => {
    if (!saveUrl) return;
    try {
      await fetch(saveUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: html }),
      });
    } catch (e) {
      // swallow network errors for now — optionally surface to UI
      console.error('Report save failed', e);
    }
  };

  const editor = useEditor({
    // NOTE: Tiptap detects SSR. Pass `immediatelyRender: false` at the
    // top-level option (not inside `editorProps`) so the editor doesn't try
    // to immediately render during server-side rendering and cause
    // hydration mismatches.
    extensions: [StarterKit, Image],
    content: initialContent,
    onUpdate({ editor }) {
      // debounce saves to avoid excessive network requests
      const html = editor.getHTML();
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      // save 700ms after last change
      saveTimeout.current = setTimeout(() => doSave(html), 700);
    },
    // Prevent immediate rendering during SSR to avoid hydration mismatches
    immediatelyRender: false,
    editorProps: {},
  });

  if (!editor) return <p>Loading editor...</p>;

  return <EditorContent editor={editor} />;
}
