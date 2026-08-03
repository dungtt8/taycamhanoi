import Link from "next/link";

export type FooterVariant = "full" | "condensed" | "minimal";

export default function Footer({
  variant = "condensed",
  highlightBrand,
}: {
  variant?: FooterVariant;
  highlightBrand?: string;
}) {
  if (variant === "minimal") {
    return (
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-sm text-gray-500">
        <span className="font-black text-gray-700">
          <span className="text-blue-700">TAYCAM</span>
          <span className="text-red-600">HANOI</span>
        </span>{" "}
        © {new Date().getFullYear()}. All rights reserved.
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-gray-300 mt-8">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="text-white font-black text-lg mb-3">
            <span className="text-blue-400">TAYCAM</span>
            <span className="text-red-400">HANOI</span>
          </h3>
          <p className="text-gray-400 mb-4">
            Chuyên tay cầm &amp; phụ kiện gaming chính hãng, freeship toàn quốc, bảo hành 12 tháng.
          </p>
          {variant === "full" && (
            <div className="flex gap-3 text-gray-400">
              <span>Facebook</span>
              <span>Zalo</span>
              <span>Youtube</span>
            </div>
          )}
        </div>
        <div>
          <h4 className="text-white font-bold mb-3">Danh mục</h4>
          <ul className="space-y-2">
            <li><Link href="/san-pham" className="hover:text-white">Tất cả sản phẩm</Link></li>
            <li><Link href="/thuong-hieu/gamesir" className="hover:text-white">Gamesir</Link></li>
            <li><Link href="/thuong-hieu/flydigi" className="hover:text-white">Flydigi</Link></li>
            <li><Link href="/thuong-hieu/aolion" className="hover:text-white">Aolion</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3">Hỗ trợ</h4>
          <ul className="space-y-2">
            <li><Link href="#" className="hover:text-white">Chính sách bảo hành</Link></li>
            <li><Link href="#" className="hover:text-white">Chính sách đổi trả</Link></li>
            <li><Link href="#" className="hover:text-white">Hướng dẫn mua hàng</Link></li>
            <li><Link href="#" className="hover:text-white">Liên hệ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3">Liên hệ</h4>
          <ul className="space-y-2 text-gray-400">
            <li>Hotline: 090.xxx.xxxx</li>
            <li>Email: support@taycamhanoi.vn</li>
            <li>Địa chỉ: Hà Nội, Việt Nam</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} TAYCAMHANOI
        {highlightBrand ? ` — Đại lý chính hãng ${highlightBrand}` : ""}. All rights reserved.
      </div>
    </footer>
  );
}
