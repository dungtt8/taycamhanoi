import Link from "next/link";
import Image from "next/image";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import ProductCard from "@/components/ProductCard";
import CountdownTimer from "@/components/CountdownTimer";
import NewsletterForm from "@/components/NewsletterForm";
import { getWooProducts, getWooCategories, getWooBrands } from "@/lib/woocommerce";
import { getWpPosts, getWpCategoryBySlug } from "@/lib/wordpress";
import { mapWooProduct } from "@/lib/woo-adapter";

export const revalidate = 60;

async function getLatestBlogPosts() {
  const category = await getWpCategoryBySlug("blog-review");
  return getWpPosts({
    per_page: "3",
    orderby: "date",
    order: "desc",
    ...(category ? { categories: String(category.id) } : {}),
  });
}

export default async function HomePage() {
  const [flashSaleWoo, newArrivalsWoo, categories, brandTerms, blogPosts] = await Promise.all([
    getWooProducts({ on_sale: "true", per_page: "5" }),
    getWooProducts({ orderby: "date", order: "desc", per_page: "4" }),
    getWooCategories(),
    getWooBrands(),
    getLatestBlogPosts(),
  ]);
  const flashSale = flashSaleWoo.map(mapWooProduct);
  const newArrivals = newArrivalsWoo.map(mapWooProduct);

  return (
    <>
      <TopBar />
      <Header variant="full" showNav navActive="home" />

      {/* Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 rounded-2xl overflow-hidden relative h-[280px] lg:h-[340px] bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700">
            <div className="absolute inset-0 flex items-center px-6 lg:px-12">
              <div className="text-white max-w-lg">
                <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 lg:mb-4">
                  🔥 SIÊU SALE 8.8
                </span>
                <h2 className="text-2xl lg:text-4xl font-black mb-2 lg:mb-3 leading-tight">
                  TAY CẦM GAMING
                  <br />
                  <span className="text-yellow-400">CHÍNH HÃNG</span> GIÁ TỐT
                </h2>
                <p className="text-blue-100 mb-4 lg:mb-6 text-xs lg:text-sm">
                  Freeship toàn quốc • Bảo hành 12 tháng • Đổi trả 7 ngày
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/san-pham"
                    className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl transition shadow-lg shadow-red-500/30 text-sm"
                  >
                    Mua ngay →
                  </Link>
                  <Link
                    href="/san-pham"
                    className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl backdrop-blur transition text-sm"
                  >
                    Xem tất cả
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex lg:flex-col gap-4">
            <div className="flex-1 rounded-2xl overflow-hidden relative bg-gradient-to-br from-red-500 to-red-600 p-4 lg:p-6 flex flex-col justify-between min-h-[130px]">
              <div>
                <span className="text-red-100 text-xs font-bold">ƯU ĐÃI ĐẶC BIỆT</span>
                <h3 className="text-white text-lg lg:text-xl font-bold mt-1">
                  GIẢM ĐẾN
                  <br />
                  <span className="text-2xl lg:text-3xl">40%</span>
                </h3>
              </div>
              <Link
                href="/san-pham"
                className="bg-white text-red-600 font-bold text-xs lg:text-sm px-3 lg:px-4 py-2 rounded-lg w-fit hover:bg-gray-100 transition"
              >
                Khám phá →
              </Link>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden relative bg-gradient-to-br from-gray-800 to-gray-900 p-4 lg:p-6 flex flex-col justify-between min-h-[130px]">
              <div>
                <span className="text-gray-300 text-xs font-bold">HÀNG MỚI VỀ</span>
                <h3 className="text-white text-lg lg:text-xl font-bold mt-1">SẢN PHẨM MỚI</h3>
              </div>
              <Link
                href="/san-pham"
                className="bg-white text-gray-900 font-bold text-xs lg:text-sm px-3 lg:px-4 py-2 rounded-lg w-fit hover:bg-gray-100 transition"
              >
                Xem ngay →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand marquee */}
      {brandTerms.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
            {brandTerms.map((brand) => (
              <Link
                key={brand.slug}
                href={`/thuong-hieu/${brand.slug}`}
                className="shrink-0 flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium hover:border-blue-400 hover:text-blue-700 transition"
              >
                {brand.image ? (
                  <span className="relative w-5 h-5 rounded-full overflow-hidden bg-gray-50 shrink-0">
                    <Image src={brand.image.src} alt={brand.name} fill className="object-contain" sizes="20px" />
                  </span>
                ) : (
                  <span>🏷️</span>
                )}
                {brand.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Flash Sale */}
      {flashSale.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg lg:text-xl font-black text-gray-900">⚡ FLASH SALE</h2>
              <CountdownTimer />
            </div>
            <Link href="/san-pham" className="text-sm font-semibold text-blue-700 hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {flashSale.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <h2 className="text-lg lg:text-xl font-black text-gray-900 mb-4">DANH MỤC NỔI BẬT</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/san-pham?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition text-center"
              >
                <span className="text-3xl">🎮</span>
                <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
                <span className="text-xs text-gray-400">{cat.count} sản phẩm</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-black text-gray-900">HÀNG MỚI VỀ</h2>
            <Link href="/san-pham" className="text-sm font-semibold text-blue-700 hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Trust features */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white rounded-2xl p-6 shadow-sm">
          {[
            { icon: "🚚", label: "Freeship toàn quốc" },
            { icon: "🛡️", label: "Bảo hành 12 tháng" },
            { icon: "✅", label: "100% chính hãng" },
            { icon: "🎧", label: "Hỗ trợ 24/7" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center text-center gap-2">
              <span className="text-3xl">{f.icon}</span>
              <span className="text-xs sm:text-sm font-medium text-gray-700">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Blog */}
      {blogPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-black text-gray-900">BLOG &amp; REVIEW</h2>
            <Link href="/blog" className="text-sm font-semibold text-blue-700 hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden"
              >
                <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-4xl">
                  📰
                </div>
                <div className="p-4">
                  <h3
                    className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />
                  <div
                    className="text-xs text-gray-500 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-2xl p-6 lg:p-10 text-center">
          <h2 className="text-white text-xl lg:text-2xl font-black mb-2">
            ĐĂNG KÝ NHẬN ƯU ĐÃI ĐỘC QUYỀN
          </h2>
          <p className="text-blue-100 text-sm mb-5">
            Nhận ngay voucher 50k cho đơn hàng đầu tiên khi đăng ký email
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterForm />
          </div>
        </div>
      </section>

      <Footer variant="full" />
      <MobileBottomNav active="home" />
      <div className="h-16 md:hidden" />
    </>
  );
}
