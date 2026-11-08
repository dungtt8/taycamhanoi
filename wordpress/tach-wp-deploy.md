# Tách WordPress sang project riêng trên VPS

Project cũ: `/opt/wordpress-multisite-deploy` (service `wp_woo`, dùng chung multisite)
Project mới: `/opt/taycamhanoi-wp` (độc lập hoàn toàn)

Đánh dấu `[x]` khi làm xong từng bước, note lại kết quả/lỗi ngay dưới mỗi bước.

## Bước 0 — Backup

- [x] Dump DB cũ
  ```bash
  cd /opt/wordpress-multisite-deploy
  docker exec mariadb mysqldump -u woo_user -p'<WOO_DB_PASSWORD>' woo_db > /opt/backup-woo-db-$(date +%Y%m%d).sql
  ```
  Note: biến `$MYSQL_ROOT_PASSWORD`/`$WOO_DB_NAME` không tự có trong shell SSH, phải lấy giá trị thật từ `.env` rồi truyền tay.
- [x] Backup volume wp-content
  ```bash
  docker run --rm -v wordpress-multisite-deploy_wp_woo_content:/data -v /opt:/backup alpine tar czf /backup/wp-content-backup-$(date +%Y%m%d).tar.gz -C /data .
  ```

## Bước 1 — Tạo thư mục project mới

- [x] `mkdir -p /opt/taycamhanoi-wp`

## Bước 2 — Tạo volume mới + copy data wp-content

- [x] `docker volume create taycamhanoi_wp_content`
- [x] Copy data:
  ```bash
  docker run --rm \
    -v wordpress-multisite-deploy_wp_woo_content:/from \
    -v taycamhanoi_wp_content:/to \
    alpine sh -c "cd /from && cp -a . /to"
  ```

## Bước 3 — Tạo DB + container riêng, import data cũ

File mẫu trong repo: [`wordpress/deploy/docker-compose.yml`](deploy/docker-compose.yml), [`wordpress/deploy/example.env`](deploy/example.env)

- [x] Copy file lên VPS (qua CI/CD, `.github/workflows/deploy-wordpress.yml`)
- [x] Điền giá trị thật vào `.env` trên server
- [x] Copy `wp-hardening/`, `php-config/` vào repo + lên VPS
- [x] Network `web` (Traefik) đã có sẵn
- [x] `docker compose up -d mariadb`
- [x] Import DB cũ vào container mới

## Bước 4 — Khởi động, test song song (domain test, chưa đụng domain thật)

- [x] `docker compose up -d`
- [x] `docker compose logs -f wp_woo` — không có lỗi fatal
- [x] curl nội bộ `-H "Host: taycamhanoi.revonexus.net"` trả 200
- [ ] Đổi tạm `SHOP_DOMAIN` sang domain test, kiểm tra Traefik route tới đúng container mới
- [ ] Login WP Admin được, data (sản phẩm/bài viết/ACF) còn nguyên

Note: Image `wordpress` có `VOLUME /var/www/html` khai trong Dockerfile gốc → Docker tự tạo 1 anonymous volume đè lên toàn bộ webroot, và **được giữ nguyên qua mỗi lần recreate container** kể cả khi đổi tag image → core WP bị kẹt ở version cũ (6.6.2) dù image mới (7.1.4) đã pull về. Phải xoá volume ẩn đó (`docker volume rm <hash>` sau khi stop/rm container) để core được refresh theo đúng image. CI/CD đã thêm `docker compose pull` + `up -d --renew-anon-volumes` để tránh lặp lại vấn đề này ở các lần deploy sau.

Cũng phát hiện: WooCommerce bản cài (11.2.2) yêu cầu WP ≥ 6.7 (`register_block_template()`). Tag `wordpress:php8.2-apache` thực chất vẫn bundle core cũ (6.6.2, không phải lúc nào cũng mới nhất) → đã đổi sang `wordpress:latest` trong `docker-compose.yml`.

## Bước 5 — Cutover domain thật

- [ ] Đổi `SHOP_DOMAIN` trong `.env` project mới về domain thật
- [ ] `docker compose up -d`
- [ ] Tắt service cũ: `cd /opt/wordpress-multisite-deploy && docker compose stop wp_woo`
- [ ] Kiểm tra domain thật trỏ đúng project mới, không lỗi 502/504

Note:

## Bước 6 — Dọn dẹp (sau vài ngày chạy ổn, không vội)

- [ ] `docker compose rm wp_woo` (ở project cũ)
- [ ] Xoá volume cũ (chỉ khi chắc chắn không cần): `docker volume rm wordpress-multisite-deploy_wp_woo_content`

Note:
