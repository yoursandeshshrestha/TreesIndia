"use client";

import { useMemo } from "react";
import "./HTMLRenderer.css";

interface HTMLRendererProps {
  html: string;
  className?: string;
  stripDataAttributes?: boolean;
}

export default function HTMLRenderer({
  html,
  className = "",
  stripDataAttributes = false,
}: HTMLRendererProps) {
  const processedHtml = useMemo(() => {
    if (!html) return "";

    if (stripDataAttributes) {
      // Remove data-start and data-end attributes added by TinyMCE
      return html.replace(/\s+data-(start|end)="[^"]*"/g, "");
    }

    return html;
  }, [html, stripDataAttributes]);

  if (!processedHtml) return null;

  return (
    <div
      className={`html-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
      style={{
        lineHeight: "1.6",
      }}
    />
  );
}



