# Thin Admin Site cho TAYCAMHANOI — Design Spec

Ngày: 2026-09-06 (cập nhật sau review yêu cầu frontend cùng ngày)

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
   - Danh sách đơn, lọc theo trạng thái (`on-hold`, `processing`,
     `completed`, `cancelled`, `refunded`...)
   - Xem chi tiết 1 đơn (sản phẩm, số lượng, khách hàng, địa chỉ, tổng tiền)
   - Đổi trạng thái đơn
   - **Duyệt đơn**: hành động riêng cho đơn ở trạng thái `on-hold` ("Chờ
     duyệt") → chuyển sang `processing` ("Đã duyệt"). Đây là 2 trạng thái có
     sẵn của WooCommerce, không đăng ký status mới — chỉ quy ước lại ý nghĩa
     (xem thêm mục "Thay đổi ở repo chính" bên dưới). Đây là bước chuẩn bị
     cho tích hợp Nhanh.vn ở giai đoạn sau (xem "Ngoài phạm vi").
2. **Sản phẩm**
   - Danh sách sản phẩm (tìm theo tên/slug)
   - Sửa: giá (`regular_price`, `sale_price`), tồn kho (`stock_quantity`),
     trạng thái tồn kho — đủ cả 3 giá trị `instock` / `outofstock` /
     `onbackorder` (backorder = hiển thị "Đặt hàng trước" trên site khách
     hàng), và field "Trong hộp có gì" (`box_contents`, xem mục dưới)
   - Thêm sản phẩm mới: tên, giá, mô tả, ảnh, category, brand
3. **Dashboard**
   - Số đơn hôm nay / 7 ngày qua
   - Doanh thu hôm nay / 7 ngày qua
   - Top sản phẩm bán chạy
   - Lấy trực tiếp từ WooCommerce Reports API (`/wc/v3/reports/*`), không tự
     tính toán lại từ danh sách đơn.
4. **Cài đặt chung** (mới)
   - 1 màn hình đơn giản sửa các giá trị cấu hình động của site khách hàng,
     bắt đầu với: link "Tham gia nhóm trao đổi" ở trang Hàng cũ
     (`secondhand_group_url`)
   - Đọc/ghi qua `wp/v2/settings` sau khi đăng ký thêm field này bằng 1
     mu-plugin nhỏ (xem "Thay đổi ở repo chính")
   - Thiết kế mở để thêm field cấu hình khác sau này vào cùng màn hình,
     không cần màn hình riêng cho mỗi field

Ngoài phạm vi (không làm trong bản này):

- Phân quyền nhiều role/nhiều mức quyền
- Audit log / lịch sử thao tác
- Thông báo real-time (đơn mới, hết hàng...)
- Quản lý bài viết (Posts), trang Chính sách, category/brand sản phẩm — vẫn
  dùng wp-admin
- Custom UI upload ảnh (dùng WordPress Media REST API cơ bản, không xây
  trình quản lý file riêng)
- **Tích hợp Nhanh.vn**: chưa có tài khoản/API key tại thời điểm viết spec
  này. Khi đơn được duyệt (`processing`), việc tự động đẩy đơn sang Nhanh.vn
  để lại cho giai đoạn sau — cần một spec riêng khi đã có quyền truy cập API
  Nhanh.vn (mapping dữ liệu đơn hàng, xác thực, xử lý lỗi/retry khi đồng bộ
  thất bại).

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
  → WordPress REST API (wp/v2/media — upload ảnh sản phẩm,
                         wp/v2/settings — Cài đặt chung)
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
      cai-dat/
        page.tsx             # Cài đặt chung (link nhóm trao đổi, ...)
```

## Xử lý lỗi

- Lỗi gọi WooCommerce API (401, 404, 500...) hiển thị thông báo tiếng Việt
  ngắn gọn dưới form/bảng tương ứng (ví dụ "Không cập nhật được đơn hàng, thử
  lại sau"), không expose raw error ra UI.
- Hết hạn session / 401 khi gọi API → xoá cookie, redirect `/login`.

## Thay đổi cần làm ở repo Next.js chính (site khách hàng)

Rà soát so với yêu cầu frontend (header nav, trang chi tiết sản phẩm, hàng
cũ, chính sách...) cho thấy phần lớn đã đáp ứng sẵn — không cần đổi:

- Ảnh sản phẩm khung hình vuông ([ProductCard.tsx:15](../../../src/components/ProductCard.tsx#L15),
  [ProductDetail.tsx:55](../../../src/components/ProductDetail.tsx#L55))
- Trang chi tiết sản phẩm không hiển thị đánh giá/tiết kiệm, chỉ có tên/danh
  mục/giá/nút hành động/chính sách sản phẩm/chính sách bảo hành/thông số kỹ
  thuật ([ProductDetail.tsx](../../../src/components/ProductDetail.tsx))
- Đặt hàng trước (pre-order) qua `stock_status: onbackorder`
  ([ProductDetail.tsx:28](../../../src/components/ProductDetail.tsx#L28))
- Chính sách admin tự thêm động — route `/chinh-sach/[slug]` đọc bất kỳ
  WordPress Page nào theo slug, không giới hạn 2 slug cố định
  ([chinh-sach/[slug]/page.tsx](../../../src/app/chinh-sach/%5Bslug%5D/page.tsx))
- Trang Hướng dẫn kiểu Gamesir (accordion/table/columns từ block WordPress,
  [GuideArticle.tsx](../../../src/components/GuideArticle.tsx))
- Danh mục nổi bật lấy động từ WooCommerce Categories
  ([page.tsx:147](../../../src/app/page.tsx#L147)) — quản lý qua wp-admin
  (Products → Categories), không cần vào thin-admin
- Hàng cũ: hiển thị sản phẩm + nút tham gia nhóm
  ([hang-cu/page.tsx](../../../src/app/hang-cu/page.tsx))
- Mục "Kiểm tra tay cầm" giữ nguyên trên header (đã xác nhận với người dùng)

Các thay đổi còn thiếu, cần làm ở repo chính (song song với việc dựng app
admin mới):

1. **Field "Trong hộp có gì"** — thêm Custom Field `box_contents` (giống
   cách `shopee_link` đang làm, xem
   [docs/woocommerce-local-dev.md §15](../../woocommerce-local-dev.md)):
   thêm vào `WooProduct`/`Product` type
   ([woocommerce.ts](../../../src/lib/woocommerce.ts),
   [types.ts](../../../src/data/types.ts)), map trong
   [woo-adapter.ts](../../../src/lib/woo-adapter.ts), hiển thị thành mục
   riêng ("Trong hộp có gì") ở
   [ProductDetail.tsx](../../../src/components/ProductDetail.tsx) cạnh các
   mục Chính sách sản phẩm/Thông tin sản phẩm/Thông số kỹ thuật hiện có.
2. **Đơn hàng chờ duyệt** — `WooOrderInput`
   ([woocommerce.ts:154](../../../src/lib/woocommerce.ts#L154)) hiện không
   có field `status`, đơn tạo ra nhận status mặc định của WooCommerce. Thêm
   `status?: string` vào interface, và set `status: "on-hold"` khi tạo đơn
   ở [orders.ts](../../../src/lib/orders.ts) — để đơn mới luôn ở trạng thái
   "Chờ duyệt", chờ thao tác "Duyệt đơn" ở admin site mới.
3. **Trang Hỗ trợ** — thêm route mới (ví dụ `/ho-tro`) và 1 mục nav mới
   trên header (8 mục: Trang chủ, Tất cả sản phẩm, Thương hiệu, Hướng dẫn,
   Blog & Review, Hàng cũ, Kiểm tra tay cầm, Hỗ trợ), nội dung: thông tin
   liên hệ, FAQ, link 2 trang chính sách, link công cụ Kiểm tra tay cầm.
   Đồng thời sửa bug ở [Footer.tsx:65](../../../src/components/Footer.tsx#L65)
   — link "Liên hệ" đang trỏ nhầm về `/huong-dan`, đổi thành `/ho-tro`.
4. **Mu-plugin đăng ký setting động** — thêm 1 file mu-plugin mới (cùng chỗ
   với `force-ssl-local.php` đã có, xem
   [docs/woocommerce-local-dev.md §4](../../woocommerce-local-dev.md)) dùng
   `register_setting(..., ['show_in_rest' => true])` để đăng ký
   `secondhand_group_url` (và chỗ trống cho các field cấu hình động khác
   sau này) vào `wp/v2/settings`. [site.ts](../../../src/lib/site.ts) đổi
   `SECONDHAND_GROUP_URL` từ hằng số sang đọc từ API này (cache ngắn, ví dụ
   revalidate 60s giống các trang khác).

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
- Nội dung cụ thể của trang Hỗ trợ mới (ngoài liên hệ/FAQ/link chính sách đã
  nêu, có cần thêm gì khác không — form liên hệ, chat widget...).
- Thời điểm quay lại thiết kế tích hợp Nhanh.vn (sau khi có tài khoản/API
  key) — cần một spec riêng, không nằm trong bản này.
