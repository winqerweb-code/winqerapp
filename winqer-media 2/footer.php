<!-- Footer -->
<footer class="bg-slate-900 text-slate-300 py-12">
    <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-4 gap-8 mb-8">
            <div class="col-span-2">
                <div class="flex items-center gap-2 mb-4">
                    <div class="relative h-6 w-6">
                        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/logo.png" alt="WINQER Logo"
                            class="h-6 w-6 object-contain brightness-0 invert" />
                    </div>
                    <span class="font-bold text-white text-lg">WINQER</span>
                </div>
                <p class="text-sm text-slate-400 max-w-sm">
                    SWOT分析 × Instagram生成AI<br />
                    事業の集客を科学するプラットフォーム
                </p>
            </div>
            <div>
                <h4 class="text-white font-bold mb-4">メニュー</h4>
                <ul class="space-y-2 text-sm">
                    <li><a href="<?php echo home_url('/#features'); ?>" class="hover:text-white">機能の特徴</a></li>
                    <li><a href="<?php echo home_url('/blog'); ?>" class="hover:text-white">ブログ</a></li>
                    <li><a href="https://app.sumatoko.com/login" class="hover:text-white">ログイン</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-white font-bold mb-4">法的情報</h4>
                <ul class="space-y-2 text-sm">
                    <li><a href="/privacy" class="hover:text-white">プライバシーポリシー</a></li>
                    <li><a href="/terms" class="hover:text-white">利用規約</a></li>
                </ul>
            </div>
        </div>
        <div class="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            &copy;
            <?php echo date('Y'); ?> WINQER. All rights reserved.
        </div>
    </div>
</footer>
</div>

<script>
    lucide.createIcons();
</script>

<?php wp_footer(); ?>
</body>

</html>