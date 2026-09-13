import Link from "next/link";
import Image from "next/image";
import { getWooBrands } from "@/lib/woocommerce";
import { HomeIcon, GridIcon, TagIcon, BlogIcon, SupportIcon, BoltIcon, GamepadIcon, ChevronDownIcon } from "./icons";

export type NavActive = "home" | "products" | "guide" | "blog" | "used" | "gamepad-test";

export default async function Nav({ active }: { active?: NavActive }) {
  const brands = await getWooBrands();

  const linkClass = (key: NavActive) =>
    `flex items-center gap-1.5 py-3 transition ${
      active === key ? "text-red-600 border-b-2 border-red-600" : "text-gray-700 hover:text-blue-700"
    }`;

  return (
    <nav className="border-t border-gray-100 hidden md:block">
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex items-center gap-6 lg:gap-8 text-sm font-medium">
          <li>
            <Link href="/" className={linkClass("home")}>
              <HomeIcon className="w-4 h-4" />
              Trang chủ
            </Link>
          </li>
          <li>
            <Link href="/san-pham" prefetch={false} className={linkClass("products")}>
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
              {brands.length === 0 && (
                <p className="px-4 py-2 text-sm text-gray-400">Chưa có thương hiệu</p>
              )}
              {brands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/thuong-hieu/${brand.slug}`}
                  prefetch={false}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  {brand.image ? (
                    <span className="relative w-5 h-5 rounded-full overflow-hidden bg-gray-50 shrink-0">
                      <Image src={brand.image.src} alt={brand.name} fill className="object-contain" sizes="20px" />
                    </span>
                  ) : (
                    <span>🏷️</span>
                  )}
                  {brand.name}
                </Link>
              ))}
            </div>
          </li>
          <li>
            <Link href="/huong-dan" prefetch={false} className={linkClass("guide")}>
              <SupportIcon className="w-4 h-4" />
              Hướng dẫn
            </Link>
          </li>
          <li>
            <Link href="/blog" prefetch={false} className={linkClass("blog")}>
              <BlogIcon className="w-4 h-4" />
              Blog &amp; Review
            </Link>
          </li>
          <li>
            <Link href="/hang-cu" prefetch={false} className={linkClass("used")}>
              <BoltIcon className="w-4 h-4" />
              Hàng cũ
              <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                Mới
              </span>
            </Link>
          </li>
          <li>
            <Link href="/kiem-tra-tay-cam" prefetch={false} className={linkClass("gamepad-test")}>
              <GamepadIcon className="w-4 h-4" />
              Kiểm tra tay cầm
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
