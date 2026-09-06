<?php
/**
 * Plugin Name: TAYCAMHANOI - Product Custom Fields
 * Description: Adds a dedicated "Shopee" meta box to the product edit screen
 * instead of relying on the generic Custom Fields panel. The saved value is
 * plain post meta (key: shopee_link), read by the Next.js frontend via
 * WooCommerce's REST API `meta_data` field — no extra plugin needed.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('add_meta_boxes', function () {
    add_meta_box(
        'taycamhanoi_shopee_link',
        'Link Shopee',
        'taycamhanoi_render_shopee_meta_box',
        'product',
        'side',
        'default'
    );
});

function taycamhanoi_render_shopee_meta_box($post)
{
    wp_nonce_field('taycamhanoi_save_shopee_link', 'taycamhanoi_shopee_link_nonce');
    $value = get_post_meta($post->ID, 'shopee_link', true);
    ?>
    <label for="taycamhanoi_shopee_link_input" style="display:block;margin-bottom:6px;">
        Link sản phẩm trên Shopee
    </label>
    <input
        type="url"
        id="taycamhanoi_shopee_link_input"
        name="shopee_link"
        value="<?php echo esc_attr($value); ?>"
        placeholder="https://shopee.vn/..."
        style="width:100%;"
    />
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
});
