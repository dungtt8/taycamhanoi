# Main Repo Companion Changes (Plan A) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the four gaps found in the thin-admin spec review ready in the
main `taycamhanoi` Next.js repo — a `box_contents` product field, orders
created in a "chờ duyệt" (`on-hold`) status, an admin-editable secondhand
group URL, and a new Hỗ trợ page — so the (separately planned) thin-admin
app has something real to call as soon as it's built.

**Architecture:** Two new/extended WordPress mu-plugins (PHP, tracked in
`docs/wp-mu-plugins/`) expose the new data via REST (product meta + a small
custom public-read/auth-write settings endpoint). The Next.js site's
existing `src/lib/woocommerce.ts` / `src/lib/wordpress.ts` fetch layer grows
matching fields/functions, consumed by `ProductDetail.tsx`, `orders.ts`,
`site.ts`, and a new `/ho-tro` route — following the exact patterns already
used for `shopee_link` and the existing WordPress-page/category fetches.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, WooCommerce
REST API (`wc/v3`), WordPress REST API (`wp/v2` + a custom
`taycamhanoi/v1` namespace), plain PHP mu-plugins (no Composer/build step).

**Spec:** [docs/superpowers/specs/2026-09-06-thin-admin-site-design.md](../specs/2026-09-06-thin-admin-site-design.md)
— this plan implements that spec's "Thay đổi cần làm ở repo Next.js chính"
section. One deviation from the spec, found during planning (see Task 3):
the spec says the secondhand-group-URL setting is read/written through the
generic `wp/v2/settings` endpoint, but that endpoint requires an
authenticated WordPress request even for GET — which the public-facing
Next.js site cannot do without holding WordPress admin credentials just to
read one public URL. This plan instead adds a small custom REST route
(`taycamhanoi/v1/settings`, public GET / authenticated POST) for the same
purpose. The thin-admin app plan (Plan B) should point its "Cài đặt chung"
screen at this same custom route instead of `wp/v2/settings`.

## Global Constraints

- Always implement simply — no abstractions beyond what each task needs
  (from `CLAUDE.md`).
- Always skip test files — no automated tests are written for this plan;
  verification is via `npm run lint`, `npm run build`, and manual checks
  (from `CLAUDE.md`). This overrides the TDD step pattern this skill
  normally uses.
- Always keep the existing coding convention and file structure — new code
  follows the patterns already present in `src/lib/woocommerce.ts`,
  `src/lib/wordpress.ts`, `src/lib/woo-adapter.ts`, and existing mu-plugins
  under `docs/wp-mu-plugins/` (from `CLAUDE.md`).

---

### Task 1: Extend `product-fields.php` with the "Trong hộp có gì" field

**Files:**
- Modify: `docs/wp-mu-plugins/product-fields.php`
- Modify: `docs/woocommerce-local-dev.md:4` (deployment step),
  `docs/woocommerce-local-dev.md:15` (field documentation)

**Interfaces:**
- Produces: WooCommerce product meta key `box_contents` (plain text,
  multi-line), readable via `wc/v3/products` `meta_data` — same shape as
  the existing `shopee_link` meta key this file already manages.

- [ ] **Step 1: Add the "Trong hộp có gì" textarea to the existing meta box**

Open `docs/wp-mu-plugins/product-fields.php`. Replace the whole file with:

```php
<?php
/**
 * Plugin Name: TAYCAMHANOI - Product Custom Fields
 * Description: Adds a dedicated meta box to the product edit screen for
 * fields the generic Custom Fields panel is too clunky for (Shopee link,
 * box contents). Saved as plain post meta (keys: shopee_link,
 * box_contents), read by the Next.js frontend via WooCommerce's REST API
 * `meta_data` field — no extra plugin needed.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('add_meta_boxes', function () {
    add_meta_box(
        'taycamhanoi_shopee_link',
        'Thông tin bổ sung',
        'taycamhanoi_render_shopee_meta_box',
        'product',
        'side',
        'default'
    );
});

function taycamhanoi_render_shopee_meta_box($post)
{
    wp_nonce_field('taycamhanoi_save_shopee_link', 'taycamhanoi_shopee_link_nonce');
    $shopee_link = get_post_meta($post->ID, 'shopee_link', true);
    $box_contents = get_post_meta($post->ID, 'box_contents', true);
    ?>
    <label for="taycamhanoi_shopee_link_input" style="display:block;margin-bottom:6px;">
        Link sản phẩm trên Shopee
    </label>
    <input
        type="url"
        id="taycamhanoi_shopee_link_input"
        name="shopee_link"
        value="<?php echo esc_attr($shopee_link); ?>"
        placeholder="https://shopee.vn/..."
        style="width:100%;margin-bottom:12px;"
    />
    <label for="taycamhanoi_box_contents_input" style="display:block;margin-bottom:6px;">
        Trong hộp có gì (mỗi dòng 1 mục)
    </label>
    <textarea
        id="taycamhanoi_box_contents_input"
        name="box_contents"
        rows="4"
        style="width:100%;"
    ><?php echo esc_textarea($box_contents); ?></textarea>
    <?php
}

add_action('save_post_product', function ($post_id) {
    if (
        !isset($_POST['taycamhanoi_shopee_link_nonce']) ||
        !wp_verify_nonce($_POST['taycamhanoi_shopee_link_nonce'], 'taycamhanoi_save_shopee_link')
    ) {
        return;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    if (isset($_POST['shopee_link'])) {
        update_post_meta($post_id, 'shopee_link', esc_url_raw($_POST['shopee_link']));
    }

    if (isset($_POST['box_contents'])) {
        update_post_meta($post_id, 'box_contents', sanitize_textarea_field($_POST['box_contents']));
    }
});
```

- [ ] **Step 2: Document mu-plugin deployment in the local-dev guide**

In `docs/woocommerce-local-dev.md`, find section "## 4. Bật giả lập HTTPS
cho REST API (bắt buộc)". Its content currently ends right before section
"## 5. Tạo REST API key" — locate this exact paragraph near the end of
section 4:

```
> Chỉ dùng cho local dev. Trên production (hosting thật có SSL), **không tạo file này**.
```

Replace it with:

```
> Chỉ dùng cho local dev. Trên production (hosting thật có SSL), **không tạo file này**.

Dự án còn 2 mu-plugin nữa được lưu sẵn trong repo ở `docs/wp-mu-plugins/`
(`product-fields.php`, `site-settings.php`) — khác với file phía trên
(sinh ra bằng lệnh `wp-cli`), 2 file này là mã nguồn thật nên copy thẳng
vào container đang chạy:

```bash
docker cp docs/wp-mu-plugins/product-fields.php $(docker-compose -f docker-compose.woocommerce.yml ps -q wordpress):/var/www/html/wp-content/mu-plugins/product-fields.php
docker cp docs/wp-mu-plugins/site-settings.php $(docker-compose -f docker-compose.woocommerce.yml ps -q wordpress):/var/www/html/wp-content/mu-plugins/site-settings.php
```

> Chạy lại 2 lệnh này mỗi khi sửa nội dung 1 trong 2 file trên (mu-plugin
> không tự nhận thay đổi khi chỉ sửa file trong repo — phải copy lại vào
> container). Nếu bạn từng chạy `down -v` để reset sạch, chạy lại 2 lệnh
> `docker cp` này sau khi cài lại WordPress ở bước 3.
```

- [ ] **Step 3: Update the outdated "Link Shopee" doc section to match the new meta box**

In `docs/woocommerce-local-dev.md`, find:

