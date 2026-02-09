<?php get_header(); ?>

<main class="flex-1 bg-white min-h-screen py-20">
    <div class="container mx-auto px-4">

        <?php if (have_posts()):
            while (have_posts()):
                the_post(); ?>
                <article class="max-w-3xl mx-auto">

                    <!-- Breadcrumb -->
                    <nav class="text-sm text-slate-500 mb-8">
                        <a href="<?php echo home_url(); ?>" class="hover:text-primary">TOP</a>
                        <span class="mx-2">/</span>
                        <a href="<?php echo home_url('/blog'); ?>" class="hover:text-primary">ブログ</a>
                        <span class="mx-2">/</span>
                        <span class="text-slate-800">
                            <?php the_title(); ?>
                        </span>
                    </nav>

                    <!-- Article Header -->
                    <header class="mb-10 text-center">
                        <div class="text-sm font-medium text-primary mb-4 block">
                            <?php echo get_the_date('Y.m.d'); ?>
                            <?php
                            $categories = get_the_category();
                            if (!empty($categories)) {
                                echo '<span class="mx-2 text-slate-300">|</span>';
                                echo '<span class="text-slate-600">' . esc_html($categories[0]->name) . '</span>';
                            }
                            ?>
                        </div>
                        <h1 class="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
                            <?php the_title(); ?>
                        </h1>
                        <?php if (has_post_thumbnail()): ?>
                            <div class="rounded-xl overflow-hidden shadow-lg mb-8">
                                <?php the_post_thumbnail('large', array('class' => 'w-full h-auto object-cover')); ?>
                            </div>
                        <?php endif; ?>
                    </header>

                    <!-- Article Content - Typography Plugin Active -->
                    <div class="prose prose-lg prose-slate max-w-none">
                        <?php the_content(); ?>
                    </div>

                    <!-- Share / Tags Area could go here -->
                    <div class="mt-16 pt-8 border-t border-slate-100">
                        <a href="<?php echo home_url('/blog'); ?>"
                            class="inline-flex items-center text-primary font-medium hover:underline">
                            <i data-lucide="arrow-left" class="w-4 h-4 mr-2"></i>
                            記事一覧に戻る
                        </a>
                    </div>

                </article>
            <?php endwhile; endif; ?>

    </div>
</main>

<?php get_footer(); ?>