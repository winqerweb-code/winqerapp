"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, ArrowRight, Play, ChevronDown, ChevronUp, BarChart3, BrainCircuit, Target, Zap } from "lucide-react"
import { useState } from "react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <VideoSection />
        <FeaturesSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <Image
              src="/images/logo.png"
              alt="WINQER"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-tight">WINQER</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            ログイン
          </Link>
          <Button asChild>
            <Link href="/login">無料で始める</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}


function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-16">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full border bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
            ✨ ビジネスの強みを自動分析 × インスタ投稿生成
          </div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 dark:from-pink-400 dark:via-purple-400 dark:to-indigo-400 pb-2">
            AIが「SWOT分析」から<br className="md:hidden" />
            最適なInstagram投稿を作成。
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            もう、投稿内容に悩む必要はありません。<br />
            あなたのビジネスの強み（Strengths）や機会（Opportunities）をAIが自動抽出し、<br className="hidden md:inline" />
            集客につながる魅力的な文章を一瞬で生成します。
          </p>
          <div className="space-x-4 pt-4">
            <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-0" asChild>
              <Link href="/login">
                無料で投稿を作ってみる <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
              使い方の動画を見る
            </Button>
          </div>
        </div>
      </div>

      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 -z-10 h-full w-full overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-pink-200 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-200 blur-[100px]" />
      </div>
    </section>
  )
}

function VideoSection() {
  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="aspect-video overflow-hidden rounded-xl border bg-background shadow-xl relative group cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 transition-colors group-hover:bg-slate-900/10">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110">
                <Play className="h-8 w-8 text-pink-600 ml-1" fill="currentColor" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-center text-sm text-muted-foreground bg-white/80 backdrop-blur-sm p-2 rounded">
              SWOT分析から投稿生成までの流れ（デモ動画）
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      title: "高度なSWOT分析",
      description: "あなたのビジネスや競合情報をAIが分析。「強み・弱み・機会・脅威」を明確化し、戦略の土台を作ります。",
      icon: Target,
      color: "text-blue-600",
    },
    {
      title: "戦略に基づく投稿生成",
      description: "ただの文章生成ではありません。分析した「強み」を最大限に活かし、ターゲットに刺さるInstagram投稿を自動作成。",
      icon: BrainCircuit,
      color: "text-purple-600",
    },
    {
      title: "投稿作成時間をゼロに",
      description: "「何を書けばいいかわからない」悩みから解放されます。あなたは生成された案を選んで投稿するだけ。",
      icon: Zap,
      color: "text-yellow-600",
    },
    {
      title: "一貫性のあるブランディング",
      description: "AIがあなたのブランドのトーン＆マナーを学習。担当者が変わっても、常に一貫したクオリティの発信が可能です。",
      icon: CheckCircle2,
      color: "text-pink-600",
    },
  ]

  return (
    <section className="py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-pink-100 text-pink-700 px-3 py-1 text-sm dark:bg-pink-900/30 dark:text-pink-300">
            WINQERだけの機能
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            分析と発信を、これひとつで。
          </h2>
          <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            感覚に頼った運用はもう終わり。データと戦略に基づいたSNS運用を、誰でも簡単に。
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <Card key={i} className="border-none shadow-none bg-slate-50/50 hover:bg-slate-100 transition-colors">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className={`p-3 rounded-full bg-white shadow-sm ${feature.color}`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQSection() {
  const faqs = [
    {
      question: "SWOT分析とは何ですか？",
      answer: "Strength（強み）、Weakness（弱み）、Opportunity（機会）、Threat（脅威）の頭文字をとったフレームワークです。WINQERはこれをAIで自動化し、戦略的な投稿作成に活用します。"
    },
    {
      question: "Instagram以外にも使えますか？",
      answer: "現在はInstagramに特化した文章構成（ハッシュタグ含む）を生成しますが、文章自体はブログやFacebookなど他の媒体にも転用可能です。"
    },
    {
      question: "生成された文章は修正できますか？",
      answer: "はい、もちろんです。AIが提案したドラフトを自由に編集・調整してから投稿することができます。"
    },
    {
      question: "どのような業種に対応していますか？",
      answer: "飲食店、美容室、小売店などの実店舗はもちろん、ECサイト、オンラインサービス、お教室など、あらゆる中小規模ビジネスに対応しています。"
    },
    {
      question: "専門的なマーケティング知識は必要ですか？",
      answer: "いいえ、必要ありません。難しい分析や戦略立案はAIが行いますので、専門知識がなくても効果的な運用が可能です。"
    },
  ]

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container px-4 md:px-6 max-w-4xl">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter">
            よくあるご質問
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}

function AccordionItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border rounded-lg bg-background">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 font-medium transition-all hover:bg-slate-50"
      >
        <span className="text-left">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 transition-transform duration-200" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 text-sm text-gray-500 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="pt-2 border-t mt-2">
            {answer}
          </div>
        </div>
      )}
    </div>
  )
}

function CTASection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-6">
          あなたのビジネスを、もっと自由に。
        </h2>
        <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl mb-10">
          まずは無料のアカウント作成から。<br />
          WINQERがビジネスの可能性を広げます。
        </p>
        <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-semibold" asChild>
          <Link href="/login">
            無料でアカウント作成
          </Link>
        </Button>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t py-12 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative h-6 w-6">
                <Image
                  src="/images/logo.png"
                  alt="WINQER"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold">WINQER</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              中小規模ビジネスのための<br />
              オールインワン・プラットフォーム
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">サービス</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-foreground">機能一覧</Link></li>
              <li><Link href="#" className="hover:text-foreground">料金プラン</Link></li>
              <li><Link href="#" className="hover:text-foreground">導入事例</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">サポート</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-foreground">ヘルプセンター</Link></li>
              <li><Link href="#" className="hover:text-foreground">お問い合わせ</Link></li>
              <li><Link href="#" className="hover:text-foreground">運営会社</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">法的情報</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/terms" className="hover:text-foreground">利用規約</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">プライバシーポリシー</Link></li>
              <li><Link href="#" className="hover:text-foreground">特定商取引法に基づく表記</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-500">
          © {new Date().getFullYear()} WINQER Inc. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