```
## 15. Link Shopee cho từng sản phẩm

Trang chi tiết sản phẩm tự hiện nút "🛒 Xem trên Shopee" nếu sản phẩm có gán link — không cần cài plugin, dùng tính năng **Custom Fields** có sẵn của WordPress:

1. Sửa 1 sản phẩm → góc trên phải màn hình, bấm **Screen Options** → tick chọn **Custom Fields** (nếu chưa thấy khối này ở cuối trang sửa sản phẩm).
2. Cuộn xuống cuối trang sửa sản phẩm, tìm khối **Custom Fields** → **Add Custom Field**.
3. **Name** = `shopee_link` (gõ chính xác, phân biệt hoa/thường) → **Value** = link Shopee của sản phẩm đó → **Add Custom Field** → **Update** sản phẩm.

Lặp lại cho từng sản phẩm cần gắn link Shopee. Sản phẩm không có field này sẽ không hiện nút, không ảnh hưởng gì.
```

Replace with:

```
## 15. Link Shopee & Trong hộp có gì cho từng sản phẩm

Sau khi đã copy `product-fields.php` vào container (bước 4), mở trang sửa
1 sản phẩm — sidebar bên phải sẽ có khung **"Thông tin bổ sung"** với 2
field:

- **Link sản phẩm trên Shopee** — dán link Shopee, trang chi tiết sản phẩm
  tự hiện nút "🛒 Xem trên Shopee" nếu có điền.
- **Trong hộp có gì** — gõ mỗi dòng 1 món (ví dụ: "Tay cầm", "Cáp sạc
  USB-C", "Sách hướng dẫn"), trang chi tiết sản phẩm tự hiện thành mục
  riêng "Trong hộp có gì".

Bấm **Update** để lưu — không cần bật "Custom Fields" ở Screen Options như
cách làm cũ.
```

- [ ] **Step 4: Verify the plan's file edits are consistent**

Run:
```bash
grep -n "box_contents" docs/wp-mu-plugins/product-fields.php
```
Expected: 4 matches (textarea name attribute, `esc_textarea` read, the
`isset($_POST['box_contents'])` check, and the `update_post_meta` call).

- [ ] **Step 5: Commit**

```bash
git add docs/wp-mu-plugins/product-fields.php docs/woocommerce-local-dev.md
git commit -m "$(cat <<'EOF'
Add box_contents field to the product meta box mu-plugin

Extends the existing Shopee-link meta box with a "Trong hộp có gì"
textarea instead of adding a second box, and documents how to deploy
the repo-tracked mu-plugin files into the local WordPress container.
EOF
)"
```

---

### Task 2: Add `site-settings.php` mu-plugin (secondhand group URL)

**Files:**
- Create: `docs/wp-mu-plugins/site-settings.php`
- Modify: `docs/woocommerce-local-dev.md` (note near section 11, "Trang Hàng cũ")

**Interfaces:**
- Produces: `GET /wp-json/taycamhanoi/v1/settings` (public, no auth) →
  `{ "secondhand_group_url": string }`. `POST` to the same route (JSON body
  `{ "secondhand_group_url": string }`, requires `manage_options`
  capability) updates it — this is what the thin-admin app's future "Cài
  đặt chung" screen will call.

- [ ] **Step 1: Create the mu-plugin**

Create `docs/wp-mu-plugins/site-settings.php`:

```php
<?php
/**
 * Plugin Name: TAYCAMHANOI - Site Settings
 * Description: Small, admin-editable site settings that don't need a full
 * WordPress Page or product — exposed at a custom REST route so the
 * public Next.js site can read them with no authentication, while writes
 * require a logged-in WordPress user (used by the thin-admin app).
 */

if (!defined('ABSPATH')) {
    exit;
}

define('TAYCAMHANOI_SETTINGS_OPTION', 'taycamhanoi_settings');

function taycamhanoi_default_settings(): array
{
    return [
        'secondhand_group_url' => 'https://facebook.com/groups/taycamhanoi',
    ];
}

function taycamhanoi_get_settings(): array
{
    $stored = get_option(TAYCAMHANOI_SETTINGS_OPTION, []);
    return array_merge(taycamhanoi_default_settings(), is_array($stored) ? $stored : []);
}

add_action('rest_api_init', function () {
    register_rest_route('taycamhanoi/v1', '/settings', [
        [
            'methods' => 'GET',
            'callback' => function () {
                return taycamhanoi_get_settings();
            },
            'permission_callback' => '__return_true',
        ],
        [
            'methods' => 'POST',
            'callback' => function (WP_REST_Request $request) {
                $current = taycamhanoi_get_settings();
                $body = $request->get_json_params();
                if (isset($body['secondhand_group_url'])) {
                    $current['secondhand_group_url'] = esc_url_raw($body['secondhand_group_url']);
                }
                update_option(TAYCAMHANOI_SETTINGS_OPTION, $current);
                return taycamhanoi_get_settings();
            },
            'permission_callback' => function () {
                return current_user_can('manage_options');
            },
        ],
    ]);
});
```

