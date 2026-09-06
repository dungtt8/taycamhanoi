import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GuideArticle from "@/components/GuideArticle";
import Breadcrumb from "@/components/Breadcrumb";
import { getWpPostBySlug } from "@/lib/wordpress";
import { extractHeadingsAndInjectIds } from "@/lib/toc";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getWpPostBySlug(slug);
  if (!post) return {};
  return { title: post.title.rendered };
}

export default async function GuideArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getWpPostBySlug(slug);
  if (!post) notFound();

  const { html, headings } = extractHeadingsAndInjectIds(post.content.rendered);

  return (
    <>
      <TopBar showHotline={false} />
      <Header variant="compact" />
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Hướng dẫn", href: "/huong-dan" },
          { label: post.title.rendered },
        ]}
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <GuideArticle titleHtml={post.title.rendered} contentHtml={html} headings={headings} />

        <div className="mt-10 bg-blue-700 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold">Cần hỗ trợ thêm?</p>
            <p className="text-blue-100 text-sm">Liên hệ đội ngũ TAYCAMHANOI để được tư vấn trực tiếp.</p>
          </div>
          <a
            href="tel:090xxxxxxx"
            className="shrink-0 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition"
          >
            📞 Gọi hotline
          </a>
        </div>
      </div>
      <Footer variant="condensed" />
    </>
  );
}
