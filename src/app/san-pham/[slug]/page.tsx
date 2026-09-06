import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumb from "@/components/Breadcrumb";
import ProductDetail from "@/components/ProductDetail";
import { SITE_URL } from "@/lib/site";
import { getWooProductBySlug, getWooProducts } from "@/lib/woocommerce";
import { getWpPageBySlug } from "@/lib/wordpress";
import { mapWooProduct } from "@/lib/woo-adapter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const wooProduct = await getWooProductBySlug(slug);
  if (!wooProduct) return {};
  const product = mapWooProduct(wooProduct);

  const title = `${product.name} - ${product.brand}`;
  const description = product.description;
  const url = `${SITE_URL}/san-pham/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const wooProduct = await getWooProductBySlug(slug);
  if (!wooProduct) notFound();
  const product = mapWooProduct(wooProduct);

  const categoryId = wooProduct.categories[0]?.id;
  const [relatedWooProducts, warrantyPage] = await Promise.all([
    categoryId
      ? getWooProducts({ category: String(categoryId), per_page: "6" })
      : getWooProducts({ per_page: "6" }),
    getWpPageBySlug("chinh-sach-bao-hanh"),
  ]);
  const related = relatedWooProducts
    .map(mapWooProduct)
    .filter((p) => p.id !== product.id)
    .slice(0, 5);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description,
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/san-pham/${product.slug}`,
      priceCurrency: "VND",
      price: product.price,
      availability:
        product.stockStatus === "onbackorder"
          ? "https://schema.org/BackOrder"
          : product.stockStatus === "outofstock"
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <TopBar showHotline={false} />
      <Header variant="compact" />
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          ...(product.categoryName
            ? [{ label: product.categoryName, href: `/san-pham?category=${product.category}` }]
            : []),
          product.hasBrandPage
            ? { label: product.brand, href: `/thuong-hieu/${product.brandSlug}` }
            : { label: product.brand },
          { label: product.name },
        ]}
      />

      <ProductDetail
        product={product}
        warrantyPolicyHtml={warrantyPage?.content.rendered}
        related={related}
      />

      <Footer variant="condensed" />
      <MobileBottomNav active="products" />
      <div className="h-16 md:hidden" />
    </>
  );
}
