import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";
import { SITE_URL } from "@/lib/site";
import { getWooBrands, getAllWooProducts } from "@/lib/woocommerce";
import { mapWooProduct, stripHtml } from "@/lib/woo-adapter";

async function findBrandTerm(slug: string) {
  const brands = await getWooBrands();
  return brands.find((b) => b.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const term = await findBrandTerm(slug);
  if (!term) return {};

  const title = `Thương hiệu ${term.name}`;
  const description = stripHtml(term.description) || `Sản phẩm chính hãng ${term.name} tại TAYCAMHANOI.`;
  const url = `${SITE_URL}/thuong-hieu/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", title, description, url },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const term = await findBrandTerm(slug);
  if (!term) notFound();

  const allWooProducts = await getAllWooProducts();
  const brandProducts = allWooProducts
    .filter((p) => p.brands?.some((b) => b.id === term.id))
    .map(mapWooProduct);
  const description = stripHtml(term.description) || `Sản phẩm chính hãng ${term.name} tại TAYCAMHANOI.`;

  return (
    <>
      <TopBar showHotline={false} />
      <Header variant="compact" />
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Thương hiệu", href: "/san-pham" },
          { label: term.name },
        ]}
      />

      {/* Brand hero */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 p-6 lg:p-10 text-white">
          <div className="flex items-center gap-3 mb-3">
            {term.image ? (
              <span className="relative w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0">
                <Image src={term.image.src} alt={term.name} fill className="object-contain p-1" sizes="48px" />
              </span>
            ) : (
              <span className="text-3xl">🏷️</span>
            )}
            <h1 className="text-2xl lg:text-3xl font-black">{term.name}</h1>
          </div>
          <p className="text-blue-100 text-sm mb-5 max-w-lg">{description}</p>
          <span className="inline-block bg-white/15 px-3 py-1.5 rounded-full text-xs">
            {term.count} sản phẩm
          </span>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-gray-900">Sản phẩm {term.name}</h2>
        </div>
        {brandProducts.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có sản phẩm nào.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {brandProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Why buy */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 lg:p-8 text-white">
          <h2 className="font-bold text-lg mb-4">Vì sao nên mua {term.name} tại TAYCAMHANOI?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex flex-col items-center text-center gap-2">
              <span className="text-2xl">✅</span> Hàng chính hãng 100%
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <span className="text-2xl">🚚</span> Freeship toàn quốc
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <span className="text-2xl">🛡️</span> Bảo hành chính hãng
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <span className="text-2xl">🎧</span> Hỗ trợ 24/7
            </div>
          </div>
        </div>
      </section>

      <Footer variant="condensed" highlightBrand={term.name} />
      <MobileBottomNav active="products" />
      <div className="h-16 md:hidden" />
    </>
  );
}
