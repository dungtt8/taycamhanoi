import Link from "next/link";
import type { Product } from "@/data/types";
import { formatPrice } from "@/lib/format";
import { StarIcon } from "./icons";

export default function ProductCard({
  product,
  size = "default",
}: {
  product: Product;
  size?: "default" | "compact";
}) {
  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
    >
      <div
        className={`relative flex items-center justify-center bg-gradient-to-br ${product.colorFrom} ${product.colorTo} ${
          size === "compact" ? "h-32" : "h-40"
        }`}
      >
        <span className="relative text-5xl">{product.emoji}</span>
        {product.discountPercent && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            -{product.discountPercent}%
          </span>
        )}
        {product.badge && (
          <span className="absolute top-2 right-2 bg-blue-900/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            {product.badge}
          </span>
        )}
        {product.ribbon && (
          <span className="absolute bottom-2 left-2 bg-white/90 text-gray-700 text-[10px] font-semibold px-2 py-1 rounded-full">
            {product.ribbon}
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        {product.seriesTag && (
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">
            {product.seriesTag}
          </span>
        )}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-700 transition">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <StarIcon className="w-3.5 h-3.5 text-yellow-400" />
          <span>{product.rating.toFixed(1)}</span>
          <span className="text-gray-300">•</span>
          <span>Đã bán {product.soldCount}</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-red-600 font-bold text-sm">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-gray-400 text-xs line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
