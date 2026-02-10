<?php
function winqer_lp_scripts()
{
    wp_enqueue_style('winqer-style', get_stylesheet_uri());
    // Add Tailwind CDN for simplicity in this generated theme
    wp_enqueue_script('tailwind', 'https://cdn.tailwindcss.com', array(), '3.3.0', false);
}
add_action('wp_enqueue_scripts', 'winqer_lp_scripts');

function winqer_lp_setup()
{
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
}
add_action('after_setup_theme', 'winqer_lp_setup');
