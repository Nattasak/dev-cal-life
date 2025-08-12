"use client";

import { useRef, useState } from "react";

interface InfoIconProps {
  title: string;
  details: string;
}

export default function InfoIcon({ title, details }: InfoIconProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  return (
    <span
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={`Info: ${title}`}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setOpen(false);
          }
        }}
        className="ml-2 h-5 w-5 rounded-full border border-black/20 dark:border-white/20 text-xs flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20"
      >
        i
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute z-20 mt-2 w-72 -left-2 bg-white dark:bg-neutral-900 text-sm shadow-lg border border-black/10 dark:border-white/10 rounded p-3"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="font-medium mb-1">{title}</div>
          <p className="text-black/80 dark:text-white/80 whitespace-pre-wrap">
            {details}
          </p>
        </div>
      )}
    </span>
  );
}
