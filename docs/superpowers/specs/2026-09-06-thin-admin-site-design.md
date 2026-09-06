# Thin Admin Site cho TAYCAMHANOI — Design Spec

Ngày: 2026-09-06

## Bối cảnh

Backend hiện tại là WooCommerce (REST API `wc/v3`), site khách hàng là Next.js
gọi API dạng read-only qua `src/lib/woocommerce.ts` (consumer key/secret cố
định, cache GET 60s). wp-admin quản lý được mọi thứ nhưng UI không thân thiện
cho việc vận hành hàng ngày (xử lý đơn, cập nhật tồn kho).

Giải pháp: một app Next.js **riêng biệt, mỏng**, chỉ phủ các thao tác vận
hành hay dùng nhất, gọi thẳng WooCommerce/WordPress REST API. wp-admin vẫn là
nơi xử lý mọi cấu hình khác (SEO, plugin, trang tĩnh, brand/category...).

## Phạm vi

Tính năng có trong bản này:

1. **Đơn hàng**
   - Danh sách đơn, lọc theo trạng thái (`pending`, `processing`,
     `completed`, `cancelled`, `refunded`...)
   - Xem chi tiết 1 đơn (sản phẩm, số lượng, khách hàng, địa chỉ, tổng tiền)
   - Đổi trạng thái đơn
2. **Sản phẩm**
   - Danh sách sản phẩm (tìm theo tên/slug)
   - Sửa: giá (`regular_price`, `sale_price`), tồn kho (`stock_quantity`),
     trạng thái (`stock_status`)
   - Thêm sản phẩm mới: tên, giá, mô tả, ảnh, category, brand
3. **Dashboard**
   - Số đơn hôm nay / 7 ngày qua
   - Doanh thu hôm nay / 7 ngày qua
   - Top sản phẩm bán chạy
   - Lấy trực tiếp từ WooCommerce Reports API (`/wc/v3/reports/*`), không tự
     tính toán lại từ danh sách đơn.

Ngoài phạm vi (không làm trong bản này):

- Phân quyền nhiều role/nhiều mức quyền
- Audit log / lịch sử thao tác
- Thông báo real-time (đơn mới, hết hàng...)
- Quản lý bài viết (Posts), trang Chính sách, cấu hình plugin — vẫn dùng
  wp-admin
- Custom UI upload ảnh (dùng WordPress Media REST API cơ bản, không xây
  trình quản lý file riêng)

## Kiến trúc

- App Next.js App Router **mới, độc lập** (repo/thư mục riêng ngoài repo
  `taycamhanoi` hiện tại), deploy domain riêng (ví dụ
  `admin.taycamhanoi.com`).
- Không có database riêng. Không có tầng API-route trung gian: mọi thao tác
  gọi thẳng WooCommerce/WordPress REST API qua Server Actions/Server
  Components, theo đúng pattern đang dùng ở `src/lib/woocommerce.ts` của repo
  chính (fetch trực tiếp, không ORM, không cache layer phức tạp).
- Stack: Next.js + TypeScript + Tailwind, giống repo chính — không thêm thư
  viện UI framework mới.

## Xác thực

- Người dùng tạo 1 lần: wp-admin → **Users → Profile → Application
  Passwords** → tạo app password cho tài khoản admin WordPress hiện có.
- Admin site có màn hình login (username + password WordPress thường,
  **không phải** app password) → server action gọi
  `GET /wp-json/wp/v2/users/me` bằng Basic Auth với username/password nhập
  vào để xác thực là tài khoản hợp lệ.
  - Ghi chú: WordPress REST API chấp nhận Application Password làm giá trị
    Basic Auth password; nếu xác thực bằng password thường không hoạt động
    (một số cấu hình chặn), màn hình login yêu cầu nhập trực tiếp app
    password thay vì password thường — quyết định cụ thể chốt khi implement,
    thử password thường trước.
- Xác thực thành công → mã hoá username + password (dùng để gọi API) và lưu
  vào cookie `httpOnly`, `secure`, `sameSite=lax`, có thời hạn (ví dụ 7 ngày).
- Mọi Server Action/Server Component sau đó đọc cookie, giải mã, dùng làm
  Basic Auth header khi gọi `wc/v3` và `wp/v2`.
- Không có bảng user, không có role — 1 tài khoản WordPress admin dùng
  chung.
- Mã hoá cookie dùng `AES-256-GCM` với khoá bí mật từ biến môi trường
  (`ADMIN_SESSION_SECRET`), tương tự cách các dự án Next.js khác xử lý
  session không dùng thư viện auth ngoài.

## Data flow

```
Admin site (Server Action)
  → Basic Auth (username + app-password từ cookie)
  → WooCommerce REST API (wc/v3/orders, wc/v3/products, wc/v3/reports/*)
  → WordPress REST API (wp/v2/media — upload ảnh sản phẩm)
```

Không có cache — mọi request GET dùng `cache: "no-store"` vì đây là công cụ
vận hành, dữ liệu cần luôn mới (khác site khách hàng vốn cache 60s để giảm
tải).

## Cấu trúc thư mục (app mới)

```
src/
  lib/
    woocommerce-admin.ts   # fetch wrapper dùng Basic Auth (POST/PUT/GET),
                           # port lại các type từ WooProduct/WooOrder
    session.ts             # encrypt/decrypt cookie, getSession(), requireSession()
  app/
    login/page.tsx
    (admin)/
      layout.tsx            # check session, redirect /login nếu chưa đăng nhập
      page.tsx               # dashboard
      don-hang/
        page.tsx             # danh sách đơn
        [id]/page.tsx        # chi tiết đơn + đổi trạng thái
      san-pham/
        page.tsx             # danh sách + sửa nhanh
        moi/page.tsx          # thêm sản phẩm mới
```

## Xử lý lỗi

- Lỗi gọi WooCommerce API (401, 404, 500...) hiển thị thông báo tiếng Việt
  ngắn gọn dưới form/bảng tương ứng (ví dụ "Không cập nhật được đơn hàng, thử
  lại sau"), không expose raw error ra UI.
- Hết hạn session / 401 khi gọi API → xoá cookie, redirect `/login`.

## Testing

Theo CLAUDE.md của dự án: **luôn bỏ qua test file**. Không viết test tự
động cho phần này; xác minh bằng chạy thử thủ công trên trình duyệt (dev
server) với site WooCommerce local đã có sẵn (xem
`docs/woocommerce-local-dev.md` của repo chính).

## Việc cần xác nhận với người dùng khi bắt đầu implement

- Vị trí đặt repo/thư mục mới cho admin site (thư mục con cùng chỗ, hay repo
  Git riêng hoàn toàn).
- Domain/subdomain thật sẽ dùng khi deploy (ảnh hưởng cấu hình CORS trên
  WordPress nếu cần).
