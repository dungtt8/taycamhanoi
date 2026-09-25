"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/data/types";
import { formatPrice, RICH_TEXT_CLASS } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import ProductCard from "./ProductCard";

export default function ProductDetail({
  product,
  warrantyPolicyHtml,
  related,
}: {
  product: Product;
  warrantyPolicyHtml?: string;
  related: Product[];
}) {
  const { addItem, openDrawer } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [variant, setVariant] = useState(product.variants?.[0]?.name);
  const [qty, setQty] = useState(1);
  const [comboSelected, setComboSelected] = useState<Record<string, boolean>>({});

  const gallery = product.images && product.images.length > 0 ? product.images : null;
  const isOutOfStock = product.stockStatus === "outofstock";
  const isPreorder = product.stockStatus === "onbackorder";
  const [isPaused, setIsPaused] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const galleryLength = gallery?.length ?? 0;

  useEffect(() => {
    if (!gallery || galleryLength < 2 || isPaused) return;
    const timer = setInterval(() => {
      setActiveImage((i) => (i + 1) % galleryLength);
    }, 4000);
    return () => clearInterval(timer);
  }, [gallery, galleryLength, isPaused]);

  const goToImage = (i: number) => {
    setActiveImage(i);
    setIsPaused(true);
  };

  const comboTotal = (product.comboItems ?? []).reduce(
    (sum, item) => (comboSelected[item.name] ? sum + item.price : sum),
    0
  );

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      emoji: product.emoji,
      colorFrom: product.colorFrom,
      colorTo: product.colorTo,
      imageUrl: product.imageUrl,
      price: product.price,
      variant,
      qty,
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div
            className={`group w-2/3 aspect-[3/2] rounded-2xl overflow-hidden relative flex items-center justify-center text-8xl bg-gradient-to-br ${product.colorFrom} ${product.colorTo} mb-3`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {gallery ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(true)}
                  aria-label="Phóng to ảnh"
                  className="absolute inset-0 cursor-zoom-in"
                >
                  <Image
                    src={gallery[activeImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                  />
                </button>
                {galleryLength > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => goToImage((activeImage - 1 + galleryLength) % galleryLength)}
                      aria-label="Ảnh trước"
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 text-gray-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => goToImage((activeImage + 1) % galleryLength)}
                      aria-label="Ảnh sau"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 text-gray-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white"
                    >
                      ›
                    </button>
                  </>
                )}
              </>
            ) : (
              product.emoji
            )}
          </div>
          {gallery && (
            <div className="flex gap-2">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  onClick={() => goToImage(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden relative border-2 transition ${
                    activeImage === i ? "border-blue-600" : "border-gray-200"
                  } bg-gradient-to-br ${product.colorFrom} ${product.colorTo}`}
                >
                  <Image src={src} alt={product.name} fill className="object-cover" sizes="56px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {isZoomOpen && gallery && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
            onClick={() => setIsZoomOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              aria-label="Đóng"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white text-xl flex items-center justify-center hover:bg-white/20"
            >
              ✕
            </button>
            <div className="relative w-full h-full max-w-4xl">
              <Image
                src={gallery[activeImage]}
                alt={product.name}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          </div>
        )}

        {/* Info */}
        <div className="lg:col-span-5">
          <div className="flex items-center gap-2 mb-2">
            {product.categoryName && (
              <Link
                href={`/san-pham?category=${product.category}`}
                className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-100"
              >
                {product.categoryName}
              </Link>
            )}
            <span className="text-[11px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded-full">
              ✅ Chính hãng
            </span>
            {isPreorder && (
              <span className="text-[11px] font-bold bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">
                Đặt hàng trước
              </span>
            )}
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-gray-900 mb-4">{product.name}</h1>

          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-red-600">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="text-gray-400 line-through text-sm">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="text-white bg-red-500 text-xs font-bold px-2 py-1 rounded-full">
                  -{product.discountPercent}%
                </span>
              )}
            </div>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Màu sắc: {variant}</h3>
              <div className="flex gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => setVariant(v.name)}
                    className={`w-9 h-9 rounded-full border-2 transition ${
                      variant === v.name ? "border-blue-600 scale-110" : "border-gray-200"
                    }`}
                    style={{ backgroundColor: v.colorHex }}
                    title={v.name}
                  />
                ))}
              </div>
            </div>
          )}

          {!isOutOfStock && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Số lượng</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 text-gray-600 hover:bg-gray-50"
                  >
                    −
                  </button>
                  <input
                    value={qty}
                    readOnly
                    className="w-10 text-center border-x border-gray-200 py-2 text-sm"
                  />
                  <button
                    onClick={() => setQty((q) => (isPreorder ? q + 1 : Math.min(product.stock, q + 1)))}
                    className="w-9 h-9 text-gray-600 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  {isPreorder ? "Hàng đặt trước" : `Còn ${product.stock} sản phẩm`}
                </span>
              </div>
            </div>
          )}

          {product.comboItems && product.comboItems.length > 0 && (
            <div className="mb-5 border border-dashed border-blue-200 rounded-xl p-4 bg-blue-50/40">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Mua kèm ưu đãi</h3>
              <div className="space-y-2">
                {product.comboItems.map((item) => (
                  <label key={item.name} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!comboSelected[item.name]}
                      onChange={() =>
                        setComboSelected((prev) => ({ ...prev, [item.name]: !prev[item.name] }))
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {item.name}
                    <span className="ml-auto text-red-600 font-semibold">+{formatPrice(item.price)}</span>
                  </label>
                ))}
              </div>
              {comboTotal > 0 && (
                <p className="text-xs text-gray-500 mt-2">Phụ phí mua kèm: {formatPrice(comboTotal)}</p>
              )}
            </div>
          )}

          {isOutOfStock ? (
            <div className="mb-5 bg-gray-100 text-gray-500 font-semibold text-center py-3 rounded-xl">
              Hết hàng
            </div>
          ) : (
            <div className="flex gap-3 mb-5">
              <button
                onClick={handleAddToCart}
                className="flex-1 border-2 border-blue-700 text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-50 transition"
              >
                Thêm vào giỏ hàng
              </button>
              <button
                onClick={() => {
                  handleAddToCart();
                  openDrawer();
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-red-500/30"
              >
                {isPreorder ? "Đặt hàng trước" : "Mua ngay"}
              </button>
            </div>
          )}

          {product.shopeeLink && (
            <a
              href={product.shopeeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-5 flex items-center justify-center gap-2 border-2 border-orange-500 text-orange-600 font-bold py-3 rounded-xl hover:bg-orange-50 transition"
            >
              🛒 Xem trên Shopee
            </a>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-500">
            <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg p-3 text-center">
              🚚 <span>Freeship</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg p-3 text-center">
              🛡️ <span>BH 12 tháng</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg p-3 text-center">
              ✅ <span>Chính hãng</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg p-3 text-center">
              🔄 <span>Đổi trả 7 ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product info sections — content edited by admin in WooCommerce */}
      <div className="mt-10 space-y-3">
        {product.descriptionHtml && (
          <InfoSection title="Mô tả sản phẩm">
            <div className={RICH_TEXT_CLASS} dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
          </InfoSection>
        )}

        {Object.keys(product.specs).length > 0 && (
          <InfoSection title="Thông số kỹ thuật">
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex text-sm">
                  <span className="w-1/3 bg-gray-50 px-4 py-2.5 font-medium text-gray-600">{key}</span>
                  <span className="flex-1 px-4 py-2.5 text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </InfoSection>
        )}

        {product.boxContents && (
          <InfoSection title="Trong hộp có gì">
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {product.boxContents}
            </div>
          </InfoSection>
        )}

        {product.policyNoteHtml && (
          <InfoSection title="Chính sách sản phẩm">
            <div className={RICH_TEXT_CLASS} dangerouslySetInnerHTML={{ __html: product.policyNoteHtml }} />
          </InfoSection>
        )}

        {warrantyPolicyHtml && (
          <InfoSection title="Chính sách bảo hành">
            <div className={RICH_TEXT_CLASS} dangerouslySetInnerHTML={{ __html: warrantyPolicyHtml }} />
          </InfoSection>
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-black text-gray-900 mb-4">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group rounded-2xl border border-gray-200 bg-white open:shadow-sm transition-shadow" open>
      <summary className="flex items-center justify-between gap-3 cursor-pointer list-none select-none px-5 py-4 font-bold text-gray-900 marker:content-none [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <svg
          className="w-5 h-5 shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="px-5 pb-5 pt-0 border-t border-gray-100 mt-0">
        <div className="pt-4">{children}</div>
      </div>
    </details>
  );
}
