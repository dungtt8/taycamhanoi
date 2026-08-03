import { notFound } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";
import { brands } from "@/data/brands";
import { products } from "@/data/products";

export function generateStaticParams() {
  return brands.map((b) => ({ slug: b.slug }));
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) notFound();

  const brandProducts = products.filter((p) => p.brand.toLowerCase() === brand.slug);

  return (
    <>
      <TopBar showHotline={false} />
      <Header variant="compact" />
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Thương hiệu", href: "/san-pham" },
          { label: brand.name },
        ]}
      />

      {/* Brand hero */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 p-6 lg:p-10 text-white items-center">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">{brand.emoji}</span>
              <h1 className="text-2xl lg:text-3xl font-black">{brand.name}</h1>
            </div>
            <p className="text-blue-100 text-sm mb-5 max-w-lg">{brand.description}</p>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="bg-white/15 px-3 py-1.5 rounded-full">{brand.productCount} sản phẩm</span>
              <span className="bg-white/15 px-3 py-1.5 rounded-full">⭐ {brand.rating} đánh giá</span>
              <span className="bg-white/15 px-3 py-1.5 rounded-full">🛡️ BH {brand.warrantyYears * 12} tháng</span>
              <span className="bg-white/15 px-3 py-1.5 rounded-full">{brand.keyTech}</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center relative">
            <span className="text-[10rem] opacity-20">{brand.emoji}</span>
            <span className="absolute top-0 right-4 bg-yellow-400 text-blue-900 text-xs font-bold px-3 py-1 rounded-full">
              BEST SELLER
            </span>
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-lg text-gray-900 mb-3">Về thương hiệu {brand.name}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{brand.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-700 font-semibold">Thành lập</p>
              <p className="text-lg font-black text-gray-900">{brand.foundedYear}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-700 font-semibold">Xuất xứ</p>
              <p className="text-lg font-black text-gray-900">{brand.origin}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 col-span-2">
              <p className="text-xs text-purple-700 font-semibold">Chứng nhận</p>
              <p className="text-sm font-bold text-gray-900">{brand.certification}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Series */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <h2 className="font-bold text-lg text-gray-900 mb-3">Dòng sản phẩm</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {brand.series.map((s) => (
            <div
              key={s.name}
              className="shrink-0 bg-white rounded-xl shadow-sm px-5 py-3 text-center min-w-[140px]"
            >
              <p className="font-semibold text-sm text-gray-800">{s.name}</p>
              <p className="text-xs text-gray-400">{s.tier}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-gray-900">Sản phẩm {brand.name}</h2>
          <Link href={`/san-pham?category=${brandProducts[0]?.category ?? ""}`} className="text-sm font-semibold text-blue-700 hover:underline">
            Xem tất cả →
          </Link>
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
          <h2 className="font-bold text-lg mb-4">Vì sao nên mua {brand.name} tại TAYCAMHANOI?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex flex-col items-center text-center gap-2">
              <span className="text-2xl">✅</span> Hàng chính hãng 100%
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <span className="text-2xl">🚚</span> Freeship toàn quốc
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <span className="text-2xl">🛡️</span> Bảo hành {brand.warrantyYears * 12} tháng
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <span className="text-2xl">🎧</span> Hỗ trợ 24/7
            </div>
          </div>
        </div>
      </section>

      <Footer variant="condensed" highlightBrand={brand.name} />
      <MobileBottomNav active="products" />
      <div className="h-16 md:hidden" />
    </>
  );
}
