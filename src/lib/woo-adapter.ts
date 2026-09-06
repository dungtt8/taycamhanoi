import type { WooProduct } from "./woocommerce";
import type { Product } from "@/data/types";

const GRADIENTS: [string, string][] = [
  ["from-blue-500", "to-blue-700"],
  ["from-purple-500", "to-purple-700"],
  ["from-green-500", "to-green-700"],
  ["from-orange-500", "to-orange-700"],
  ["from-pink-500", "to-pink-700"],
];

export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

export function mapWooProduct(p: WooProduct): Product {
  const price = Number(p.price) || 0;
  const originalPrice = Number(p.regular_price) || price;
  const discountPercent =
    originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const gradient = GRADIENTS[p.id % GRADIENTS.length];

  const brandTerm = p.brands?.[0];
  const brand = brandTerm?.name ?? p.categories[0]?.name ?? "TAYCAMHANOI";

  const shopeeLinkMeta = p.meta_data?.find((m) => m.key === "shopee_link");
  const shopeeLink = typeof shopeeLinkMeta?.value === "string" ? shopeeLinkMeta.value : undefined;

  return {
    id: String(p.id),
    slug: p.slug,
    name: p.name,
    brand,
    brandSlug: brandTerm?.slug,
    hasBrandPage: !!brandTerm,
    category: p.categories[0]?.slug ?? "",
    categoryName: p.categories[0]?.name,
    emoji: "🎮",
    colorFrom: gradient[0],
    colorTo: gradient[1],
    price,
    originalPrice,
    discountPercent,
    rating: Number(p.average_rating) || 0,
    ratingCount: p.rating_count ?? 0,
    soldCount: p.total_sales ?? 0,
    stock: p.stock_quantity ?? (p.stock_status === "instock" ? 999 : 0),
    stockStatus: p.stock_status,
    description: stripHtml(p.description || p.short_description),
    descriptionHtml: p.description || undefined,
    policyNoteHtml: p.short_description || undefined,
    specs: Object.fromEntries(
      p.attributes.filter((a) => a.name.toLowerCase() !== "brand").map((a) => [a.name, a.options.join(", ")])
    ),
    imageUrl: p.images[0]?.src,
    images: p.images.length > 0 ? p.images.map((img) => img.src) : undefined,
    shopeeLink,
  };
}
