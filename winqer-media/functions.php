<?php
// WINQER Media Theme Functions

// Add title tag support
add_theme_support('title-tag');

// Enable Featured Images
add_theme_support('post-thumbnails');

// Add Navigation Menus (Header/Footer)
function register_my_menus()
{
    register_nav_menus(
        array(
            'header-menu' => __('Header Menu'),
            'footer-menu' => __('Footer Menu')
        )
    );
}
add_action('init', 'register_my_menus');

// Custom Read More
function new_excerpt_more($more)
{
    return '...';
}
add_filter('excerpt_more', 'new_excerpt_more');
