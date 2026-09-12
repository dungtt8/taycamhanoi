const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL;
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

function wcUrl(path: string, params: Record<string, string> = {}): string {
  if (!WOOCOMMERCE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error(
      "Missing WOOCOMMERCE_URL / WOOCOMMERCE_CONSUMER_KEY / WOOCOMMERCE_CONSUMER_SECRET env vars"
    );
  }
  const url = new URL(`/wp-json/wc/v3/${path}`, WOOCOMMERCE_URL);
  url.searchParams.set("consumer_key", CONSUMER_KEY);
  url.searchParams.set("consumer_secret", CONSUMER_SECRET);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function wcFetch<T>(
  path: string,
  init?: RequestInit,
  params?: Record<string, string>
): Promise<T> {
  const res = await fetch(wcUrl(path, params), {
    ...init,
    ...(init?.method && init.method !== "GET"
      ? { cache: "no-store" as const }
      : { next: { revalidate: 60 } }),
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`WooCommerce API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export interface WooProductImage {
  src: string;
  alt: string;
}

export interface WooProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WooProductAttribute {
  name: string;
  options: string[];
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number | null;
  stock_status: "instock" | "outofstock" | "onbackorder";
  description: string;
  short_description: string;
  images: WooProductImage[];
  categories: WooProductCategory[];
  average_rating: string;
  rating_count: number;
  total_sales: number;
  attributes: WooProductAttribute[];
  meta_data: { id: number; key: string; value: unknown }[];
  brands?: WooProductCategory[];
}

export function getWooProducts(params?: Record<string, string>): Promise<WooProduct[]> {
  return wcFetch<WooProduct[]>("products", undefined, params);
}

/**
 * Paginates through every product matching `params` — the WooCommerce REST
 * API caps `per_page` at 100, so listing/sitemap pages need this instead of
 * a single `getWooProducts({ per_page: "100" })` call once the catalog grows
 * past 100 items. Capped at 20 pages (2000 products) as a safety limit.
 */
export async function getAllWooProducts(params?: Record<string, string>): Promise<WooProduct[]> {
  const all: WooProduct[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const batch = await getWooProducts({ ...params, per_page: "100", page: String(page) });
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

export function getWooProductBySlug(slug: string): Promise<WooProduct | null> {
  return wcFetch<WooProduct[]>("products", undefined, { slug }).then((list) => list[0] ?? null);
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export function getWooCategories(params?: Record<string, string>): Promise<WooCategory[]> {
  return wcFetch<WooCategory[]>("products/categories", undefined, { per_page: "100", ...params });
}

export interface WooBrand {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  image: { src: string } | null;
}

/**
 * WooCommerce's native "Brands" taxonomy (Products → Brands in wp-admin),
 * not a product attribute. Used by Nav/Footer/homepage on nearly every page
 * render — swallows errors (missing env vars, WooCommerce down) so a backend
 * outage degrades to "no brands shown" instead of crashing every page site-wide.
 */
export async function getWooBrands(params?: Record<string, string>): Promise<WooBrand[]> {
  try {
    return await wcFetch<WooBrand[]>("products/brands", undefined, { per_page: "100", ...params });
  } catch {
    return [];
  }
}

export interface WooOrderLineItem {
  product_id: number;
  quantity: number;
}

export interface WooOrderAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  email?: string;
  phone?: string;
}

export interface WooOrderShippingLine {
  method_title: string;
  method_id: string;
  total: string;
}

export interface WooOrderInput {
  payment_method: string;
  payment_method_title: string;
  set_paid?: boolean;
  billing: WooOrderAddress;
  shipping: WooOrderAddress;
  line_items: WooOrderLineItem[];
  shipping_lines?: WooOrderShippingLine[];
  customer_note?: string;
}

export interface WooOrder {
  id: number;
  number: string;
  status: string;
  total: string;
}

export function createWooOrder(order: WooOrderInput): Promise<WooOrder> {
  return wcFetch<WooOrder>("orders", { method: "POST", body: JSON.stringify(order) });
}
