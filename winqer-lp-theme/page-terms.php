<?php
/*
Template Name: Terms of Service
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
            <h1 class="text-3xl font-bold mb-6">利用規約</h1>
            <p class="mb-8 text-sm text-gray-500">最終更新日: 2024年2月10日</p>

            <div class="space-y-8 text-gray-700 leading-relaxed">
                <section>
                    <h2 class="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">1. 総則</h2>
                    <p>本規約は、スマトコ（以下「本サービス」）の利用条件を定めるものです。本サービスを利用する全てのユーザーは、本規約に同意したものとみなされます。</p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">2. アカウント登録</h2>
                    <p>本サービスの利用にはアカウント登録が必要です。ユーザーは正確な情報を提供し、パスワード等の管理責任を負うものとします。</p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">3. 禁止事項</h2>
                    <p>以下の行為を禁止します。</p>
                    <ul class="list-disc pl-6 mt-2 space-y-2">
                        <li>法令または公序良俗に反する行為</li>
                        <li>犯罪行為に関連する行為</li>
                        <li>本サービスのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                        <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                        <li>他のユーザーに成りすます行為</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">4. 本サービスの提供の停止等</h2>
                    <p>運営者は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。</p>
                    <ul class="list-disc pl-6 mt-2 space-y-2">
                        <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                        <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                        <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">5. 免責事項</h2>
                    <p>運営者は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
                    </p>
                    <p class="mt-2">
                        運営者は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。ただし、本サービスに関する運営者とユーザーとの間の契約（本規約を含みます。）が消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。
                    </p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">6. サービス内容の変更等</h2>
                    <p>運営者は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。</p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">7. 利用規約の変更</h2>
                    <p>運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。
                    </p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">8. 準拠法・裁判管轄</h2>
                    <p>本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、運営者の本店所在地を管轄する裁判所を専属的合意管轄とします。</p>
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