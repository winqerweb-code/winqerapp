<?php get_header(); ?>

<main class="flex-1">
    <!-- Hero Section -->
    <section class="py-20 md:py-32 bg-gradient-to-b from-white to-slate-50">
        <div class="container mx-auto px-4 text-center">
            <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
                事業の「強み」を最大化。<br class="hidden md:block" />
                SWOT分析から、最適な投稿を自動生成。
            </h1>
            <p class="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                WINQER（ウィンカー）は、GoogleビジネスプロフィールのデータをAIが分析。
                事業ごとの強み（Strengths）を活かしたInstagram投稿を自動で作成します。
            </p>
            <div class="flex justify-center gap-4">
                <a href="https://app.sumatoko.com/login"
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-8 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-none text-white">
                    無料で分析を始める
                </a>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 bg-white">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center text-slate-900 mb-12">選ばれる理由</h2>
            <div class="grid md:grid-cols-3 gap-8">
                <!-- Card 1 -->
                <div class="rounded-lg border-none shadow-lg bg-card text-card-foreground bg-white"
                    style="color: inherit;">
                    <div class="flex flex-col space-y-1.5 p-6">
                        <div class="h-10 w-10 text-blue-600 mb-4">
                            <i data-lucide="search" class="w-10 h-10"></i>
                        </div>
                        <h3 class="text-2xl font-semibold leading-none tracking-tight">Google連携でデータ取得</h3>
                    </div>
                    <div class="p-6 pt-0">
                        <p class="text-slate-600">
                            Googleビジネスプロフィールと連携し、最新のクチコミやインサイトデータを自動取得。
                            手入力の手間なく、正確な現状把握が可能です。
                        </p>
                    </div>
                </div>

                <!-- Card 2 -->
                <div class="rounded-lg border-none shadow-lg bg-card text-card-foreground bg-white"
                    style="color: inherit;">
                    <div class="flex flex-col space-y-1.5 p-6">
                        <div class="h-10 w-10 text-purple-600 mb-4">
                            <i data-lucide="brain" class="w-10 h-10"></i>
                        </div>
                        <h3 class="text-2xl font-semibold leading-none tracking-tight">AIによるSWOT分析</h3>
                    </div>
                    <div class="p-6 pt-0">
                        <p class="text-slate-600">
                            取得したデータをAIが解析し、事業の[強み・弱み・機会・脅威]を明確化。
                            客観的な視点で、独自の強みを洗い出します。
                        </p>
                    </div>
                </div>

                <!-- Card 3 -->
                <div class="rounded-lg border-none shadow-lg bg-card text-card-foreground bg-white"
                    style="color: inherit;">
                    <div class="flex flex-col space-y-1.5 p-6">
                        <div class="h-10 w-10 text-pink-600 mb-4">
                            <i data-lucide="instagram" class="w-10 h-10"></i>
                        </div>
                        <h3 class="text-2xl font-semibold leading-none tracking-tight">Instagram投稿を自動生成</h3>
                    </div>
                    <div class="p-6 pt-0">
                        <p class="text-slate-600">
                            SWOT分析結果に基づき、ターゲット層に最も響く投稿文案とテーマをAIが提案。
                            集客効果の高いSNS運用を実現します。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Google Integration Section -->
    <section id="google" class="py-20 bg-slate-50 border-y">
        <div class="container mx-auto px-4">
            <div class="max-w-3xl mx-auto">
                <div class="flex items-center gap-4 mb-8 justify-center">
                    <div class="bg-white p-4 rounded-full shadow-sm">
                        <svg class="h-8 w-8" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4" />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853" />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05" />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335" />
                        </svg>
                    </div>
                    <h2 class="text-3xl font-bold text-slate-900">Googleサービスとのデータ連携</h2>
                </div>

                <div class="bg-white p-8 rounded-xl shadow-sm space-y-6">
                    <p class="text-lg text-slate-700 leading-relaxed">
                        WINQERは、Googleアカウント連携を通じて、精度の高い分析を実現します。
                    </p>
                    <ul class="space-y-4">
                        <li class="flex items-start gap-3">
                            <div class="mt-1 h-6 w-6 text-green-500">
                                <i data-lucide="check-circle-2" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-900">情報の自動取得</h4>
                                <p class="text-sm text-slate-600">
                                    Googleビジネスプロフィールから、事業の基本情報、クチコミ、インサイトデータを読み取ります。</p>
                            </div>
                        </li>
                        <li class="flex items-start gap-3">
                            <div class="mt-1 h-6 w-6 text-green-500">
                                <i data-lucide="check-circle-2" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-900">SWOT分析への活用</h4>
                                <p class="text-sm text-slate-600">
                                    取得した生の顧客データ（クチコミ等）をAIが解析し、より実践的なSWOT分析を行います。</p>
                            </div>
                        </li>
                    </ul>
                    <div class="pt-4 border-t text-sm text-slate-500">
                        ※ 取得したデータは分析および投稿案作成の目的のみに使用されます。第三者に無断で提供することはありません。
                    </div>
                </div>
            </div>
        </div>
    </section>
</main>

<?php get_footer(); ?>