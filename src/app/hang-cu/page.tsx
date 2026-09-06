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

      <section className="max-w-7xl mx-auto px-4 pb-4">
        <div className="rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 p-6 lg:p-8 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-black mb-2">Hàng cũ</h1>
            <p className="text-gray-300 text-sm max-w-xl">
              Tay cầm & phụ kiện gaming cũ, đã qua kiểm tra chất lượng. Tham gia nhóm để trao đổi, mua bán trực tiếp với cộng đồng.
            </p>
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
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-6">
        {products.length === 0 ? (
          <p className="text-sm text-gray-500 py-16 text-center">
            Hiện chưa có sản phẩm hàng cũ nào. Hãy tham gia nhóm để cập nhật hàng mới nhất!
          </p>
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
