<?php
/*
Template Name: Privacy Policy
*/
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>

    <div class="flex min-h-screen flex-col">
        <!-- Header -->
        <header
            class="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div class="container mx-auto px-4 flex h-16 items-center justify-between">
                <div class="flex items-center gap-2">
                    <a href="<?php echo home_url(); ?>" class="flex items-center gap-2">
                        <div class="relative h-8 w-8">
                            <img src="<?php echo get_template_directory_uri(); ?>/images/logo.png" alt="スマトコ"
                                class="object-contain h-8 w-8" />
                        </div>
                        <span class="text-xl font-bold tracking-tight">スマトコ</span>
                    </a>
                </div>
                <div class="flex items-center gap-4">
                    <a href="https://app.sumatoko.com/login"
                        class="text-sm font-medium hover:underline underline-offset-4">
                        ログイン
                    </a>
                    <a href="https://app.sumatoko.com/login"
                        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-black text-white hover:bg-gray-800">
                        無料で始める
                    </a>
                </div>
            </div>
        </header>

        <main class="flex-1 container mx-auto px-4 py-12 max-w-3xl">
            <h1 class="text-3xl font-bold mb-6">プライバシーポリシー</h1>
            <p class="mb-8 text-sm text-gray-500">最終更新日: 2024年2月10日</p>

            <div class="space-y-8 text-gray-700 leading-relaxed">
                <section>
                    <p>スマトコ（以下「本サービス」）は、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。</p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">1. 個人情報の収集</h2>
                    <p>本サービスでは、以下の情報を収集する場合があります。</p>
                    <ul class="list-disc pl-6 mt-2 space-y-2">
                        <li>ユーザー登録時に入力された氏名、メールアドレス等の情報</li>
                        <li>GoogleビジネスプロフィールAPIを通じて取得される店舗情報、インサイトデータ、クチコミ情報等</li>
                        <li>お問い合わせ時に入力された情報</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">2. 個人情報の利用目的</h2>
                    <p>収集した個人情報は、以下の目的で利用します。</p>
                    <ul class="list-disc pl-6 mt-2 space-y-2">
                        <li>本サービスの提供・運営のため</li>
                        <li>ユーザーへのお知らせや連絡のため</li>
                        <li>利用状況の分析およびサービス改善のため</li>
                        <li>AIによる投稿文案作成など、本サービスの機能提供のため</li>
                        <li>不正利用防止のため</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">3. 個人情報の第三者提供</h2>
                    <p>当社は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。</p>
                    <ul class="list-disc pl-6 mt-2 space-y-2">
                        <li>法令に基づく場合</li>
                        <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                        <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                        <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">4. 個人情報の管理</h2>
                    <p>当社は、個人情報の漏洩、滅失または毀損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。</p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">5. プライバシーポリシーの変更</h2>
                    <p>本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく変更することができるものとします。変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
                    </p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">6. お問い合わせ</h2>
                    <p>本ポリシーに関するお問い合わせは、運営者までご連絡ください。</p>
                </section>
            </div>

            <div class="mt-12 pt-8 border-t text-center">
                <a href="<?php echo home_url(); ?>"
                    class="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                    トップページへ戻る
                </a>
            </div>
        </main>

        <!-- Footer -->
        <footer class="border-t py-12 bg-white border-gray-200">
            <div class="container mx-auto px-4 md:px-6">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div class="col-span-2 md:col-span-1">
                        <div class="flex items-center gap-2 mb-4">
                            <div class="relative h-6 w-6">
                                <img src="<?php echo get_template_directory_uri(); ?>/images/logo.png" alt="スマトコ"
                                    class="object-contain h-6 w-6" />
                            </div>
                            <span class="text-lg font-bold">スマトコ</span>
                        </div>
                        <p class="text-sm text-gray-500 leading-relaxed">
                            中小規模ビジネスのための<br />
                            オールインワン・プラットフォーム
                        </p>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-4 text-gray-900">サービス</h3>
                        <ul class="space-y-2 text-sm text-gray-500">
                            <li><a href="#" class="hover:text-gray-900">機能一覧</a></li>
                            <li><a href="#" class="hover:text-gray-900">料金プラン</a></li>
                            <li><a href="#" class="hover:text-gray-900">導入事例</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-4 text-gray-900">サポート</h3>
                        <ul class="space-y-2 text-sm text-gray-500">
                            <li><a href="#" class="hover:text-gray-900">ヘルプセンター</a></li>
                            <li><a href="#" class="hover:text-gray-900">お問い合わせ</a></li>
                            <li><a href="#" class="hover:text-gray-900">運営会社</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-4 text-gray-900">法的情報</h3>
                        <ul class="space-y-2 text-sm text-gray-500">
                            <li><a href="<?php echo home_url('/terms'); ?>" class="hover:text-gray-900">利用規約</a></li>
                            <li><a href="<?php echo home_url('/privacy'); ?>" class="hover:text-gray-900">プライバシーポリシー</a>
                            </li>
                            <li><a href="#" class="hover:text-gray-900">特定商取引法に基づく表記</a></li>
                        </ul>
                    </div>
                </div>
                <div class="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                    ©
                    <?php echo date("Y"); ?> スマトコ Inc. All rights reserved.
                </div>
            </div>
        </footer>
    </div>

    <?php wp_footer(); ?>
</body>

</html>