import { notFound } from "next/navigation";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumb from "@/components/Breadcrumb";
import ProductDetail from "@/components/ProductDetail";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { reviews } from "@/data/reviews";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const category = categories.find((c) => c.slug === product.category);
  const productReviews = reviews.filter((r) => r.productId === product.id);
  const related = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 5);

  return (
    <>
      <TopBar showHotline={false} />
      <Header variant="compact" />
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          ...(category ? [{ label: category.name, href: `/san-pham?category=${category.slug}` }] : []),
          { label: product.brand, href: `/thuong-hieu/${product.brand.toLowerCase()}` },
          { label: product.name },
        ]}
      />

      <ProductDetail product={product} reviews={productReviews} related={related} />

      <Footer variant="condensed" />
      <MobileBottomNav active="products" />
      <div className="h-16 md:hidden" />
    </>
  );
}
