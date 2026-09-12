"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/toc";

export default function GuideArticle({
  titleHtml,
  contentHtml,
  headings,
}: {
  titleHtml: string;
  contentHtml: string;
  headings: Heading[];
}) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-100px 0px -70% 0px" }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {headings.length > 0 && (
        <aside className="lg:col-span-1 hidden lg:block">
          <div className="sticky top-24 bg-white border border-gray-100 rounded-2xl p-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Nội dung</h2>
            <ul className="space-y-1 border-l-2 border-gray-100">
              {headings.map((h) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    className={`block py-1.5 text-sm -ml-0.5 border-l-2 transition ${
                      h.level === 3 ? "pl-6" : "pl-3"
                    } ${
                      activeId === h.id
                        ? "border-blue-700 text-blue-700 font-semibold"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}

      <article className={headings.length > 0 ? "lg:col-span-3" : "lg:col-span-4"}>
        <h1 className="text-2xl font-black text-gray-900 mb-6" dangerouslySetInnerHTML={{ __html: titleHtml }} />
        <div className="guide-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        <style>{GUIDE_CONTENT_CSS}</style>
      </article>
    </div>
  );
}

const STEP_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899"];

const GUIDE_CONTENT_CSS = `
  .guide-content {
    font-size: 0.875rem;
    line-height: 1.7;
    color: #374151;
  }
  .guide-content > * + * { margin-top: 1rem; }
  .guide-content h2 {
    font-weight: 900;
    font-size: 1.25rem;
    color: #111827;
    margin-top: 2.5rem;
    scroll-margin-top: 6rem;
  }
  .guide-content h3 {
    font-weight: 700;
    font-size: 1rem;
    color: #111827;
    margin-top: 1.5rem;
    scroll-margin-top: 6rem;
  }
  .guide-content ul { list-style: disc; padding-left: 1.25rem; }
  .guide-content ol { list-style: decimal; padding-left: 1.25rem; }
  .guide-content a { color: #1d4ed8; text-decoration: underline; }
  .guide-content img { border-radius: 0.75rem; margin: 0 auto; }

  .guide-content .wp-block-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  .guide-content .wp-block-column {
    background: #f9fafb;
    border-radius: 0.75rem;
    padding: 1rem;
  }

  .guide-content .wp-block-table { overflow-x: auto; }
  .guide-content table { width: 100%; border-collapse: collapse; }
  .guide-content th, .guide-content td { border: 1px solid #e5e7eb; padding: 0.5rem; text-align: left; }
  .guide-content th { background: #f9fafb; }

  .guide-content .wp-block-buttons { display: flex; gap: 0.75rem; }
  .guide-content .wp-block-button__link {
    display: inline-block;
    background: #1d4ed8;
    color: #fff;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    text-decoration: none;
  }

  /* Standalone accordion (e.g. FAQ) */
  .guide-content details {
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    background: #fff;
    overflow: hidden;
  }
  .guide-content details + details { margin-top: 0.5rem; }
  .guide-content details summary {
    font-weight: 600;
    color: #1f2937;
    cursor: pointer;
    padding: 0.875rem 1rem;
  }
  .guide-content details > *:not(summary) {
    padding: 0 1rem 1rem;
    color: #4b5563;
  }

  /* Numbered step list, e.g. <div class="guide-steps"><details>...</details>...</div> */
  .guide-content .guide-steps {
    border: 1px solid #e5e7eb;
    border-radius: 1rem;
    overflow: hidden;
    background: #fff;
  }
  .guide-content .guide-steps details {
    border: 0;
    border-radius: 0;
    border-bottom: 1px solid #e5e7eb;
  }
  .guide-content .guide-steps details:last-child { border-bottom: 0; }
  .guide-content .guide-steps details + details { margin-top: 0; }
  .guide-content .guide-steps summary {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    list-style: none;
  }
  .guide-content .guide-steps summary::-webkit-details-marker { display: none; }
  .guide-content .guide-steps summary::before {
    content: "";
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 9999px;
    flex-shrink: 0;
    background: #3b82f6;
  }
  ${STEP_COLORS.map(
    (color, i) =>
      `.guide-content .guide-steps details:nth-of-type(${STEP_COLORS.length}n+${i + 1}) summary::before { background: ${color}; }`
  ).join("\n  ")}
  .guide-content .guide-steps summary::after {
    content: "⌄";
    margin-left: auto;
    color: #9ca3af;
    transition: transform 0.2s;
  }
  .guide-content .guide-steps details[open] summary::after { transform: rotate(180deg); }
  .guide-content .guide-steps details > *:not(summary) { padding-left: 2.25rem; }
`;
