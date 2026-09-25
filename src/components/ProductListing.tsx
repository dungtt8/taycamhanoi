"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "@/data/types";

type SortKey = "ban-chay" | "moi-nhat" | "gia-tang" | "gia-giam";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "ban-chay", label: "Bán chạy" },
  { key: "moi-nhat", label: "Mới nhất" },
  { key: "gia-tang", label: "Giá ↑" },
  { key: "gia-giam", label: "Giá ↓" },
];

const PAGE_SIZE = 50;

export default function ProductListing({
  products,
  initialCategory,
  initialQuery,
}: {
  products: Product[];
  initialCategory?: string;
  initialQuery?: string;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [query] = useState(initialQuery ?? "");
  const [sort, setSort] = useState<SortKey>("ban-chay");
  const [page, setPage] = useState(1);

  const brandOptions = useMemo(() => {
    const names = Array.from(new Set(products.map((p) => p.brand)));
    return names.map((name) => ({
      name,
      count: products.filter((p) => p.brand === name).length,
    }));
  }, [products]);

  const toggleBrand = (name: string) => {
    setSelectedBrands((prev) =>
      prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]
    );
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = products;
    if (category) list = list.filter((p) => p.category === category);
    if (selectedBrands.length) list = list.filter((p) => selectedBrands.includes(p.brand));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    const sorted = [...list];
    if (sort === "ban-chay") sorted.sort((a, b) => b.soldCount - a.soldCount);
    else if (sort === "moi-nhat") sorted.sort((a, b) => Number(b.id) - Number(a.id));
    else if (sort === "gia-tang") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "gia-giam") sorted.sort((a, b) => b.price - a.price);

    return sorted;
  }, [products, category, selectedBrands, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar filters */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Bộ lọc</h3>
              {(selectedBrands.length > 0 || category) && (
                <button
                  onClick={() => {
                    setSelectedBrands([]);
                    setCategory(undefined);
                    setPage(1);
                  }}
                  className="text-xs text-blue-700 hover:underline"
                >
                  Đặt lại
                </button>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Thương hiệu</h4>
              <ul className="space-y-2">
                {brandOptions.map((b) => (
                  <li key={b.name}>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b.name)}
                        onChange={() => toggleBrand(b.name)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {b.name}
                      <span className="text-gray-400 text-xs ml-auto">({b.count})</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-sm text-gray-500">
              Tìm thấy <span className="font-semibold text-gray-800">{filtered.length}</span> sản phẩm
            </p>
            <div className="flex gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    setSort(opt.key);
                    setPage(1);
                  }}
                  className={`text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full border transition ${
                    sort === opt.key
                      ? "bg-blue-700 text-white border-blue-700"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {pageItems.length === 0 ? (
            <p className="text-center text-gray-500 py-16">Không tìm thấy sản phẩm phù hợp.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pageItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${
                    n === page ? "bg-blue-700 text-white" : "border border-gray-200 text-gray-600"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
