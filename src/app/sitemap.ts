import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllWooProducts, getWooCategories, getWooBrands } from "@/lib/woocommerce";
import { getWpPosts, getWpCategoryBySlug } from "@/lib/wordpress";

export const dynamic = "force-dynamic";

async function getPostsByCategorySlug(slug: string) {
  const category = await getWpCategoryBySlug(slug);
  return getWpPosts(category ? { categories: String(category.id) } : undefined);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands, guidePosts, blogPosts] = await Promise.all([
    getAllWooProducts(),
    getWooCategories(),
    getWooBrands(),
    getPostsByCategorySlug("huong-dan"),
    getPostsByCategorySlug("blog-review"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/san-pham`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/hang-cu`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/huong-dan`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/kiem-tra-tay-cam`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/san-pham?category=${c.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/san-pham/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${SITE_URL}/thuong-hieu/${b.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const guideRoutes: MetadataRoute.Sitemap = guidePosts.map((p) => ({
    url: `${SITE_URL}/huong-dan/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...brandRoutes,
    ...guideRoutes,
    ...blogRoutes,
  ];
}
