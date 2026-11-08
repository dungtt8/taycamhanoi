<?php
/**
 * Plugin Name: Security Hardening (mu-plugin)
 * Description: Vá các điểm hở mặc định của WordPress hay bị quét/khai thác
 *              tự động. Đặt ở mu-plugins nên LUÔN active, không thể tắt
 *              nhầm qua màn hình Plugins.
 */

// 1. Tắt XML-RPC — vector phổ biến nhất cho brute-force (system.multicall)
//    và DDoS pingback amplification. Nếu bạn cần XML-RPC cho app di động/
//    Jetpack cụ thể, thay vì bật lại toàn bộ, chỉ nên whitelist qua Traefik.
add_filter('xmlrpc_enabled', '__return_false');
remove_action('wp_head', 'rsd_link');
remove_action('wp_head', 'wlwmanifest_link');

// 2. Chặn user enumeration qua REST API (/wp-json/wp/v2/users) và qua
//    ?author=1 — kẻ tấn công dò username hợp lệ trước khi brute-force.
add_filter('rest_endpoints', function ($endpoints) {
    if (isset($endpoints['/wp/v2/users'])) {
        unset($endpoints['/wp/v2/users']);
    }
    if (isset($endpoints['/wp/v2/users/(?P<id>[\d]+)'])) {
        unset($endpoints['/wp/v2/users/(?P<id>[\d]+)']);
    }
    return $endpoints;
});
add_action('init', function () {
    if (!is_admin() && isset($_GET['author'])) {
        wp_die('Forbidden', 403);
    }
});

// 3. Ẩn số phiên bản WordPress khỏi HTML/RSS/scripts (giảm thông tin cho
//    kẻ tấn công tìm CVE theo version cụ thể)
remove_action('wp_head', 'wp_generator');
add_filter('the_generator', '__return_empty_string');
add_filter('style_loader_src', function ($src) {
    return remove_query_arg('ver', $src);
});
add_filter('script_loader_src', function ($src) {
    return remove_query_arg('ver', $src);
});

// 4. Vô hiệu hoá login error message tiết lộ "sai username" hay "sai password"
add_filter('login_errors', function () {
    return 'Sai tên đăng nhập hoặc mật khẩu.';
});

// 5. Ẩn REST API discovery cho user chưa đăng nhập không cần route nhạy cảm
//    (giữ lại route cần cho WooCommerce/WPGraphQL, chỉ chặn ở bước 2)
