# Setup WordPress + WooCommerce từ đầu (local dev)

Hướng dẫn đầy đủ, làm theo thứ tự từ trên xuống — dành cho việc bạn **chưa cấu hình gì trên wp-admin**. Mục đích: có một backend WooCommerce thật chạy trên máy bạn để test toàn bộ frontend Next.js, không cần mua hosting trước.

## Mục lục

1. [Yêu cầu trước khi bắt đầu](#1-yêu-cầu-trước-khi-bắt-đầu)
2. [Khởi động WordPress + MySQL](#2-khởi-động-wordpress--mysql)
3. [Cài WordPress core + WooCommerce](#3-cài-wordpress-core--woocommerce)
4. [Bật giả lập HTTPS cho REST API](#4-bật-giả-lập-https-cho-rest-api-bắt-buộc)
5. [Tạo REST API key](#5-tạo-rest-api-key)
6. [Cấu hình Next.js kết nối WooCommerce](#6-cấu-hình-nextjs-kết-nối-woocommerce)
7. [Thiết lập thuộc tính "Brand"](#7-thiết-lập-thuộc-tính-brand)
8. [Tạo Category sản phẩm](#8-tạo-category-sản-phẩm)
9. [Ảnh sản phẩm](#9-ảnh-sản-phẩm)
10. [Đặt hàng trước (Pre-order)](#10-đặt-hàng-trước-pre-order)
11. [Trang "Hàng cũ"](#11-trang-hàng-cũ)
12. [Trang "Hướng dẫn" và "Blog & Review"](#12-trang-hướng-dẫn-và-blog--review)
13. [Trang Chính sách](#13-trang-chính-sách)
14. [Viết bài Hướng dẫn có mục lục + accordion](#14-viết-bài-hướng-dẫn-có-mục-lục--accordion)
15. [Link Shopee cho từng sản phẩm](#15-link-shopee-cho-từng-sản-phẩm)
16. [Checklist tổng kết](#16-checklist-tổng-kết)

---

## 1. Yêu cầu trước khi bắt đầu

Cần có **Docker Desktop** (hoặc Colima trên macOS) đã cài và đang chạy. Kiểm tra:

```bash
docker --version
```

Nếu lệnh `docker compose` (có khoảng trắng) báo `unknown command`, máy bạn dùng bản Docker Compose độc lập — dùng `docker-compose` (có gạch nối) thay thế trong toàn bộ hướng dẫn này. Kiểm tra bằng:

```bash
docker compose version    # nếu lỗi thì dùng docker-compose
```

File cấu hình `docker-compose.woocommerce.yml` đã có sẵn ở gốc repo, không cần tạo mới.

## 2. Khởi động WordPress + MySQL

```bash
docker-compose -f docker-compose.woocommerce.yml up -d
```

Chờ khoảng 10-20s cho MySQL sẵn sàng, sau đó mở [http://localhost:8080](http://localhost:8080) để xác nhận WordPress đã lên (sẽ thấy màn hình cài đặt — không cần cài qua UI, dùng lệnh ở bước 3).

> Nếu gặp lỗi `Error establishing a database connection` hoặc host `mysql` (không phải `db`) ở các bước sau, volume đã bị ghi `wp-config.php` sai — xoá sạch và chạy lại:
> ```bash
> docker-compose -f docker-compose.woocommerce.yml down -v
> docker-compose -f docker-compose.woocommerce.yml up -d
> ```

## 3. Cài WordPress core + WooCommerce

Chạy 1 lệnh duy nhất (cài WordPress, cài + kích hoạt plugin WooCommerce, bật permalink dạng `/ten-bai/`):

```bash
docker-compose -f docker-compose.woocommerce.yml run --rm wpcli "
  until [ -f /var/www/html/wp-config.php ]; do echo 'Đợi WordPress ghi wp-config.php...'; sleep 1; done &&
  wp core is-installed --path=/var/www/html --allow-root ||
  wp core install \
    --path=/var/www/html \
    --url=http://localhost:8080 \
    --title=TAYCAMHANOI \
    --admin_user=admin \
    --admin_password=admin123456 \
    --admin_email=admin@example.com \
    --skip-email \
    --allow-root &&
  wp plugin install woocommerce --activate --path=/var/www/html --allow-root &&
  wp option update permalink_structure '/%postname%/' --path=/var/www/html --allow-root
"
```

Tài khoản admin sau khi chạy xong: **`admin` / `admin123456`** — chỉ dùng cho local, không dùng lại cho production.

> Lệnh này an toàn để chạy lại nhiều lần (idempotent) — nếu 1 bước lỗi giữa chừng, chạy lại nguyên lệnh sẽ tự bỏ qua phần đã xong.

Đăng nhập thử tại [http://localhost:8080/wp-admin](http://localhost:8080/wp-admin). Nếu thấy màn hình **setup wizard của WooCommerce** ("Which one of these best describes you?"), có thể bỏ qua tự do (chọn bất kỳ option nào rồi Continue liên tục, hoặc tìm link "Skip guided setup") — wizard này không ảnh hưởng gì đến việc tích hợp API.

## 4. Bật giả lập HTTPS cho REST API (bắt buộc)

WooCommerce REST API **chỉ chấp nhận xác thực** (`consumer_key`/`consumer_secret`) khi request được coi là HTTPS — nếu không sẽ luôn trả lỗi `401 woocommerce_rest_cannot_view` dù key đúng 100%. Vì WordPress local chạy HTTP thuần (`localhost:8080`), cần thêm 1 mu-plugin nhỏ để WordPress tự nhận là HTTPS ở tầng PHP (không đổi URL truy cập, chỉ ảnh hưởng nội bộ):

```bash
docker-compose -f docker-compose.woocommerce.yml run --rm wpcli 'mkdir -p /var/www/html/wp-content/mu-plugins && cat > /var/www/html/wp-content/mu-plugins/force-ssl-local.php << "PHP"
<?php
if ( ! isset( $_SERVER["HTTPS"] ) ) {
    $_SERVER["HTTPS"] = "on";
}
PHP
'
```

> Chỉ dùng cho local dev. Trên production (hosting thật có SSL), **không tạo file này**.

## 5. Tạo REST API key

WooCommerce chưa hỗ trợ tạo key qua wp-cli — làm qua giao diện, 1 lần duy nhất:

1. Đăng nhập [http://localhost:8080/wp-admin](http://localhost:8080/wp-admin) với `admin` / `admin123456`.
2. Vào **WooCommerce → Settings → Advanced → REST API → Add key**.
3. Chọn quyền **Read/Write**, bấm **Generate API key**.
4. Copy `Consumer Key` (`ck_...`) và `Consumer Secret` (`cs_...`) — chỉ hiện 1 lần, lưu lại ngay.

## 6. Cấu hình Next.js kết nối WooCommerce

Tạo/sửa file `.env.local` ở gốc repo Next.js (file này **không commit vào git**):

```
WOOCOMMERCE_URL=http://localhost:8080
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Chạy `npm run dev`, mở `http://localhost:3000` — nếu trang chủ load được (dù chưa có sản phẩm), kết nối đã đúng. Các bước 7-14 dưới đây là **nội dung/cấu hình bên trong wp-admin**, không cần sửa lại `.env.local`.

## 7. Thiết lập "Brand"

Frontend lấy tên thương hiệu qua tính năng **Brands** có sẵn của WooCommerce (bản mới, mục riêng trong menu Products — **không phải** Attribute, không cần plugin trả phí):

1. **Products → Brands** (menu con bên trái, ngang hàng với Categories) → **Add new brand**: Name = tên brand (VD: Gamesir), điền **Description** nếu muốn — nội dung này hiển thị ở trang `/thuong-hieu/[slug]`. Lặp lại cho từng brand (Flydigi, Aolion, Nobrand, Mojhon...).
2. Khi tạo/sửa từng sản phẩm: khung **Brands** ở sidebar bên phải (ngang hàng khung Categories/Tags) → tick chọn đúng brand → **Update**.

> Nếu sản phẩm không gán Brand nào, frontend tự fallback dùng category đầu tiên của sản phẩm làm brand hiển thị (nhưng sẽ không có trang `/thuong-hieu/[slug]` tương ứng).
> Nếu wp-admin của bạn không có mục "Brands" riêng (WooCommerce bản cũ hơn chưa có tính năng này), dùng lại cách cũ: tạo 1 **global attribute** tên "Brand" ở **Attributes**, gán qua tab Attributes của sản phẩm — báo tôi để đổi lại code đọc theo attribute thay vì Brands taxonomy.

## 8. Tạo Category sản phẩm

**Products → Categories → Add new category** — tạo category thật (VD: Tay cầm PC, Tay cầm Console, Tay cầm Mobile, Tay cầm Xbox, Tay cầm Switch, Phụ kiện...), điền **Description** cho mỗi category — nội dung này hiển thị ở banner trang `/san-pham?category=...` và ở khối "Danh mục nổi bật" trang chủ. Gán category cho từng sản phẩm ở khung bên phải khi tạo/sửa sản phẩm.

## 9. Ảnh sản phẩm

Tab **Product image** / **Product gallery** khi tạo/sửa sản phẩm — upload ảnh thật. Frontend tự hiển thị qua `next/image`, không cần cấu hình gì thêm (miễn `WOOCOMMERCE_URL` ở bước 6 đúng domain chứa ảnh).

## 10. Đặt hàng trước (Pre-order)

Không cần field riêng — dùng đúng cơ chế tồn kho có sẵn của WooCommerce: sửa sản phẩm → tab **Inventory** → **Stock status** = **On backorder**. Frontend tự đổi nút "Mua ngay" thành "Đặt hàng trước" và hiện badge tương ứng. Ghi chú ngày giao dự kiến (nếu có) viết trong **Short description** — nội dung này hiển thị ở mục "Chính sách sản phẩm" trên trang chi tiết.

## 11. Trang "Hàng cũ"

**Products → Categories → Add new category**, tên "Hàng cũ" — kiểm tra ô **Slug** phải đúng là `hang-cu` (WordPress tự sinh slug từ tên khi tạo, nhưng nên xác nhận lại). Gán category này cho sản phẩm cũ như category thường. Trang `/hang-cu` tự lọc sản phẩm theo category này.

> Nút "Tham gia nhóm trao đổi" trên trang này đang là link placeholder trong code ([src/lib/site.ts](../src/lib/site.ts) — hằng số `SECONDHAND_GROUP_URL`) — báo lại khi có link Facebook/Zalo group thật để cập nhật code.

## 12. Trang "Hướng dẫn" và "Blog & Review"

Hai trang này lấy nội dung từ **WordPress Posts** (khác với Products của WooCommerce) — viết bài như blog thường ở **Posts → Add New**.

- Bài thuộc mục **Hướng dẫn**: gán category có slug `huong-dan` (**Posts → Categories → Add new**, tên "Hướng dẫn", slug `huong-dan`).
- Bài thuộc mục **Blog & Review**: gán category có slug `blog-review`.
- Nếu category chưa tồn tại, trang tạm hiển thị toàn bộ bài viết (không lọc) cho tới khi bạn tạo đúng category slug ở trên.

## 13. Trang Chính sách

**Pages → Add New** (không phải Posts) — tạo các trang chính sách với **slug cố định** để frontend tự tìm đúng nội dung:

| Nội dung | Slug bắt buộc |
|---|---|
| Chính sách bảo hành | `chinh-sach-bao-hanh` |
| Chính sách đổi trả | `chinh-sach-doi-tra` |

Trang chi tiết sản phẩm tự hiển thị nội dung Page `chinh-sach-bao-hanh` ở cuối trang; Footer link tới cả 2 trang qua đường dẫn `/chinh-sach/[slug]`.

## 14. Viết bài Hướng dẫn có mục lục + accordion

Trang `/huong-dan/[slug]` tự dựng **mục lục bám cuộn (Sommaire)** bên trái từ các block **Heading cấp H2** admin thêm vào bài — không cần cấu hình gì thêm, chỉ cần dùng đúng H2 làm tiêu đề mục lớn (không dùng H3 cho việc này).

Để có giao diện accordion/bảng/nút giống trang Support của GameSir, dùng đúng các **block có sẵn của WordPress** (không cần cài plugin nào) khi viết bài ở **Posts → Add New**:

| Muốn hiển thị | Dùng block |
|---|---|
| Tiêu đề mục lớn (hiện trong mục lục) | **Heading**, chọn cấp H2 |
| Bảng tính năng/thông số | **Table** |
| 3 cột yêu cầu hệ thống (kiểu card) | **Columns** (chọn 3 cột) |
| Danh sách bước xổ xuống, hoặc từng câu FAQ | **Details** (gõ câu hỏi/tiêu đề ở ô "Summary", nội dung trả lời bên trong) |
| Nút tải PDF / liên kết nổi bật | **Buttons**, link tới file đã upload ở Media |

Toàn bộ style (accordion, bảng, card, nút) đã được code sẵn ở [src/components/GuideArticle.tsx](../src/components/GuideArticle.tsx), tự áp dụng khi đúng loại block trên.

## 15. Link Shopee cho từng sản phẩm

Trang chi tiết sản phẩm tự hiện nút "🛒 Xem trên Shopee" nếu sản phẩm có gán link — không cần cài plugin, dùng tính năng **Custom Fields** có sẵn của WordPress:

1. Sửa 1 sản phẩm → góc trên phải màn hình, bấm **Screen Options** → tick chọn **Custom Fields** (nếu chưa thấy khối này ở cuối trang sửa sản phẩm).
2. Cuộn xuống cuối trang sửa sản phẩm, tìm khối **Custom Fields** → **Add Custom Field**.
3. **Name** = `shopee_link` (gõ chính xác, phân biệt hoa/thường) → **Value** = link Shopee của sản phẩm đó → **Add Custom Field** → **Update** sản phẩm.

Lặp lại cho từng sản phẩm cần gắn link Shopee. Sản phẩm không có field này sẽ không hiện nút, không ảnh hưởng gì.

## 16. Checklist tổng kết

Đánh dấu lại sau khi làm xong để không sót bước nào:

- [ ] Docker chạy `up -d` thành công (bước 2)
- [ ] WordPress + WooCommerce cài xong qua wp-cli (bước 3)
- [ ] Mu-plugin giả lập HTTPS đã tạo (bước 4)
- [ ] Đã có Consumer Key + Secret (bước 5)
- [ ] `.env.local` đã điền đủ 3 biến, `npm run dev` chạy được (bước 6)
- [ ] Attribute "Brand" đã tạo + có ít nhất 1 term (bước 7)
- [ ] Ít nhất 1 Category sản phẩm đã tạo (bước 8)
- [ ] Ít nhất 1 sản phẩm có ảnh + gán Brand + Category (bước 7-9)
- [ ] Category "Hàng cũ" (slug `hang-cu`) đã tạo nếu cần dùng trang Hàng cũ (bước 11)
- [ ] Category bài viết `huong-dan` và `blog-review` đã tạo nếu cần 2 trang này lên nội dung (bước 12)
- [ ] 2 Page chính sách (`chinh-sach-bao-hanh`, `chinh-sach-doi-tra`) đã tạo (bước 13)

## Dừng / dọn môi trường

```bash
docker-compose -f docker-compose.woocommerce.yml down       # dừng, giữ data
docker-compose -f docker-compose.woocommerce.yml down -v    # dừng, xoá luôn data (reset sạch, làm lại từ bước 2)
```

## Khi chuyển sang production

Lặp lại bước 3, 5, 7-14 trên WordPress hosting thật (không dùng Docker, **không cần** mu-plugin bước 4 vì hosting thật có SSL sẵn), rồi chỉ cần đổi 3 biến env ở bước 6 sang domain + key thật — code phía Next.js không cần sửa gì.
