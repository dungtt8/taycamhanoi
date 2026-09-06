"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/toc";

const GUIDE_CONTENT_CLASS =
  "text-sm text-gray-700 leading-relaxed space-y-4 " +
  "[&_h2]:font-black [&_h2]:text-xl [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h2]:scroll-mt-24 " +
  "[&_h3]:font-bold [&_h3]:text-base [&_h3]:text-gray-900 [&_h3]:mt-6 " +
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 " +
  "[&_a]:text-blue-700 [&_a]:underline " +
  "[&_img]:rounded-xl [&_img]:mx-auto " +
  "[&_details]:border [&_details]:border-gray-200 [&_details]:rounded-xl [&_details]:p-4 [&_details]:bg-white " +
  "[&_summary]:font-semibold [&_summary]:text-gray-800 [&_summary]:cursor-pointer " +
  "[&_.wp-block-columns]:grid [&_.wp-block-columns]:grid-cols-1 [&_.wp-block-columns]:sm:grid-cols-3 [&_.wp-block-columns]:gap-4 " +
  "[&_.wp-block-column]:bg-gray-50 [&_.wp-block-column]:rounded-xl [&_.wp-block-column]:p-4 " +
  "[&_.wp-block-table]:overflow-x-auto " +
  "[&_table]:w-full [&_table]:border-collapse " +
  "[&_th]:border [&_th]:border-gray-200 [&_th]:bg-gray-50 [&_th]:p-2 [&_th]:text-left " +
  "[&_td]:border [&_td]:border-gray-200 [&_td]:p-2 " +
  "[&_.wp-block-buttons]:flex [&_.wp-block-buttons]:gap-3 " +
  "[&_.wp-block-button__link]:inline-block [&_.wp-block-button__link]:bg-blue-700 [&_.wp-block-button__link]:text-white [&_.wp-block-button__link]:font-semibold [&_.wp-block-button__link]:px-4 [&_.wp-block-button__link]:py-2 [&_.wp-block-button__link]:rounded-lg [&_.wp-block-button__link]:no-underline";

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
          <div className="sticky top-24">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Sommaire</h2>
            <ul className="space-y-1 border-l-2 border-gray-100">
              {headings.map((h) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    className={`block pl-3 py-1.5 text-sm -ml-0.5 border-l-2 transition ${
                      activeId === h.id
                        ? "border-red-600 text-red-600 font-semibold"
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
        <div className={GUIDE_CONTENT_CLASS} dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </article>
    </div>
  );
}
