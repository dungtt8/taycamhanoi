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
  title: "Blog & Review",
  description: "Bài viết đánh giá, tin tức gaming từ TAYCAMHANOI.",
};

export default async function BlogPage() {
  const blogCategory = await getWpCategoryBySlug("blog-review");
  const posts = await getWpPosts(
    blogCategory ? { categories: String(blogCategory.id) } : undefined
  );

  return (
    <>
      <TopBar showHotline={false} />
      <Header variant="compact" showNav navActive="blog" />
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Blog & Review" }]} />

      <section className="max-w-7xl mx-auto px-4 pb-6">
        <h1 className="text-xl lg:text-2xl font-black text-gray-900 mb-4">Blog &amp; Review</h1>

        {posts.length === 0 ? (
          <p className="text-sm text-gray-500 py-16 text-center">Chưa có bài viết nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {posts.map((post) => (
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
                    className="text-xs text-gray-500 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer variant="condensed" />
      <MobileBottomNav active="home" />
      <div className="h-16 md:hidden" />
    </>
  );
}
