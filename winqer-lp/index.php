<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WINQER</title>

    <!-- Tailwind CSS (CDN for standalone portability) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                container: {
                    center: true,
                    padding: "2rem",
                    screens: {
                        "2xl": "1400px",
                    },
                },
                extend: {
                    colors: {
                        border: "rgba(255, 255, 255, 0.10)",
                        input: "rgba(255, 255, 255, 0.10)",
                        ring: "rgba(93, 169, 255, 0.5)",
                        background: "#14181F",
                        foreground: "#E2E6EB",
                        primary: {
                            DEFAULT: "#5DA9FF",
                            foreground: "#FFFFFF",
                        },
                        secondary: {
                            DEFAULT: "rgba(255, 255, 255, 0.10)",
                            foreground: "#E2E6EB",
                        },
                        destructive: {
                            DEFAULT: "#FF453A",
                            foreground: "#FFFFFF",
                        },
                        muted: {
                            DEFAULT: "#1A1F29",
                            foreground: "#B8C0CC",
                        },
                        accent: {
                            DEFAULT: "#5DA9FF",
                            foreground: "#FFFFFF",
                        },
                        popover: {
                            DEFAULT: "#14181F",
                            foreground: "#E2E6EB",
                        },
                        card: {
                            DEFAULT: "rgba(255, 255, 255, 0.07)",
                            foreground: "#E2E6EB",
                        },
                    },
                    borderRadius: {
                        lg: "0.5rem",
                        md: "calc(0.5rem - 2px)",
                        sm: "calc(0.5rem - 4px)",
                    }
                },
            },
        }
    </script>
    <style>
        /* Custom tweaks not covered by Tailwind config */
        body {
            font-family: 'Inter', sans-serif;
        }
    </style>

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <?php wp_head(); ?>
</head>

<body <?php body_class('bg-slate-50 text-slate-900'); ?>>

    <div class="flex min-h-screen flex-col bg-slate-50">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative h-8 w-8">
                        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/logo.png" alt="WINQER Logo"
                            className="h-full w-full object-contain" />
                    </div>
                    <span className="font-bold text-xl text-slate-900">WINQER</span>
                </div>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                    <a href="#features" className="hover:text-slate-900">機能</a>
                    <a href="#google" className="hover:text-slate-900">データ活用</a>
                </nav>
                <div className="flex items-center gap-4">
                    <a href="/login"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
                        ログイン / 登録
                    </a>
                </div>
            </div>
        </header>

        <main className="flex-1">
            {/* Hero Section */}
            <section className="py-20 md:py-32 bg-gradient-to-b from-white to-slate-50">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
                        事業の「強み」を最大化。<br className="hidden md:block" />
                        SWOT分析から、最適な投稿を自動生成。
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                        WINQER（ウィンカー）は、GoogleビジネスプロフィールのデータをAIが分析。
                        事業ごとの強み（Strengths）を活かしたInstagram投稿を自動で作成します。
                    </p>
                    <div className="flex justify-center gap-4">
                        <a href="/login"
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-8 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-none text-white">
                            無料で分析を始める
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">選ばれる理由</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <!-- Card 1 -->
                        <div className="rounded-lg border-none shadow-lg bg-card text-card-foreground bg-white"
                            style="color: inherit;">
                            <div className="flex flex-col space-y-1.5 p-6">
                                <div className="h-10 w-10 text-blue-600 mb-4">
                                    <i data-lucide="search" class="w-10 h-10"></i>
                                </div>
                                <h3 className="text-2xl font-semibold leading-none tracking-tight">Google連携でデータ取得</h3>
                            </div>
                            <div className="p-6 pt-0">
                                <p className="text-slate-600">
                                    Googleビジネスプロフィールと連携し、最新のクチコミやインサイトデータを自動取得。
                                    手入力の手間なく、正確な現状把握が可能です。
                                </p>
                            </div>
                        </div>

                        <!-- Card 2 -->
                        <div className="rounded-lg border-none shadow-lg bg-card text-card-foreground bg-white"
                            style="color: inherit;">
                            <div className="flex flex-col space-y-1.5 p-6">
                                <div className="h-10 w-10 text-purple-600 mb-4">
                                    <i data-lucide="brain" class="w-10 h-10"></i>
                                </div>
                                <h3 className="text-2xl font-semibold leading-none tracking-tight">AIによるSWOT分析</h3>
                            </div>
                            <div className="p-6 pt-0">
                                <p className="text-slate-600">
                                    取得したデータをAIが解析し、事業の[強み・弱み・機会・脅威]を明確化。
                                    客観的な視点で、独自の強みを洗い出します。
                                </p>
                            </div>
                        </div>

                        <!-- Card 3 -->
                        <div className="rounded-lg border-none shadow-lg bg-card text-card-foreground bg-white"
                            style="color: inherit;">
                            <div className="flex flex-col space-y-1.5 p-6">
                                <div className="h-10 w-10 text-pink-600 mb-4">
                                    <i data-lucide="instagram" class="w-10 h-10"></i>
                                </div>
                                <h3 className="text-2xl font-semibold leading-none tracking-tight">Instagram投稿を自動生成</h3>
                            </div>
                            <div className="p-6 pt-0">
                                <p className="text-slate-600">
                                    SWOT分析結果に基づき、ターゲット層に最も響く投稿文案とテーマをAIが提案。
                                    集客効果の高いSNS運用を実現します。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Google Integration Section */}
            <section id="google" className="py-20 bg-slate-50 border-y">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-4 mb-8 justify-center">
                            <div className="bg-white p-4 rounded-full shadow-sm">
                                <svg className="h-8 w-8" viewBox="0 0 24 24">
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
                            <h2 className="text-3xl font-bold text-slate-900">Googleサービスとのデータ連携</h2>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm space-y-6">
                            <p className="text-lg text-slate-700 leading-relaxed">
                                WINQERは、Googleアカウント連携を通じて、精度の高い分析を実現します。
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 h-6 w-6 text-green-500">
                                        <i data-lucide="check-circle-2" class="w-6 h-6"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">情報の自動取得</h4>
                                        <p className="text-sm text-slate-600">
                                            Googleビジネスプロフィールから、事業の基本情報、クチコミ、インサイトデータを読み取ります。</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 h-6 w-6 text-green-500">
                                        <i data-lucide="check-circle-2" class="w-6 h-6"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">SWOT分析への活用</h4>
                                        <p className="text-sm text-slate-600">
                                            取得した生の顧客データ（クチコミ等）をAIが解析し、より実践的なSWOT分析を行います。</p>
                                    </div>
                                </li>
                            </ul>
                            <div className="pt-4 border-t text-sm text-slate-500">
                                ※ 取得したデータは分析および投稿案作成の目的のみに使用されます。第三者に無断で提供することはありません。
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-300 py-12">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="relative h-6 w-6">
                                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/logo.png"
                                    alt="WINQER Logo" className="h-6 w-6 object-contain brightness-0 invert" />
                            </div>
                            <span className="font-bold text-white text-lg">WINQER</span>
                        </div>
                        <p className="text-sm text-slate-400 max-w-sm">
                            SWOT分析 × Instagram生成AI<br />
                            事業の集客を科学するプラットフォーム
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">メニュー</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#features" className="hover:text-white">機能の特徴</a></li>
                            <li><a href="/login" className="hover:text-white">ログイン</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">法的情報</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/privacy" className="hover:text-white">プライバシーポリシー</a></li>
                            <li><a href="/terms" className="hover:text-white">利用規約</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
                    &copy; <?php echo date('Y'); ?> WINQER. All rights reserved.
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