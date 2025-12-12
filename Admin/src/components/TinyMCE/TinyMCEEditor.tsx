"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";
import type { Editor as TinyMCEEditorType } from "tinymce";

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
}

export default function TinyMCEEditor({
  value,
  onChange,
  placeholder = "Enter description",
  height = 400,
  className = "",
}: TinyMCEEditorProps) {
  const editorRef = useRef<TinyMCEEditorType | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "";

  if (!apiKey) {
    console.warn(
      "TinyMCE API key is not set. Please set NEXT_PUBLIC_TINYMCE_API_KEY in your environment variables."
    );
  }

  return (
    <div className={className}>
      <Editor
        apiKey={apiKey}
        onInit={(evt, editor) => {
          editorRef.current = editor;
        }}
        value={value}
        onEditorChange={(content) => {
          onChange(content);
        }}
        init={{
          height: height,
          menubar: false,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          placeholder: placeholder,
        }}
      />
    </div>
  );
}




