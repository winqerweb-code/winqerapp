'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createStoreSelfService } from '@/app/actions/store'
import { toast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

export default function NewBusinessPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        phone: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name) return

        setLoading(true)
        try {
            const res = await createStoreSelfService({
                name: formData.name,
                industry: formData.industry,
                phone: formData.phone,
                // Initialize arrays as empty
                meta_campaign_ids: []
            })

            if (res.success && res.store) {
                toast({
                    title: "事業を登録しました",
                    description: `${res.store.name} の設定を開始します。`
                })
                router.push('/dashboard/stores')
                router.refresh()
            } else {
                throw new Error(res.error || 'Unknown error')
            }
        } catch (error: any) {
            console.error('Registration failed:', error)
            toast({
                title: "登録に失敗しました",
                description: error.message || "事業の作成中にエラーが発生しました",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container max-w-lg py-10">
            <Card>
                <CardHeader>
                    <CardTitle>新しい事業を登録</CardTitle>
                    <CardDescription>
                        WINQERで管理する事業情報の基本設定を行います。
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">事業名・店舗名 <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="例: 株式会社WINQER / WINQERカフェ 大阪店"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="industry">業種（任意）</Label>
                            <Input
                                id="industry"
                                name="industry"
                                placeholder="例: 飲食、小売、ITサービス"
                                value={formData.industry}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">電話番号（任意）</Label>
                            <Input
                                id="phone"
                                name="phone"
                                placeholder="03-1234-5678"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="ghost" type="button" onClick={() => router.back()} disabled={loading}>
                            キャンセル
                        </Button>
                        <Button type="submit" disabled={loading || !formData.name}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            登録する
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
