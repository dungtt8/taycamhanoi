# Import sản phẩm vào WooCommerce

File: `woocommerce-products-import.csv` — 47 sản phẩm, tạo từ danh sách bạn gửi (Flydigi, Nobrand, Gamesir, Aolion, Mojhon).

## Cách import

1. Đăng nhập wp-admin → **Products → All Products → Import**.
2. Chọn file `woocommerce-products-import.csv`, bấm **Continue**.
3. Ở bước **Column mapping**, WooCommerce tự nhận diện các cột (Name, SKU, Categories, Attribute 1 name/value(s)...) — kiểm tra lại rồi bấm **Run the importer**.
4. Category ("Tay cầm", "Phụ kiện", "Đế tản nhiệt") sẽ **tự động được tạo** nếu chưa tồn tại.
5. Attribute "Brand" **phải được tạo trước** (Products → Attributes → Add new, name = `Brand`) — nếu chưa có, importer sẽ báo lỗi ở cột Attribute. Xem chi tiết ở [docs/woocommerce-local-dev.md](../woocommerce-local-dev.md) mục 5.

## Đã đơn giản hoá (cần bạn bổ sung sau import)

- **Giá bán**: để trống — vào từng sản phẩm điền giá thật.
- **Ảnh sản phẩm**: chưa có — vào từng sản phẩm upload ảnh.
- **Biến thể màu sắc** (VD: "Dune Fox - Trắng" / "Dune Fox - Hồng"): import dưới dạng **2 sản phẩm đơn (simple product) riêng biệt**, chưa gộp thành 1 sản phẩm có variation chọn màu. Nếu bạn muốn gộp thành sản phẩm variable (1 sản phẩm, chọn màu ở dropdown), báo tôi để làm file CSV khác theo đúng format `variable`/`variation` của WooCommerce.
- **SKU**: tôi tự đặt tạm theo mã brand + số thứ tự (VD: `FLY-001`), bạn có thể đổi lại theo quy ước riêng của shop.
