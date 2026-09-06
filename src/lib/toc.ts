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
}

/**
 * Extracts H2 headings from WordPress post HTML and injects matching `id`
 * attributes so the table-of-contents sidebar can link to them.
 */
export function extractHeadingsAndInjectIds(html: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const usedIds = new Set<string>();

  const updatedHtml = html.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (match, attrs, inner) => {
    const text = inner.replace(/<[^>]*>/g, "").trim();
    if (!text) return match;

    let id = toSlug(text) || "section";
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${toSlug(text)}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);
    headings.push({ id, text });

    return `<h2${attrs} id="${id}">${inner}</h2>`;
  });

  return { html: updatedHtml, headings };
}
