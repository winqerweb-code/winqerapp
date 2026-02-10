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
                    <div class="relative h-8 w-8">
                        <img src="<?php echo get_template_directory_uri(); ?>/images/logo.png" alt="WINQER"
                            class="object-contain h-8 w-8" />
                    </div>
                    <span class="text-xl font-bold tracking-tight">WINQER</span>
                </div>
                <div class="flex items-center gap-4">
                    <a href="https://app.sumatoko.com/" class="text-sm font-medium hover:underline underline-offset-4">
                        ログイン
                    </a>
                    <a href="https://app.sumatoko.com/"
                        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-black text-white hover:bg-gray-800">
                        無料で始める
                    </a>
                </div>
            </div>
        </header>

        <main class="flex-1">
            <!-- Hero Section -->
            <section class="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-16">
                <div class="container mx-auto px-4 md:px-6">
                    <div class="flex flex-col items-center space-y-4 text-center">
                        <div
                            class="rounded-full border bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground bg-gray-100 text-gray-900 border-gray-200">
                            ✨ ビジネスの強みを自動分析 × インスタ投稿生成
                        </div>
                        <h1
                            class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 pb-2">
                            AIが「SWOT分析」から<br class="md:hidden" />
                            最適なInstagram投稿を作成。
                        </h1>
                        <p class="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                            もう、投稿内容に悩む必要はありません。<br />
                            あなたのビジネスの強み（Strengths）や機会（Opportunities）をAIが自動抽出し、<br class="hidden md:inline" />
                            集客につながる魅力的な文章を一瞬で生成します。
                        </p>
                        <div class="space-x-4 pt-4 flex justify-center">
                            <a href="https://app.sumatoko.com/"
                                class="inline-flex items-center justify-center rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-0 text-white">
                                無料で投稿を作ってみる <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" class="ml-2 h-4 w-4">
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </a>
                            <button
                                class="inline-flex items-center justify-center rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-12 px-8 border-gray-200 bg-white hover:bg-gray-50 text-gray-900">
                                使い方の動画を見る
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Abstract Background Elements -->
                <div class="absolute top-0 left-0 -z-10 h-full w-full overflow-hidden opacity-20 pointer-events-none">
                    <div
                        class="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-pink-200 blur-[100px]">
                    </div>
                    <div
                        class="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-200 blur-[100px]">
                    </div>
                </div>
            </section>

            <!-- Video Section -->
            <section class="py-16 bg-slate-50 relative">
                <div class="container mx-auto px-4 md:px-6">
                    <div class="mx-auto max-w-4xl">
                        <div
                            class="aspect-video overflow-hidden rounded-xl border bg-white shadow-xl relative group cursor-pointer border-gray-200">
                            <div
                                class="absolute inset-0 flex items-center justify-center bg-slate-900/5 transition-colors group-hover:bg-slate-900/10">
                                <div
                                    class="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="currentColor" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round"
                                        class="h-8 w-8 text-pink-600 ml-1">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                </div>
                            </div>
                            <div
                                class="absolute bottom-4 left-4 right-4 text-center text-sm text-gray-500 bg-white/80 backdrop-blur-sm p-2 rounded">
                                SWOT分析から投稿生成までの流れ（デモ動画）
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Features Section -->
            <section class="py-24">
                <div class="container mx-auto px-4 md:px-6">
                    <div class="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                        <div class="inline-block rounded-lg bg-pink-100 text-pink-700 px-3 py-1 text-sm">
                            WINQERだけの機能
                        </div>
                        <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                            分析と発信を、これひとつで。
                        </h2>
                        <p
                            class="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            感覚に頼った運用はもう終わり。データと戦略に基づいたSNS運用を、誰でも簡単に。
                        </p>
                    </div>
                    <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <!-- Feature 1 -->
                        <div
                            class="rounded-xl border bg-card text-card-foreground shadow-sm border-none shadow-none bg-slate-50/50 hover:bg-slate-100 transition-colors">
                            <div class="p-6 flex flex-col items-center text-center space-y-4">
                                <div class="p-3 rounded-full bg-white shadow-sm text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" class="h-8 w-8">
                                        <circle cx="12" cy="12" r="10" />
                                        <circle cx="12" cy="12" r="6" />
                                        <circle cx="12" cy="12" r="2" />
                                    </svg>
                                </div>
                                <h3 class="text-xl font-bold">高度なSWOT分析</h3>
                                <p class="text-sm text-gray-500 leading-relaxed">
                                    あなたのビジネスや競合情報をAIが分析。「強み・弱み・機会・脅威」を明確化し、戦略の土台を作ります。
                                </p>
                            </div>
                        </div>
                        <!-- Feature 2 -->
                        <div
                            class="rounded-xl border bg-card text-card-foreground shadow-sm border-none shadow-none bg-slate-50/50 hover:bg-slate-100 transition-colors">
                            <div class="p-6 flex flex-col items-center text-center space-y-4">
                                <div class="p-3 rounded-full bg-white shadow-sm text-purple-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" class="h-8 w-8">
                                        <path
                                            d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
                                        <path
                                            d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
                                        <path d="M15 13a4.5 4.5 0 0 1-3-1.4 4.5 4.5 0 0 1-3 1.4" />
                                        <circle cx="15" cy="13" r=".5" />
                                        <circle cx="9" cy="13" r=".5" />
                                    </svg>
                                </div>
                                <h3 class="text-xl font-bold">戦略に基づく投稿生成</h3>
                                <p class="text-sm text-gray-500 leading-relaxed">
                                    ただの文章生成ではありません。分析した「強み」を最大限に活かし、ターゲットに刺さるInstagram投稿を自動作成。
                                </p>
                            </div>
                        </div>
                        <!-- Feature 3 -->
                        <div
                            class="rounded-xl border bg-card text-card-foreground shadow-sm border-none shadow-none bg-slate-50/50 hover:bg-slate-100 transition-colors">
                            <div class="p-6 flex flex-col items-center text-center space-y-4">
                                <div class="p-3 rounded-full bg-white shadow-sm text-yellow-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" class="h-8 w-8">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                    </svg>
                                </div>
                                <h3 class="text-xl font-bold">投稿作成時間をゼロに</h3>
                                <p class="text-sm text-gray-500 leading-relaxed">
                                    「何を書けばいいかわからない」悩みから解放されます。あなたは生成された案を選んで投稿するだけ。
                                </p>
                            </div>
                        </div>
                        <!-- Feature 4 -->
                        <div
                            class="rounded-xl border bg-card text-card-foreground shadow-sm border-none shadow-none bg-slate-50/50 hover:bg-slate-100 transition-colors">
                            <div class="p-6 flex flex-col items-center text-center space-y-4">
                                <div class="p-3 rounded-full bg-white shadow-sm text-pink-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" class="h-8 w-8">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="m9 12 2 2 4-4" />
                                    </svg>
                                </div>
                                <h3 class="text-xl font-bold">一貫性のあるブランディング</h3>
                                <p class="text-sm text-gray-500 leading-relaxed">
                                    AIがあなたのブランドのトーン＆マナーを学習。担当者が変わっても、常に一貫したクオリティの発信が可能です。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- FAQ Section -->
            <section class="py-24 bg-slate-50">
                <div class="container mx-auto px-4 md:px-6 max-w-4xl">
                    <div class="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                        <h2 class="text-3xl font-bold tracking-tighter">
                            よくあるご質問
                        </h2>
                    </div>
                    <div class="space-y-4">
                        <!-- FAQ Item 1 -->
                        <div class="border rounded-lg bg-white border-gray-200">
                            <details class="group">
                                <summary
                                    class="flex w-full items-center justify-between p-4 font-medium transition-all hover:bg-slate-50 cursor-pointer list-none">
                                    <span class="text-left">SWOT分析とは何ですか？</span>
                                    <span class="ml-4 flex-shrink-0 transition transform group-open:rotate-180">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </span>
                                </summary>
                                <div class="px-4 pb-4 pt-0 text-sm text-gray-500 border-t border-gray-100">
                                    <div class="pt-2">
                                        Strength（強み）、Weakness（弱み）、Opportunity（機会）、Threat（脅威）の頭文字をとったフレームワークです。WINQERはこれをAIで自動化し、戦略的な投稿作成に活用します。
                                    </div>
                                </div>
                            </details>
                        </div>
                        <!-- FAQ Item 2 -->
                        <div class="border rounded-lg bg-white border-gray-200">
                            <details class="group">
                                <summary
                                    class="flex w-full items-center justify-between p-4 font-medium transition-all hover:bg-slate-50 cursor-pointer list-none">
                                    <span class="text-left">Instagram以外にも使えますか？</span>
                                    <span class="ml-4 flex-shrink-0 transition transform group-open:rotate-180">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </span>
                                </summary>
                                <div class="px-4 pb-4 pt-0 text-sm text-gray-500 border-t border-gray-100">
                                    <div class="pt-2">
                                        現在はInstagramに特化した文章構成（ハッシュタグ含む）を生成しますが、文章自体はブログやFacebookなど他の媒体にも転用可能です。</div>
                                </div>
                            </details>
                        </div>
                        <!-- FAQ Item 3 -->
                        <div class="border rounded-lg bg-white border-gray-200">
                            <details class="group">
                                <summary
                                    class="flex w-full items-center justify-between p-4 font-medium transition-all hover:bg-slate-50 cursor-pointer list-none">
                                    <span class="text-left">生成された文章は修正できますか？</span>
                                    <span class="ml-4 flex-shrink-0 transition transform group-open:rotate-180">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </span>
                                </summary>
                                <div class="px-4 pb-4 pt-0 text-sm text-gray-500 border-t border-gray-100">
                                    <div class="pt-2">はい、もちろんです。AIが提案したドラフトを自由に編集・調整してから投稿することができます。</div>
                                </div>
                            </details>
                        </div>
                        <!-- FAQ Item 4 -->
                        <div class="border rounded-lg bg-white border-gray-200">
                            <details class="group">
                                <summary
                                    class="flex w-full items-center justify-between p-4 font-medium transition-all hover:bg-slate-50 cursor-pointer list-none">
                                    <span class="text-left">どのような業種に対応していますか？</span>
                                    <span class="ml-4 flex-shrink-0 transition transform group-open:rotate-180">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </span>
                                </summary>
                                <div class="px-4 pb-4 pt-0 text-sm text-gray-500 border-t border-gray-100">
                                    <div class="pt-2">飲食店、美容室、小売店などの実店舗はもちろん、ECサイト、オンラインサービス、お教室など、あらゆる中小規模ビジネスに対応しています。
                                    </div>
                                </div>
                            </details>
                        </div>
                        <!-- FAQ Item 5 -->
                        <div class="border rounded-lg bg-white border-gray-200">
                            <details class="group">
                                <summary
                                    class="flex w-full items-center justify-between p-4 font-medium transition-all hover:bg-slate-50 cursor-pointer list-none">
                                    <span class="text-left">専門的なマーケティング知識は必要ですか？</span>
                                    <span class="ml-4 flex-shrink-0 transition transform group-open:rotate-180">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </span>
                                </summary>
                                <div class="px-4 pb-4 pt-0 text-sm text-gray-500 border-t border-gray-100">
                                    <div class="pt-2">いいえ、必要ありません。難しい分析や戦略立案はAIが行いますので、専門知識がなくても効果的な運用が可能です。</div>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CTA Section -->
            <section class="py-24 bg-gray-900 text-white">
                <div class="container mx-auto px-4 md:px-6 text-center">
                    <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl mb-6">
                        あなたのビジネスを、もっと自由に。
                    </h2>
                    <p class="mx-auto max-w-[600px] text-gray-300 md:text-xl mb-10">
                        まずは無料のアカウント作成から。<br />
                        WINQERがビジネスの可能性を広げます。
                    </p>
                    <a href="https://winqer.com/login"
                        class="inline-flex items-center justify-center rounded-md text-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-secondary text-secondary-foreground hover:bg-secondary/80 h-14 px-8 bg-white text-gray-900 hover:bg-gray-100">
                        無料でアカウント作成
                    </a>
                </div>
            </section>
        </main>

        <!-- Footer -->
        <footer class="border-t py-12 bg-white border-gray-200">
            <div class="container mx-auto px-4 md:px-6">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div class="col-span-2 md:col-span-1">
                        <div class="flex items-center gap-2 mb-4">
                            <div class="relative h-6 w-6">
                                <img src="<?php echo get_template_directory_uri(); ?>/images/logo.png" alt="WINQER"
                                    class="object-contain h-6 w-6" />
                            </div>
                            <span class="text-lg font-bold">WINQER</span>
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
                            <li><a href="/terms" class="hover:text-gray-900">利用規約</a></li>
                            <li><a href="/privacy" class="hover:text-gray-900">プライバシーポリシー</a></li>
                            <li><a href="#" class="hover:text-gray-900">特定商取引法に基づく表記</a></li>
                        </ul>
                    </div>
                </div>
                <div class="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                    ©
                    <?php echo date("Y"); ?> WINQER Inc. All rights reserved.
                </div>
            </div>
        </footer>
    </div>

    <?php wp_footer(); ?>
</body>

</html>