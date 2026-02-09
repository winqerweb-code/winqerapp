<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Tailwind CSS (CDN for standalone portability) -->
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
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
        <!-- Header -->
        <header class="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
            <div class="container mx-auto px-4 h-16 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <a href="<?php echo home_url(); ?>" class="flex items-center gap-2">
                        <div class="relative h-8 w-8">
                            <img src="<?php echo get_template_directory_uri(); ?>/assets/images/logo.png"
                                alt="WINQER Logo" class="h-full w-full object-contain" />
                        </div>
                        <span class="font-bold text-xl text-slate-900">WINQER</span>
                    </a>
                </div>
                <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                    <a href="<?php echo home_url('/#features'); ?>" class="hover:text-slate-900">機能</a>
                    <a href="<?php echo home_url('/#google'); ?>" class="hover:text-slate-900">データ活用</a>
                    <a href="<?php echo home_url('/blog'); ?>" class="hover:text-slate-900">ブログ</a>
                </nav>
                <div class="flex items-center gap-4">
                    <a href="https://app.sumatoko.com/login"
                        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
                        ログイン / 登録
                    </a>
                </div>
            </div>
        </header>