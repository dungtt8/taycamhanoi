import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { getWpPageBySlug } from "@/lib/wordpress";
import { RICH_TEXT_CLASS } from "@/lib/format";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getWpPageBySlug(slug);
  if (!page) return {};
  return { title: page.title.rendered };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getWpPageBySlug(slug);
  if (!page) notFound();

  return (
    <>
      <TopBar showHotline={false} />
      <Header variant="compact" />
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: page.title.rendered },
        ]}
      />
      <article className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">{page.title.rendered}</h1>
        <div className={RICH_TEXT_CLASS} dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
      </article>
      <Footer variant="condensed" />
    </>
  );
}
