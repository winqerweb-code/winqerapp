import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Search, Instagram, CheckCircle2 } from "lucide-react"

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // Check if user is already logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <Image
                src="/images/logo.png"
                alt="WINQER Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-xl text-slate-900">WINQER</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-slate-900">機能</Link>
            <Link href="#google" className="hover:text-slate-900">データ活用</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button>ログイン / 登録</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-white to-slate-50">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
              店舗の「強み」を最大化。<br className="hidden md:block" />
              SWOT分析から、最適な投稿を自動生成。
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              WINQER（ウィンカー）は、GoogleビジネスプロフィールのデータをAIが分析。
              店舗ごとの強み（Strengths）を活かしたInstagram投稿を自動で作成します。
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-none">
                  無料で分析を始める
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">選ばれる理由</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <Search className="h-10 w-10 text-blue-600 mb-4" />
                  <CardTitle>Google連携でデータ取得</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Googleビジネスプロフィールと連携し、最新のクチコミやインサイトデータを自動取得。
                    手入力の手間なく、正確な現状把握が可能です。
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <Brain className="h-10 w-10 text-purple-600 mb-4" />
                  <CardTitle>AIによるSWOT分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    取得したデータをAIが解析し、店舗の[強み・弱み・機会・脅威]を明確化。
                    客観的な視点で、独自の強みを洗い出します。
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <Instagram className="h-10 w-10 text-pink-600 mb-4" />
                  <CardTitle>Instagram投稿を自動生成</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    SWOT分析結果に基づき、ターゲット層に最も響く投稿文案とテーマをAIが提案。
                    集客効果の高いSNS運用を実現します。
                  </p>
                </CardContent>
              </Card>
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
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
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
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900">情報の自動取得</h4>
                      <p className="text-sm text-slate-600">Googleビジネスプロフィールから、店舗の基本情報、クチコミ、インサイトデータを読み取ります。</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900">SWOT分析への活用</h4>
                      <p className="text-sm text-slate-600">取得した生の顧客データ（クチコミ等）をAIが解析し、より実践的なSWOT分析を行います。</p>
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
                  <Image
                    src="/images/logo.png"
                    alt="WINQER Logo"
                    fill
                    className="object-contain brightness-0 invert"
                  />
                </div>
                <span className="font-bold text-white text-lg">WINQER</span>
              </div>
              <p className="text-sm text-slate-400 max-w-sm">
                SWOT分析 × Instagram生成AI<br />
                店舗の集客を科学するプラットフォーム
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">メニュー</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white">機能の特徴</Link></li>
                <li><Link href="/login" className="hover:text-white">ログイン</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">法的情報</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white">プライバシーポリシー</Link></li>
                <li><Link href="/terms" className="hover:text-white">利用規約</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} WINQER. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