- [ ] **Step 2: Document the new setting near the Hàng cũ section**

In `docs/woocommerce-local-dev.md`, find section "## 11. Trang \"Hàng cũ\"".
Its last paragraph currently reads:

```
> Nút "Tham gia nhóm trao đổi" trên trang này đang là link placeholder trong code ([src/lib/site.ts](../src/lib/site.ts) — hằng số `SECONDHAND_GROUP_URL`) — báo lại khi có link Facebook/Zalo group thật để cập nhật code.
```

Replace it with:

```
> Link nút "Tham gia nhóm trao đổi" đọc động từ
> `GET /wp-json/taycamhanoi/v1/settings` (mu-plugin `site-settings.php`,
> bước 4) — mặc định là link placeholder, sửa qua app admin (thin-admin,
> màn "Cài đặt chung") khi có link Facebook/Zalo group thật, không cần
> sửa code nữa.
```

- [ ] **Step 3: Commit**

```bash
git add docs/wp-mu-plugins/site-settings.php docs/woocommerce-local-dev.md
git commit -m "$(cat <<'EOF'
Add site-settings.php mu-plugin for the secondhand group URL

Public GET / authenticated POST custom REST route
(taycamhanoi/v1/settings) — avoids requiring the public Next.js site to
hold WordPress credentials just to read one admin-editable URL, which
the generic wp/v2/settings endpoint would have needed.
EOF
)"
```

---

### Task 3: Add `box_contents` to the product data layer

**Files:**
- Modify: `src/lib/woocommerce.ts:36-72` (`WooProduct` interface)
- Modify: `src/lib/woo-adapter.ts` (`mapWooProduct`)
- Modify: `src/data/types.ts` (`Product` interface)

**Interfaces:**
- Consumes: `WooProduct.meta_data` (already exists, `{ id, key, value }[]`)
- Produces: `Product.boxContents?: string` — consumed by Task 5
  (`ProductDetail.tsx`)

- [ ] **Step 1: Read `box_contents` in `mapWooProduct`**

In `src/lib/woo-adapter.ts`, find:

```ts
  const shopeeLinkMeta = p.meta_data?.find((m) => m.key === "shopee_link");
  const shopeeLink = typeof shopeeLinkMeta?.value === "string" ? shopeeLinkMeta.value : undefined;
```

Replace with:

```ts
  const shopeeLinkMeta = p.meta_data?.find((m) => m.key === "shopee_link");
  const shopeeLink = typeof shopeeLinkMeta?.value === "string" ? shopeeLinkMeta.value : undefined;

  const boxContentsMeta = p.meta_data?.find((m) => m.key === "box_contents");
  const boxContents =
    typeof boxContentsMeta?.value === "string" && boxContentsMeta.value.trim() !== ""
      ? boxContentsMeta.value
      : undefined;
```

Then find the returned object's last line:

```ts
    shopeeLink,
  };
}
```

Replace with:

```ts
    shopeeLink,
    boxContents,
  };
}
```

- [ ] **Step 2: Add the field to the `Product` type**

In `src/data/types.ts`, find:

```ts
  policyNoteHtml?: string;
  shopeeLink?: string;
}
```

Replace with:

```ts
  policyNoteHtml?: string;
  shopeeLink?: string;
  boxContents?: string;
}
```

- [ ] **Step 3: Verify with the TypeScript compiler**

