<?php
/**
 * Auto42 Core Sync (Stable Version)
 */

if (!defined('ABSPATH')) exit;

/**
 * FEATURED IMAGE
 */
function auto42_get_featured_image($post_id) {
    $thumb_id = get_post_thumbnail_id($post_id);
    if (!$thumb_id) return null;
    return wp_get_attachment_url($thumb_id);
}

/**
 * GALLERY (Motors + fallback safe mode)
 * (:contentReference[oaicite:0]{index=0})
 */
function auto42_get_gallery_images($post_id) {

    $images = [];

    // Method 1: Motors meta gallery
    $gallery = get_post_meta($post_id, 'gallery', true);

    if (!empty($gallery)) {
        $ids = explode(',', $gallery);

        foreach ($ids as $id) {
            $url = wp_get_attachment_url($id);
            if ($url) $images[] = $url;
        }
    }

    // Method 2: fallback to all attached media
    if (empty($images)) {
        $attachments = get_attached_media('image', $post_id);

        foreach ($attachments as $img) {
            $images[] = wp_get_attachment_url($img->ID);
        }
    }

    return array_values(array_unique($images));
}

/**
 * BUILD PAYLOAD
 */
function auto42_build_payload($post_id, $post) {

    return [
        'event' => 'upsert',
        'id' => $post_id,
        'title' => $post->post_title,
        'status' => $post->post_status,

        // VEHICLE DATA
        'price' => get_post_meta($post_id, 'stm_car_price', true),
        'mileage' => get_post_meta($post_id, 'stm_car_mileage', true),
        'year' => get_post_meta($post_id, 'stm_car_year', true),
        'make' => get_post_meta($post_id, 'stm_car_make', true),
        'model' => get_post_meta($post_id, 'stm_car_model', true),

        // MEDIA
        'featured_image' => auto42_get_featured_image($post_id),
        'gallery' => auto42_get_gallery_images($post_id)
    ];
}

/**
 * WEBHOOK TRIGGER
 */
function auto42_sync_trigger($post_id, $post) {

    if ($post->post_type !== 'listings') return;
    if (wp_is_post_autosave($post_id)) return;
    if (wp_is_post_revision($post_id)) return;

    $payload = auto42_build_payload($post_id, $post);

    wp_remote_post('https://auto42-sync-server.onrender.com/webhook', [
        'method' => 'POST',
        'headers' => [
            'Content-Type' => 'application/json'
        ],
        'body' => json_encode($payload),
        'timeout' => 10
    ]);
}

add_action('save_post', 'auto42_sync_trigger', 10, 2);

/**
 * DELETE SYNC
 */
function auto42_delete_sync($post_id) {

    $post = get_post($post_id);
    if (!$post || $post->post_type !== 'listings') return;

    wp_remote_post('https://auto42-sync-server.onrender.com/webhook', [
        'method' => 'POST',
        'headers' => [
            'Content-Type' => 'application/json'
        ],
        'body' => json_encode([
            'event' => 'delete',
            'id' => $post_id
        ]),
        'timeout' => 10
    ]);
}

add_action('before_delete_post', 'auto42_delete_sync');
