<?php get_header(); ?>

<main class="flex-1 bg-slate-50 min-h-screen py-20">
    <div class="container mx-auto px-4">

        <header class="max-w-3xl mx-auto text-center mb-16">
            <h1 class="text-3xl font-bold text-slate-900 mb-4">WINQER ブログ</h1>
            <p class="text-slate-600">
                店舗集客、インスタグラム運用、MEO対策に関する最新情報をお届けします。
            </p>
        </header>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <?php if (have_posts()):
                while (have_posts()):
                    the_post(); ?>

                    <a href="<?php the_permalink(); ?>"
                        class="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div class="relative aspect-video bg-slate-200 overflow-hidden">
                            <?php if (has_post_thumbnail()): ?>
                                <?php the_post_thumbnail('medium', array('class' => 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500')); ?>
                            <?php else: ?>
                                <div class="w-full h-full flex items-center justify-center text-slate-400">
                                    <i data-lucide="image" class="w-12 h-12 opacity-20"></i>
                                </div>
                            <?php endif; ?>
                        </div>

                        <div class="p-6 flex flex-col flex-1">
                            <div class="flex items-center gap-3 text-xs text-slate-500 mb-3">
                                <span class="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                                    <?php
                                    $cats = get_the_category();
                                    echo $cats ? $cats[0]->name : 'お知らせ';
                                    ?>
                                </span>
                                <time>
                                    <?php echo get_the_date('Y.m.d'); ?>
                                </time>
                            </div>
                            <h2
                                class="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                <?php the_title(); ?>
                            </h2>
                            <p class="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">
                                <?php echo get_the_excerpt(); ?>
                            </p>
                            <div class="text-primary text-sm font-medium flex items-center">
                                記事を読む <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>
                            </div>
                        </div>
                    </a>

                <?php endwhile; else: ?>
                <div class="col-span-full text-center py-20">
                    <p class="text-slate-500">記事がまだありません。</p>
                </div>
            <?php endif; ?>
        </div>

        <!-- Pagination -->
        <div class="mt-16 flex justify-center">
            <?php
            the_posts_pagination(array(
                'mid_size' => 2,
                'prev_text' => '<i data-lucide="chevron-left" class="w-4 h-4"></i>',
                'next_text' => '<i data-lucide="chevron-right" class="w-4 h-4"></i>',
                'screen_reader_text' => ' '
            ));
            ?>
        </div>

    </div>
</main>

<style>
    /* Styling for standard WP pagination output */
    .pagination .nav-links {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .pagination .page-numbers {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 0.5rem;
        background: white;
        color: #64748b;
        font-weight: 500;
        transition: all 0.2s;
    }

    .pagination .page-numbers.current,
    .pagination .page-numbers:hover {
        background: #5DA9FF;
        color: white;
    }

    .pagination .page-numbers.dots {
        background: transparent;
        color: #94a3b8;
    }
</style>

<?php get_footer(); ?>