Run: `npm run build`
Expected: build succeeds (no type errors — `boxContents` is optional on
both sides, so this alone can't break existing callers).

- [ ] **Step 4: Commit**

```bash
git add src/lib/woo-adapter.ts src/data/types.ts
git commit -m "$(cat <<'EOF'
Map box_contents product meta into the Product type

Reads the same way shopee_link already does — a meta_data lookup,
undefined when empty. UI rendering is a separate task.
EOF
)"
```

---

### Task 4: Render "Trong hộp có gì" on the product detail page

**Files:**
- Modify: `src/components/ProductDetail.tsx`

**Interfaces:**
- Consumes: `Product.boxContents?: string` (from Task 3)

- [ ] **Step 1: Add the section to `ProductDetail.tsx`**

Find this block (the specs section, right before the warranty policy
section):

```tsx
        {Object.keys(product.specs).length > 0 && (
          <div>
            <h2 className="font-bold text-lg text-gray-900 mb-3">Thông số kỹ thuật</h2>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex text-sm">
                  <span className="w-1/3 bg-gray-50 px-4 py-2.5 font-medium text-gray-600">{key}</span>
                  <span className="flex-1 px-4 py-2.5 text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {warrantyPolicyHtml && (
```

Replace with:

```tsx
        {Object.keys(product.specs).length > 0 && (
          <div>
            <h2 className="font-bold text-lg text-gray-900 mb-3">Thông số kỹ thuật</h2>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex text-sm">
                  <span className="w-1/3 bg-gray-50 px-4 py-2.5 font-medium text-gray-600">{key}</span>
                  <span className="flex-1 px-4 py-2.5 text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {product.boxContents && (
          <div>
            <h2 className="font-bold text-lg text-gray-900 mb-3">Trong hộp có gì</h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {product.boxContents}
            </div>
          </div>
        )}

        {warrantyPolicyHtml && (
```

Note: this renders as plain text (`whitespace-pre-line`, not
`dangerouslySetInnerHTML`) — `box_contents` comes from a plain `<textarea>`
in the mu-plugin (Task 1), not a rich-text editor, so it must never be
treated as HTML.

- [ ] **Step 2: Manually verify with a fake product**

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds.

If a local WooCommerce dev stack is running (see
`docs/woocommerce-local-dev.md`), open a product's edit screen, fill in
"Trong hộp có gì" with 2-3 lines, save, then open that product's page on
`http://localhost:3000/san-pham/<slug>` and confirm the "Trong hộp có gì"
section appears between "Thông số kỹ thuật" and "Chính sách bảo hành" with
line breaks preserved.

- [ ] **Step 3: Commit**

```bash
git add src/components/ProductDetail.tsx
git commit -m "$(cat <<'EOF'
Render "Trong hộp có gì" section on the product detail page
EOF
)"
```

---

### Task 5: Create orders in "on-hold" (chờ duyệt) status

**Files:**
- Modify: `src/lib/woocommerce.ts:154-163` (`WooOrderInput`)
- Modify: `src/lib/orders.ts`

**Interfaces:**
- Produces: every order created by `createOrderAction` now has
  `status: "on-hold"` instead of WooCommerce's default — the thin-admin
  app's future "Duyệt đơn" action (Plan B) moves it to `processing`.

- [ ] **Step 1: Add `status` to `WooOrderInput`**

In `src/lib/woocommerce.ts`, find:

```ts
export interface WooOrderInput {
  payment_method: string;
  payment_method_title: string;
  set_paid?: boolean;
  billing: WooOrderAddress;
  shipping: WooOrderAddress;
  line_items: WooOrderLineItem[];
  shipping_lines?: WooOrderShippingLine[];
  customer_note?: string;
}
```

Replace with:

```ts
export interface WooOrderInput {
  payment_method: string;
  payment_method_title: string;
  set_paid?: boolean;
  status?: string;
  billing: WooOrderAddress;
  shipping: WooOrderAddress;
  line_items: WooOrderLineItem[];
  shipping_lines?: WooOrderShippingLine[];
  customer_note?: string;
}
```

- [ ] **Step 2: Set the status when creating an order**

In `src/lib/orders.ts`, find:

```ts
  const order: WooOrderInput = {
    payment_method: PAYMENT_METHOD_IDS[input.paymentMethod],
    payment_method_title: PAYMENT_TITLES[input.paymentMethod],
    set_paid: false,
    billing: address,
```

Replace with:

```ts
  const order: WooOrderInput = {
    payment_method: PAYMENT_METHOD_IDS[input.paymentMethod],
    payment_method_title: PAYMENT_TITLES[input.paymentMethod],
    set_paid: false,
    status: "on-hold",
    billing: address,
```

- [ ] **Step 3: Verify with the TypeScript compiler**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Manually verify order creation (if local WooCommerce stack is running)**

Add an item to the cart on `http://localhost:3000`, complete checkout, then
check WooCommerce → Orders in wp-admin: the new order's status should show
as **"Chờ xử lý"/"On hold"** (WooCommerce's built-in label for `on-hold`),
not the previous default.

- [ ] **Step 5: Commit**

```bash
git add src/lib/woocommerce.ts src/lib/orders.ts
git commit -m "$(cat <<'EOF'
Create new orders in on-hold status pending admin approval

Reuses WooCommerce's built-in on-hold/processing statuses as
"chờ duyệt"/"đã duyệt" instead of registering a custom order status —
the thin-admin app's order-approval action (planned separately) moves
on-hold orders to processing.
EOF
)"
```

---

### Task 6: Read the secondhand group URL dynamically

**Files:**
- Modify: `src/lib/wordpress.ts` (add `getSiteSettings`)
- Modify: `src/lib/site.ts` (replace the constant with an async getter)
- Modify: `src/app/hang-cu/page.tsx` (use the new getter)

**Interfaces:**
- Consumes: `GET taycamhanoi/v1/settings` (Task 2)
- Produces: `getSecondhandGroupUrl(): Promise<string>` — replaces the
  removed `SECONDHAND_GROUP_URL` constant

- [ ] **Step 1: Add `getSiteSettings` to `wordpress.ts`**

In `src/lib/wordpress.ts`, find the last function in the file:

```ts
export async function getWpPageBySlug(slug: string): Promise<WpPage | null> {
  const pages = await wpFetch<WpPage[]>("pages", { slug });
  return pages?.[0] ?? null;
}
```

Replace with (keeping that function, and adding new code after it):

```ts
export async function getWpPageBySlug(slug: string): Promise<WpPage | null> {
  const pages = await wpFetch<WpPage[]>("pages", { slug });
  return pages?.[0] ?? null;
}

export interface SiteSettings {
  secondhand_group_url: string;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (!WP_URL) return null;
  const res = await fetch(new URL("/wp-json/taycamhanoi/v1/settings", WP_URL), {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return res.json();
}
```

- [ ] **Step 2: Replace the constant in `site.ts`**

In `src/lib/site.ts`, find:

```ts
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://taycamhanoi.vn";

export const SITE_NAME = "TAYCAMHANOI";

// TODO: thay bằng link Facebook/Zalo group trao đổi mua bán "Hàng cũ" thật.
export const SECONDHAND_GROUP_URL = "https://facebook.com/groups/taycamhanoi";
```

Replace with:

```ts
import { getSiteSettings } from "./wordpress";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://taycamhanoi.vn";

export const SITE_NAME = "TAYCAMHANOI";

const DEFAULT_SECONDHAND_GROUP_URL = "https://facebook.com/groups/taycamhanoi";

export async function getSecondhandGroupUrl(): Promise<string> {
  const settings = await getSiteSettings();
  return settings?.secondhand_group_url ?? DEFAULT_SECONDHAND_GROUP_URL;
}
```

- [ ] **Step 3: Update the one consumer of the old constant**

In `src/app/hang-cu/page.tsx`, find:

```tsx
import { SECONDHAND_GROUP_URL } from "@/lib/site";
```

Replace with:

```tsx
import { getSecondhandGroupUrl } from "@/lib/site";
```

Then find:

```tsx
export default async function SecondhandPage() {
  const categories = await getWooCategories();
```

Replace with:

```tsx
export default async function SecondhandPage() {
  const [categories, secondhandGroupUrl] = await Promise.all([
    getWooCategories(),
    getSecondhandGroupUrl(),
  ]);
```

Then find:

```tsx
          <a
            href={SECONDHAND_GROUP_URL}
```

Replace with:

```tsx
          <a
            href={secondhandGroupUrl}
```

- [ ] **Step 4: Verify with the TypeScript compiler and a repo-wide search**

Run: `grep -rn "SECONDHAND_GROUP_URL" src/`
Expected: no matches (the old constant is fully removed).

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Manually verify (if local WooCommerce stack is running)**

Open `http://localhost:3000/hang-cu` and confirm the "Tham gia nhóm trao
đổi" button still points at the default URL (since no override has been
set through `taycamhanoi/v1/settings` yet).

- [ ] **Step 6: Commit**

```bash
git add src/lib/wordpress.ts src/lib/site.ts src/app/hang-cu/page.tsx
git commit -m "$(cat <<'EOF'
Read the secondhand group URL from a WordPress setting, not a constant

Replaces the hardcoded SECONDHAND_GROUP_URL with a dynamic read from
taycamhanoi/v1/settings (added in Task 2), so it becomes editable from
the thin-admin app instead of requiring a code change + deploy.
EOF
)"
```

---

### Task 7: Add the Hỗ trợ page, header nav item, and footer fix

**Files:**
- Create: `src/app/ho-tro/page.tsx`
- Modify: `src/components/Nav.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Produces: route `/ho-tro`, `NavActive` gains `"support"`.

- [ ] **Step 1: Add `"support"` to the `NavActive` type and render the nav item**

In `src/components/Nav.tsx`, find:

```tsx
export type NavActive = "home" | "products" | "guide" | "blog" | "used" | "gamepad-test";
```

Replace with:

```tsx
export type NavActive = "home" | "products" | "guide" | "blog" | "used" | "gamepad-test" | "support";
```

Then find:

```tsx
          <li>
            <Link href="/kiem-tra-tay-cam" prefetch={false} className={linkClass("gamepad-test")}>
              <GamepadIcon className="w-4 h-4" />
              Kiểm tra tay cầm
            </Link>
          </li>
        </ul>
```

Replace with:

```tsx
          <li>
            <Link href="/kiem-tra-tay-cam" prefetch={false} className={linkClass("gamepad-test")}>
              <GamepadIcon className="w-4 h-4" />
              Kiểm tra tay cầm
            </Link>
          </li>
          <li>
            <Link href="/ho-tro" prefetch={false} className={linkClass("support")}>
              <SupportIcon className="w-4 h-4" />
              Hỗ trợ
            </Link>
          </li>
        </ul>
```

- [ ] **Step 2: Fix the footer's "Liên hệ" link and add a Hỗ trợ link**

In `src/components/Footer.tsx`, find:

```tsx
            <li><Link href="/huong-dan" className="hover:text-white">Hướng dẫn mua hàng</Link></li>
            <li><Link href="/huong-dan" className="hover:text-white">Liên hệ</Link></li>
```

Replace with:

```tsx
            <li><Link href="/huong-dan" className="hover:text-white">Hướng dẫn mua hàng</Link></li>
            <li><Link href="/ho-tro" className="hover:text-white">Liên hệ</Link></li>
```

- [ ] **Step 3: Create the Hỗ trợ page**

Create `src/app/ho-tro/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Hỗ trợ",
  description: "Liên hệ, câu hỏi thường gặp, chính sách bảo hành/đổi trả và công cụ kiểm tra tay cầm của TAYCAMHANOI.",
};

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Đặt hàng bao lâu thì nhận được?",
    answer: "Giao tiêu chuẩn 3-5 ngày, giao nhanh 1-2 ngày, hoặc hỏa tốc trong ngày với nội thành — chọn ở bước thanh toán.",
  },
  {
    question: "Sản phẩm có được bảo hành không?",
    answer: "Tất cả sản phẩm chính hãng tại TAYCAMHANOI được bảo hành 12 tháng — xem chi tiết ở Chính sách bảo hành bên dưới.",
  },
  {
    question: "Tôi có thể đổi/trả hàng không?",
    answer: "Có, trong vòng 7 ngày kể từ khi nhận hàng — xem chi tiết ở Chính sách đổi trả bên dưới.",
  },
];

