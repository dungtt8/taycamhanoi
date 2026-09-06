import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumb from "@/components/Breadcrumb";
import ProductListing from "@/components/ProductListing";
import { SITE_URL } from "@/lib/site";
import { getAllWooProducts, getWooCategories } from "@/lib/woocommerce";
import { mapWooProduct, stripHtml } from "@/lib/woo-adapter";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const wooCategories = await getWooCategories();
  const activeCategory = wooCategories.find((c) => c.slug === params.category);

  const title = activeCategory ? activeCategory.name : "Tất cả sản phẩm";
  const description = activeCategory
    ? stripHtml(activeCategory.description) || `Sản phẩm thuộc danh mục ${activeCategory.name}.`
    : "Toàn bộ tay cầm & phụ kiện gaming chính hãng tại TAYCAMHANOI.";

  return {
    title,
    description,
    alternates: {
      canonical: activeCategory
        ? `${SITE_URL}/san-pham?category=${activeCategory.slug}`
        : `${SITE_URL}/san-pham`,
    },
  };
}

export default async function ProductListingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const [wooCategories, wooProducts] = await Promise.all([
    getWooCategories(),
    getAllWooProducts(),
  ]);
  const activeCategory = wooCategories.find((c) => c.slug === params.category);
  const products = wooProducts.map(mapWooProduct);

  return (
    <>
      <TopBar />
      <Header variant="compact" showNav navActive="products" />
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Tất cả sản phẩm", href: "/san-pham" },
          ...(activeCategory ? [{ label: activeCategory.name }] : []),
        ]}
      />

      <section className="max-w-7xl mx-auto px-4 pb-4">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-blue-700 p-6 lg:p-8 text-white">
          <h1 className="text-xl lg:text-2xl font-black mb-2">
            {activeCategory ? activeCategory.name : "Tất cả sản phẩm"}
          </h1>
          <p className="text-blue-100 text-sm max-w-2xl">
            {activeCategory
              ? stripHtml(activeCategory.description) || `Sản phẩm thuộc danh mục ${activeCategory.name}.`
              : "Toàn bộ tay cầm & phụ kiện gaming chính hãng tại TAYCAMHANOI."}
          </p>
        </div>
      </section>

      <ProductListing
        products={products}
        initialCategory={params.category}
        initialQuery={params.q}
      />

      <Footer variant="condensed" />
      <MobileBottomNav active="products" />
      <div className="h-16 md:hidden" />
    </>
  );
}
