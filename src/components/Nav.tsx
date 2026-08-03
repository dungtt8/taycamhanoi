import Link from "next/link";
import { brands } from "@/data/brands";
import { HomeIcon, GridIcon, TagIcon, BoltIcon, BlogIcon, SupportIcon, ChevronDownIcon } from "./icons";

export default function Nav({ active }: { active?: "home" | "products" }) {
  return (
    <nav className="border-t border-gray-100 hidden md:block">
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex items-center gap-6 lg:gap-8 text-sm font-medium">
          <li>
            <Link
              href="/"
              className={`flex items-center gap-1.5 py-3 transition ${
                active === "home"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-700 hover:text-blue-700"
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              Trang chủ
            </Link>
          </li>
          <li>
            <Link
              href="/san-pham"
              className={`flex items-center gap-1.5 py-3 transition ${
                active === "products"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-700 hover:text-blue-700"
              }`}
            >
              <GridIcon className="w-4 h-4" />
              Tất cả sản phẩm
            </Link>
          </li>
          <li className="relative group">
            <button className="flex items-center gap-1.5 py-3 text-gray-700 hover:text-blue-700 transition">
              <TagIcon className="w-4 h-4" />
              Thương hiệu
              <ChevronDownIcon />
            </button>
            <div className="absolute top-full left-0 w-56 bg-white shadow-xl rounded-lg py-2 hidden group-hover:block border border-gray-100 z-50">
              {brands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/thuong-hieu/${brand.slug}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  {brand.emoji} {brand.name}
                </Link>
              ))}
            </div>
          </li>
          <li>
            <Link href="/san-pham?combo=1" className="flex items-center gap-1.5 py-3 text-gray-700 hover:text-blue-700 transition">
              <BoltIcon className="w-4 h-4" />
              Combo tiết kiệm
            </Link>
          </li>
          <li>
            <Link href="#" className="flex items-center gap-1.5 py-3 text-gray-700 hover:text-blue-700 transition">
              <BlogIcon className="w-4 h-4" />
              Blog & Review
            </Link>
          </li>
          <li>
            <Link href="#" className="flex items-center gap-1.5 py-3 text-gray-700 hover:text-blue-700 transition">
              <SupportIcon className="w-4 h-4" />
              Hỗ trợ
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
