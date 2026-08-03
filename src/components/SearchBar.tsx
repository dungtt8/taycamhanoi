"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchIcon } from "./icons";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/san-pham?q=${encodeURIComponent(trimmed)}` : "/san-pham");
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm kiếm tay cầm, phụ kiện gaming..."
        className="w-full pl-4 pr-12 py-2.5 border-2 border-gray-200 rounded-full text-sm focus:border-blue-600 focus:outline-none transition-colors"
      />
      <button
        type="submit"
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-700 text-white p-2 rounded-full hover:bg-blue-800 transition"
      >
        <SearchIcon />
      </button>
    </form>
  );
}
