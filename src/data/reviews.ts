import type { Review } from "./types";

// Extracted from the "Đánh giá" tab in taycamhanoi_product.html
// (product: Gamesir T3 LITE Hall Joystick 2 phím macro Retro Design).
export const reviews: Review[] = [
  {
    id: "review-nguyen-tuan",
    productId: "prod-gamesir-t3-lite",
    author: "Nguyễn Tuấn",
    rating: 5,
    verified: true,
    date: "2 ngày trước",
    text: "Tay cầm cầm rất êm tay, hall joystick thực sự khác biệt so với tay cầm giá rẻ khác. Không bị drift sau 3 tháng sử dụng. Đáng tiền!",
    variantTag: "Đen",
  },
  {
    id: "review-le-huong",
    productId: "prod-gamesir-t3-lite",
    author: "Lê Hương",
    rating: 5,
    verified: true,
    date: "1 tuần trước",
    text: "Giao hàng nhanh, đóng gói cẩn thận. Tay cầm kết nối với Switch rất ổn định, không bị delay. Phím macro tiện lợi cho game Zelda.",
    variantTag: "Trắng",
  },
  {
    id: "review-pham-van",
    productId: "prod-gamesir-t3-lite",
    author: "Phạm Văn",
    rating: 4,
    verified: true,
    date: "2 tuần trước",
    text: "Tổng thể rất tốt trong tầm giá. Chỉ tiếc là không có led rgb nhưng không sao, chơi game mượt là được.",
    variantTag: "Xanh",
  },
];
