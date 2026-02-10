"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Zap, Check, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Store } from "@/types/store"

interface SubscriptionCardProps {
    store: Store
}

export function SubscriptionCard({ store }: SubscriptionCardProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const isPro = store.plan_type === 'pro'

    // Usage Stats
    // Free: Total Usage (Max 1)
    // Pro: Daily Usage (Max 5)

    const MAX_FREE = 1
    const MAX_PRO_DAILY = 5

    const usage = isPro ? (store.usage_count || 0) : (store.total_usage_count || 0)
    const max = isPro ? MAX_PRO_DAILY : MAX_FREE
    const remaining = Math.max(0, max - usage)
    const percent = Math.min(100, (usage / max) * 100)

    const handleUpgrade = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeId: store.id,
                    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_1Q...' // Should be env but fallback for dev
                })
            })

            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error(data.error || "Failed to start checkout")
            }
        } catch (error: any) {
            toast({
                title: "エラーが発生しました",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className={`relative overflow-hidden border-2 transition-all ${isPro ? 'border-purple-500/50 bg-gradient-to-br from-purple-50 to-white' : 'border-gray-200'}`}>
            {isPro && (
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-3 py-1 rounded-bl-lg font-bold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> PRO PLAN
                </div>
            )}

            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    {isPro ? "プレミアムプラン" : "無料トライアル"}
                    {!isPro && <Badge variant="secondary" className="text-xs font-normal">Free</Badge>}
                </CardTitle>
                <CardDescription>
                    {isPro
                        ? `投稿生成し放題（1日${MAX_PRO_DAILY}回まで）`
                        : "まずは1回無料でお試しいただけます"}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                            {isPro ? "今日の生成数" : "残りの生成可能数"}
                        </span>
                        <span className="font-medium">
                            {usage} / {max} 回
                        </span>
                    </div>
                    <Progress value={percent} className={`h-2 ${isPro ? 'bg-purple-100' : 'bg-gray-100'}`} indicatorClassName={isPro ? 'bg-purple-600' : 'bg-gray-600'} />
                    {isPro && (
                        <p className="text-xs text-muted-foreground text-right">
                            ※毎日0時にリセットされます
                        </p>
                    )}
                </div>

                {!isPro && (
                    <div className="bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-100">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                            PROプランの特徴
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                毎日5回まで投稿を作成可能
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                高度なAI分析モデルを利用
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                優先サポート対応
                            </li>
                        </ul>
                    </div>
                )}
            </CardContent>

            {!isPro && (
                <CardFooter>
                    <Button
                        onClick={handleUpgrade}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-200"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        月額プランにアップグレード
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}
