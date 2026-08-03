# TAYCAMHANOI

Website thương mại điện tử chuyên tay cầm & phụ kiện gaming chính hãng. Xây dựng bằng Next.js (App Router) + TypeScript + Tailwind CSS, dữ liệu mock local (chưa có backend thật).

## Bắt đầu

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Cấu trúc

- `src/app` — các route (trang chủ, danh sách sản phẩm, chi tiết sản phẩm, thương hiệu, thanh toán)
- `src/components` — component dùng chung (Header, Nav, Footer, ProductCard, CartDrawer...)
- `src/data` — dữ liệu mẫu (sản phẩm, danh mục, thương hiệu, đánh giá, blog)
- `src/lib` — cart context, kiểu dữ liệu, helper
- `reference-mockups/` — 5 file HTML tĩnh gốc dùng làm tham chiếu thiết kế ban đầu

## Ghi chú

- Giỏ hàng lưu ở `localStorage`, không có backend/thanh toán thật.
- Ảnh sản phẩm dùng placeholder (emoji/gradient) do chưa có ảnh thật.