export default function SupportPage() {
  return (
    <>
      <TopBar />
      <Header variant="compact" showNav navActive="support" />
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Hỗ trợ" }]} />

      <section className="max-w-3xl mx-auto px-4 pb-10 space-y-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-gray-900 mb-4">Hỗ trợ</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a href="tel:090xxxxxxx" className="border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 transition">
              <p className="font-semibold text-gray-800 text-sm">📞 Gọi hotline</p>
              <p className="text-xs text-gray-500 mt-1">090.xxx.xxxx</p>
            </a>
            <a href="#" className="border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 transition">
              <p className="font-semibold text-gray-800 text-sm">💬 Chat Zalo</p>
              <p className="text-xs text-gray-500 mt-1">Phản hồi trong ngày</p>
            </a>
            <a href="mailto:support@taycamhanoi.vn" className="border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 transition">
              <p className="font-semibold text-gray-800 text-sm">✉️ Email</p>
              <p className="text-xs text-gray-500 mt-1">support@taycamhanoi.vn</p>
            </a>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-lg text-gray-900 mb-3">Câu hỏi thường gặp</h2>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group p-4">
                <summary className="font-semibold text-sm text-gray-800 cursor-pointer list-none flex items-center justify-between">
                  {faq.question}
                  <span className="text-gray-400 group-open:rotate-180 transition">⌄</span>
                </summary>
                <p className="text-sm text-gray-600 mt-2">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-bold text-lg text-gray-900 mb-3">Chính sách</h2>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/chinh-sach/chinh-sach-bao-hanh" className="text-blue-700 hover:underline">
              Chính sách bảo hành →
            </Link>
            <Link href="/chinh-sach/chinh-sach-doi-tra" className="text-blue-700 hover:underline">
              Chính sách đổi trả →
            </Link>
            <Link href="/kiem-tra-tay-cam" className="text-blue-700 hover:underline">
              Công cụ kiểm tra tay cầm →
            </Link>
          </div>
        </div>
      </section>

      <Footer variant="condensed" />
      <MobileBottomNav active="home" />
      <div className="h-16 md:hidden" />
    </>
  );
}
```

- [ ] **Step 4: Add the route to the sitemap**

In `src/app/sitemap.ts`, find:

```ts
    { url: `${SITE_URL}/kiem-tra-tay-cam`, changeFrequency: "monthly", priority: 0.4 },
  ];
```

Replace with:

```ts
    { url: `${SITE_URL}/kiem-tra-tay-cam`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/ho-tro`, changeFrequency: "monthly", priority: 0.4 },
  ];
```

- [ ] **Step 5: Verify**

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds, `/ho-tro` listed among the generated routes.

Start the dev server (`npm run dev`) and open `http://localhost:3000/ho-tro`
— confirm the header shows 8 nav items with "Hỗ trợ" last and highlighted
active, the 3 contact cards render, each FAQ item expands on click, and the
2 policy links plus the "Kiểm tra tay cầm" link work. Then open any page
with the full footer (e.g. `/`) and confirm "Liên hệ" now links to
`/ho-tro` instead of `/huong-dan`.

- [ ] **Step 6: Commit**

```bash
git add src/app/ho-tro/page.tsx src/components/Nav.tsx src/components/Footer.tsx src/app/sitemap.ts
git commit -m "$(cat <<'EOF'
Add Hỗ trợ page, header nav item, and fix Footer's "Liên hệ" link

Footer's "Liên hệ" item previously pointed at /huong-dan by mistake —
there was no dedicated support page to link to yet.
EOF
)"
```
