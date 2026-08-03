"use client";

import { useState } from "react";
import type { Product, Review } from "@/data/types";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { StarIcon } from "./icons";
import ProductCard from "./ProductCard";

const TABS = [
  { key: "description", label: "Mô tả" },
  { key: "specs", label: "Thông số" },
  { key: "reviews", label: "Đánh giá" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ProductDetail({
  product,
  reviews,
  related,
}: {
  product: Product;
  reviews: Review[];
  related: Product[];
}) {
  const { addItem, openDrawer } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [variant, setVariant] = useState(product.variants?.[0]?.name);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<TabKey>("description");
  const [comboSelected, setComboSelected] = useState<Record<string, boolean>>({});

  const gallery = product.images && product.images.length > 0 ? product.images : [product.emoji];

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
      price: product.price,
      variant,
      qty,
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Gallery */}
        <div className="lg:col-span-5">
          <div
            className={`h-72 lg:h-96 rounded-2xl flex items-center justify-center text-8xl bg-gradient-to-br ${product.colorFrom} ${product.colorTo} mb-3`}
          >
            {gallery[activeImage]}
          </div>
          <div className="flex gap-2">
            {gallery.map((emoji, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl border-2 transition ${
                  activeImage === i ? "border-blue-600" : "border-gray-200"
                } bg-gradient-to-br ${product.colorFrom} ${product.colorTo}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-7">
          <div className="flex items-center gap-2 mb-2">
            {product.badge && (
              <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                {product.badge}
              </span>
            )}
            <span className="text-[11px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded-full">
              ✅ Chính hãng
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-gray-900 mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <StarIcon className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
            <span>({product.ratingCount} đánh giá)</span>
            <span className="text-gray-300">•</span>
            <span>Đã bán {product.soldCount}</span>
          </div>

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
            {product.originalPrice > product.price && (
              <p className="text-xs text-green-600 mt-1">
                Tiết kiệm {formatPrice(product.originalPrice - product.price)}
              </p>
            )}
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
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="w-9 h-9 text-gray-600 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-gray-400">Còn {product.stock} sản phẩm</span>
            </div>
          </div>

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
              Mua ngay
            </button>
          </div>

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

      {/* Tabs */}
      <div className="mt-10">
        <div className="flex gap-6 border-b border-gray-200 mb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-semibold border-b-2 transition ${
                tab === t.key ? "border-blue-700 text-blue-700" : "border-transparent text-gray-500"
              }`}
            >
              {t.label} {t.key === "reviews" ? `(${reviews.length})` : ""}
            </button>
          ))}
        </div>

        {tab === "description" && (
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line max-w-3xl">
            {product.description}
          </p>
        )}

        {tab === "specs" && (
          <div className="max-w-2xl divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="flex text-sm">
                <span className="w-1/3 bg-gray-50 px-4 py-2.5 font-medium text-gray-600">{key}</span>
                <span className="flex-1 px-4 py-2.5 text-gray-700">{value}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "reviews" && (
          <div className="max-w-3xl space-y-4">
            {reviews.length === 0 && <p className="text-sm text-gray-500">Chưa có đánh giá nào.</p>}
            {reviews.map((r) => (
              <div key={r.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {r.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {r.author}{" "}
                      {r.verified && (
                        <span className="text-[10px] text-green-600 font-medium">✓ Đã mua hàng</span>
                      )}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      {Array.from({ length: 5 }, (_, i) => (
                        <StarIcon key={i} className={`w-3 h-3 ${i < r.rating ? "text-yellow-400" : "text-gray-200"}`} />
                      ))}
                      <span>{r.date}</span>
                      {r.variantTag && <span>• Phân loại: {r.variantTag}</span>}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-black text-gray-900 mb-4">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} size="compact" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
