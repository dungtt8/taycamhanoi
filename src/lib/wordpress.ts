const WP_URL = process.env.WOOCOMMERCE_URL;

async function wpFetch<T>(path: string, params?: Record<string, string>): Promise<T | null> {
  if (!WP_URL) return null;
  const url = new URL(`/wp-json/wp/v2/${path}`, WP_URL);
  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export interface WpPost {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  categories: number[];
}

export async function getWpPosts(params?: Record<string, string>): Promise<WpPost[]> {
  const posts = await wpFetch<WpPost[]>("posts", { per_page: "20", ...params });
  return posts ?? [];
}

export async function getWpPostBySlug(slug: string): Promise<WpPost | null> {
  const posts = await wpFetch<WpPost[]>("posts", { slug });
  return posts?.[0] ?? null;
}

export interface WpCategory {
  id: number;
  slug: string;
  name: string;
}

export async function getWpCategoryBySlug(slug: string): Promise<WpCategory | null> {
  const categories = await wpFetch<WpCategory[]>("categories", { slug });
  return categories?.[0] ?? null;
}

export interface WpPage {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
}

export async function getWpPageBySlug(slug: string): Promise<WpPage | null> {
  const pages = await wpFetch<WpPage[]>("pages", { slug });
  return pages?.[0] ?? null;
}
