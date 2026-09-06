# Phân tích bản mô tả tổng thể vs. hiện trạng codebase (TAYCAMHANOI)

Ngày phân tích: 2026-08-12
Nguồn: bản mô tả hệ thống do khách hàng gửi (4 phần: Front-end, Checkout, Backend Admin, Tích hợp mở rộng).

Chú thích trạng thái:
- ✅ Đã có — hoạt động trong codebase hiện tại
- 🟡 Có phần — đã có UI/data model nhưng thiếu phần lõi (thường là backend/thanh toán thật)
- ❌ Chưa có — chưa tồn tại, cần xây từ đầu

---

## 1. Trải nghiệm khách hàng (Front-end)

### Trang chi tiết sản phẩm
| Yêu cầu | Trạng thái | Ghi chú |
|---|---|---|
| Chọn biến thể màu/phiên bản, giá cập nhật theo biến thể | 🟡 | UI chọn màu đã có ở [ProductDetail.tsx:122-139](../src/components/ProductDetail.tsx#L122), nhưng giá **không đổi theo biến thể** — `ProductVariant` chỉ có `name`/`colorHex`, chưa có field giá riêng. |
| Pre-order khi hết hàng | ❌ | Nút chỉ có "Thêm vào giỏ"/"Mua ngay", không có nhánh logic khi `stock === 0`. Chưa có field `preorder`/ngày giao dự kiến/% cọc trong `Product`. |
| Combo mua kèm giảm giá | 🟡 | Đã có `comboItems` trong data model + UI checkbox ([ProductDetail.tsx:167-190](../src/components/ProductDetail.tsx#L167)), nhưng **giá combo chưa được cộng vào giỏ hàng** — `handleAddToCart` không dùng `comboSelected`. |
| Thư viện 7-8 ảnh HD, auto crawl từ Shopee | ❌ | `images` hiện là **mảng emoji**, không phải ảnh thật. Chưa có pipeline import ảnh. |
| Video TikTok/Review nhúng trên trang | ❌ | Không có component video/embed nào. |

### Danh mục & Thương hiệu
| Yêu cầu | Trạng thái | Ghi chú |
|---|---|---|
| Lọc theo danh mục 1-click | ✅ | `/san-pham?category=...` đã hoạt động. |
| Trang riêng theo Brand + đoạn giới thiệu SEO | ✅ | [thuong-hieu/[slug]/page.tsx](../src/app/thuong-hieu/%5Bslug%5D/page.tsx) đã có mô tả brand + vừa bổ sung `generateMetadata`. |

### Blog & SEO
| Yêu cầu | Trạng thái | Ghi chú |
|---|---|---|
| Chuyên mục bài viết (Review/Hướng dẫn/Tin tức) | ❌ | Chỉ có `blogPosts` mock hiển thị ở trang chủ ([src/data/blog.ts](../src/data/blog.ts)), **không có route `/blog/[slug]`, không có trang danh sách bài viết**. |
| Meta chuẩn SEO, URL thân thiện, Schema Markup | 🟡 | Đã làm cho trang sản phẩm/brand/listing (metadata + JSON-LD Product/Organization, sitemap.ts, robots.ts — xem phần "Đã hoàn thành gần đây"). Blog chưa tồn tại nên chưa áp dụng được cho blog. |

---

## 2. Quy trình mua hàng & thanh toán (Checkout)

| Yêu cầu | Trạng thái | Ghi chú |
|---|---|---|
| Guest checkout (Họ tên, SĐT, Địa chỉ, Email, Ghi chú) | ✅ | Form đã đúng cấu trúc ở [CheckoutForm.tsx:85-101](../src/components/CheckoutForm.tsx#L85). |
| COD toàn quốc | ✅ (UI) / ❌ (xử lý đơn thật) | Có option trong form, nhưng **submit chỉ `clearCart()` rồi chuyển trang** ([CheckoutForm.tsx:53-57](../src/components/CheckoutForm.tsx#L53)) — không gửi đơn hàng đi đâu cả, không lưu lại. |
| VietQR tự sinh mã theo số tiền + nội dung, tự đối soát | 🟡 | Chỉ là **ảnh placeholder tĩnh** với số tài khoản hardcode ([CheckoutForm.tsx:171-183](../src/components/CheckoutForm.tsx#L171)), chưa sinh QR động, chưa có webhook đối soát biến động số dư. |
| Cổng VNPay (ví/thẻ/QR banking) | ❌ | Chỉ là 1 radio option, **chưa tích hợp API VNPay** nào (chưa có server action, chưa có merchant config, chưa có callback/IPN). |
| Freeship mặc định + phí hỏa tốc | ✅ | Đã có 3 mức phí ship ở [CheckoutForm.tsx:13-17](../src/components/CheckoutForm.tsx#L13). |

**Kết luận quan trọng:** toàn bộ luồng checkout hiện tại là **front-end thuần, không có backend**. Không có nơi nào đơn hàng được lưu trữ, không có API tạo đơn, không có gọi cổng thanh toán thật. Đây là gap lớn nhất so với bản mô tả.

---

## 3. Hệ thống quản trị & vận hành (Backend Admin)

| Yêu cầu | Trạng thái |
|---|---|
| Phân quyền Admin/Staff | ❌ Chưa có bất kỳ hệ thống auth/user nào. |
| Trang quản trị sản phẩm/đơn hàng/kho/báo cáo | ❌ Không tồn tại. Toàn bộ sản phẩm là **file TypeScript tĩnh** ([src/data/products.ts](../src/data/products.ts)), sửa sản phẩm = sửa code + deploy lại. |
| Đồng bộ tồn kho với Nhanh.vn (API) | ❌ Chưa có, và cần có hệ thống order/inventory nội bộ trước khi đồng bộ 2 chiều. |

**Đây là gap toàn phần** — cần cả database, authentication, admin UI, và order/inventory service. Hiện tại không có DB nào trong dự án (không Prisma/Drizzle, không kết nối SQL/NoSQL).

---

## 4. Tích hợp công nghệ & mở rộng

| Yêu cầu | Trạng thái |
|---|---|
| Script cào dữ liệu Shopee → import CSV | ❌ Chưa có, và chưa có backend để nhận import vào. |
| Sẵn sàng cho AI Chatbot (OpenAI/Dify) | ❌ Chưa có, nhưng kiến trúc Next.js hiện tại (App Router, Server Components) không cản trở việc thêm widget này sau — rủi ro thấp, có thể để giai đoạn sau. |

---

## Đã hoàn thành gần đây (không nằm trong bản mô tả nhưng liên quan)
- `generateMetadata` cho trang sản phẩm/danh mục/thương hiệu, JSON-LD Product + Organization, `sitemap.ts`, `robots.ts`, `noindex` cho trang thanh toán/thành công. Đáp ứng một phần yêu cầu "Cấu trúc chuẩn SEO" ở mục 1.

## Chưa commit
Các thay đổi SEO trên hiện chưa được commit vào git.

---

## Tổng kết mức độ sẵn sàng

```
Front-end UI (giao diện)     ████████████░░░░  ~70%  (thiếu ảnh thật, video, blog route, pre-order)
Checkout UI (giao diện)      ██████████████░░  ~85%  (giao diện đầy đủ, nhưng không submit đi đâu)
Thanh toán thật (VNPay/QR)   ░░░░░░░░░░░░░░░░    0%
Backend Admin (CMS/order)    ░░░░░░░░░░░░░░░░    0%
Đồng bộ Nhanh.vn              ░░░░░░░░░░░░░░░░    0%
SEO nền tảng                  ████████████████  100% (vừa hoàn thành)
```

**Nhận định:** Dự án hiện tại là một **frontend demo hoàn chỉnh** (giao diện, luồng điều hướng, cart localStorage) nhưng **chưa có bất kỳ backend thực nào**. Toàn bộ phần 2 (thanh toán thật), phần 3 (admin), và phần 4 (tích hợp) của bản mô tả đòi hỏi phải xây mới: database, API, authentication, và tích hợp cổng thanh toán/ERP.

## Đề xuất các giai đoạn tiếp theo (chưa triển khai, cần khách hàng chốt hướng)
1. **Nền tảng dữ liệu**: chọn DB (Postgres) + ORM (Prisma), chuyển `src/data/*` từ file tĩnh sang DB, giữ nguyên UI hiện tại.
2. **Order service tối thiểu**: API tạo đơn hàng thật khi submit checkout (thay cho `clearCart()` hiện tại), lưu đơn vào DB, sinh mã đơn thật.
3. **Thanh toán**: tích hợp VNPay (IPN callback) + sinh VietQR động (kèm cron/webhook đối soát nếu dùng dịch vụ ngân hàng mở API).
4. **Admin**: trang đăng nhập + CRUD sản phẩm/đơn hàng, phân quyền Admin/Staff.
5. **Tích hợp mở rộng**: đồng bộ Nhanh.vn, import Shopee, chatbot AI — làm sau khi có order/inventory service ổn định.

Mỗi giai đoạn là một quyết định kiến trúc riêng (ví dụ: tự xây admin vs. dùng headless CMS) — cần chốt trước khi bắt đầu code để tránh làm lại.
