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
