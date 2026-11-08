<?php
// Lưu/đọc field group definitions dưới dạng file JSON thay vì chỉ trong DB,
// để cấu trúc field (data structure) đi theo code/git.
add_filter('acf/settings/save_json', function () {
    return WP_CONTENT_DIR . '/acf-json';
});

add_filter('acf/settings/load_json', function ($paths) {
    unset($paths[0]);
    $paths[] = WP_CONTENT_DIR . '/acf-json';
    return $paths;
});

// Tạo page "Cài đặt trang chủ" nếu chưa có, để field group ACF gắn vào đây
// (ACF free không hỗ trợ Options Page, nên dùng 1 Page cố định làm nơi lưu).
add_action('init', function () {
    $slug = 'cai-dat-trang-chu';
    if (get_page_by_path($slug)) {
        return;
    }
    wp_insert_post([
        'post_title'   => 'Cài đặt trang chủ',
        'post_name'    => $slug,
        'post_type'    => 'page',
        'post_status'  => 'publish',
        'post_content' => '',
    ]);
});
