import type { Category } from "./types";

// Extracted from taycamhanoi_homepage.html "DANH MỤC NỔI BẬT" grid
// and taycamhanoi_category.html (category detail page for "Tay cầm PC").
export const categories: Category[] = [
  {
    id: "cat-pc",
    slug: "tay-cam-pc",
    name: "Tay cầm PC",
    emoji: "🎮",
    productCount: 120,
    description:
      "Tổng hợp tay cầm chơi game trên PC từ các thương hiệu hàng đầu: Gamesir, Flydigi, Xbox, 8BitDo. Hỗ trợ Windows 10/11, Steam, Epic Games, GOG.",
  },
  {
    id: "cat-console",
    slug: "tay-cam-console",
    name: "Tay cầm Console",
    emoji: "🕹️",
    productCount: 85,
    description:
      "Tay cầm chính hãng dành cho Xbox, PlayStation và Nintendo Switch, tương thích hoàn hảo với máy console và PC qua Bluetooth/USB.",
  },
  {
    id: "cat-headset",
    slug: "tai-nghe-gaming",
    name: "Tai nghe Gaming",
    emoji: "🎧",
    productCount: 45,
    description:
      "Tai nghe gaming chính hãng âm thanh vòm, mic khử ồn, phù hợp cho stream, thi đấu e-sports và giải trí hàng ngày.",
  },
  {
    id: "cat-mobile",
    slug: "tay-cam-mobile",
    name: "Tay cầm Mobile",
    emoji: "📱",
    productCount: 60,
    description:
      "Tay cầm chơi game di động kết nối Type-C, Bluetooth cho điện thoại Android/iOS, tối ưu cho game mobile nặng thao tác.",
  },
  {
    id: "cat-accessories",
    slug: "phu-kien",
    name: "Phụ kiện",
    emoji: "🎒",
    productCount: 200,
    description:
      "Phụ kiện đi kèm tay cầm gaming: bao đựng, cáp Type-C, ốp bảo vệ, pin sạc và các món đồ hỗ trợ khác.",
  },
  {
    id: "cat-combo",
    slug: "combo-tiet-kiem",
    name: "Combo tiết kiệm",
    emoji: "⚡",
    productCount: 15,
    description:
      "Các combo mua kèm tay cầm và phụ kiện với mức giá ưu đãi hơn khi mua lẻ từng món.",
  },
];
