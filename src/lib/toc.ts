const DIACRITICS_REGEX = /[̀-ͯ]/g;

function toSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Extracts H2/H3 headings from WordPress post HTML and injects matching `id`
 * attributes so the table-of-contents sidebar can link to them. H3s nest
 * under the closest preceding H2 in the rendered sidebar.
 */
export function extractHeadingsAndInjectIds(html: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const usedIds = new Set<string>();

  const updatedHtml = html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, inner) => {
    const text = inner.replace(/<[^>]*>/g, "").trim();
    if (!text) return match;

    let id = toSlug(text) || "section";
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${toSlug(text)}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);
    headings.push({ id, text, level: Number(level) as 2 | 3 });

    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });

  return { html: updatedHtml, headings };
}
