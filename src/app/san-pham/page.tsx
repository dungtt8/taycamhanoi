import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumb from "@/components/Breadcrumb";
import ProductListing from "@/components/ProductListing";
import { categories } from "@/data/categories";

export default async function ProductListingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = categories.find((c) => c.slug === params.category);

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
              ? activeCategory.description
              : "Toàn bộ tay cầm & phụ kiện gaming chính hãng tại TAYCAMHANOI."}
          </p>
        </div>
      </section>

      <ProductListing
        initialCategory={params.category}
        initialQuery={params.q}
      />

      <Footer variant="condensed" />
      <MobileBottomNav active="products" />
      <div className="h-16 md:hidden" />
    </>
  );
}
