import Link from "next/link";
import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumb from "@/components/Breadcrumb";
import { getWpPosts, getWpCategoryBySlug } from "@/lib/wordpress";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Hướng dẫn",
  description: "Hướng dẫn sử dụng, cài đặt tay cầm gaming và hỗ trợ khách hàng tại TAYCAMHANOI.",
};

export default async function GuidePage() {
  const guideCategory = await getWpCategoryBySlug("huong-dan");
  const posts = await getWpPosts(
    guideCategory ? { categories: String(guideCategory.id) } : undefined
  );

  return (
    <>
      <TopBar showHotline={false} />
      <Header variant="compact" showNav navActive="guide" />
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Hướng dẫn" }]} />

      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-blue-700 p-6 lg:p-8 text-white mb-6">
          <h1 className="text-xl lg:text-2xl font-black mb-2">Hướng dẫn sử dụng</h1>
          <p className="text-blue-100 text-sm max-w-2xl">
            Hướng dẫn cài đặt, sử dụng tay cầm gaming và các câu hỏi thường gặp.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">Chưa có bài hướng dẫn nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/huong-dan/${post.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition overflow-hidden flex flex-col"
              >
                <div className="h-28 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-4xl text-blue-700">
                  📘
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3
                    className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-700 transition"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />
                  <div
                    className="text-xs text-gray-500 line-clamp-3 mb-3 flex-1"
                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                  />
                  <span className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                    Xem hướng dẫn
                    <span className="transition group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Hỗ trợ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-4">Hỗ trợ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <a
              href="tel:090xxxxxxx"
              className="border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50/50 transition"
            >
              <span className="text-2xl">📞</span>
              <p className="font-semibold mt-1">Gọi hotline</p>
              <p className="text-gray-500 text-xs">090.xxx.xxxx</p>
            </a>
            <a
              href="mailto:support@taycamhanoi.vn"
              className="border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50/50 transition"
            >
              <span className="text-2xl">✉️</span>
              <p className="font-semibold mt-1">Email</p>
              <p className="text-gray-500 text-xs">support@taycamhanoi.vn</p>
            </a>
            <Link
              href="/chinh-sach/chinh-sach-bao-hanh"
              className="border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50/50 transition"
            >
              <span className="text-2xl">🛡️</span>
              <p className="font-semibold mt-1">Chính sách bảo hành</p>
            </Link>
          </div>
        </div>
      </section>

      <Footer variant="condensed" />
      <MobileBottomNav active="products" />
      <div className="h-16 md:hidden" />
    </>
  );
}
