import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";
import { getWooProducts, getWooCategories } from "@/lib/woocommerce";
import { mapWooProduct } from "@/lib/woo-adapter";
import { SECONDHAND_GROUP_URL } from "@/lib/site";

const USED_CATEGORY_SLUG = "hang-cu";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Hàng cũ",
  description: "Tay cầm & phụ kiện gaming cũ, đã qua kiểm tra tại TAYCAMHANOI. Tham gia nhóm trao đổi mua bán tay cầm cũ.",
};

export default async function SecondhandPage() {
  const categories = await getWooCategories();
  const usedCategory = categories.find((c) => c.slug === USED_CATEGORY_SLUG);
  const wooProducts = usedCategory
    ? await getWooProducts({ category: String(usedCategory.id), per_page: "100" })
    : [];
  const products = wooProducts.map(mapWooProduct);

  return (
    <>
      <TopBar showHotline={false} />
      <Header variant="compact" showNav navActive="used" />
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Hàng cũ" }]} />

      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 lg:p-10 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/5 blur-2xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <span className="inline-block bg-white/10 text-xs font-bold px-3 py-1 rounded-full mb-3">
                ♻️ Đã qua kiểm tra
              </span>
              <h1 className="text-2xl lg:text-3xl font-black mb-2">Hàng cũ chính hãng</h1>
              <p className="text-gray-300 text-sm max-w-xl">
                Tay cầm &amp; phụ kiện gaming cũ, đã qua kiểm tra chất lượng, giá tốt hơn hàng mới. Tham gia nhóm để
                trao đổi, mua bán trực tiếp với cộng đồng.
              </p>
              <span className="inline-block mt-4 bg-white/10 px-3 py-1.5 rounded-full text-xs">
                {products.length} sản phẩm đang có
              </span>
            </div>
            <a
              href={SECONDHAND_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-white text-gray-900 font-bold text-sm px-5 py-3 rounded-xl hover:bg-gray-100 transition text-center"
            >
              Tham gia nhóm trao đổi →
            </a>
          </div>
        </div>
      </section>

      {/* Why buy used */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center text-center gap-2">
            <span className="text-2xl">🔍</span> Kiểm tra kỹ trước khi bán
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center text-center gap-2">
            <span className="text-2xl">💸</span> Giá tốt hơn hàng mới
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center text-center gap-2">
            <span className="text-2xl">🛡️</span> Bảo hành ngắn hạn
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center text-center gap-2">
            <span className="text-2xl">🤝</span> Giao dịch minh bạch
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-gray-900">Sản phẩm hàng cũ</h2>
        </div>
        {products.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl py-16 text-center">
            <p className="text-3xl mb-3">📦</p>
            <p className="text-sm text-gray-500 mb-4">
              Hiện chưa có sản phẩm hàng cũ nào. Hãy tham gia nhóm để cập nhật hàng mới nhất!
            </p>
            <a
              href={SECONDHAND_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gray-900 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-800 transition"
            >
              Tham gia nhóm trao đổi →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <Footer variant="condensed" />
      <MobileBottomNav active="products" />
      <div className="h-16 md:hidden" />
    </>
  );
}
