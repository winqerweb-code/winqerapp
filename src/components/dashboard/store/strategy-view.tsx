"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Copy, Check, Save, Pencil, X, Sparkles } from "lucide-react"
import { useStore } from "@/contexts/store-context"
import { saveStrategy, getStrategy } from "@/app/actions/strategy"
import { useToast } from "@/components/ui/use-toast"

// Define types matching the API input
// Define types matching the API input (Simplified 6 Questions)
interface StrategyInput {
    product_name: string;      // Q1. Product
    price_menu: string;        // Q2. Price & Menu
    strengths: string;         // Q3. Strengths
    weaknesses: string;        // Q4. Weaknesses
    target_persona: string;    // Q5. Target
    goal: string;              // Q6. Goal
}

const INITIAL_STATE: StrategyInput = {
    product_name: "",
    price_menu: "",
    strengths: "",
    weaknesses: "",
    target_persona: "",
    goal: ""
}

interface StrategyViewProps {
    isAdmin?: boolean
}

export function StrategyView({ isAdmin = false }: StrategyViewProps) {
    const { selectedStore } = useStore()
    const [formData, setFormData] = useState<StrategyInput>(INITIAL_STATE)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [copied, setCopied] = useState(false)
    const { toast } = useToast()

    // Load saved strategy when store changes
    useEffect(() => {
        const loadStrategy = async () => {
            if (!selectedStore) {
                setFormData(INITIAL_STATE)
                setResult(null)
                return
            }

            try {
                const { success, strategy } = await getStrategy(selectedStore.id)
                if (success && strategy) {
                    // Check if old data format, if so, migrate or reset
                    // For simplicity, if keys don't match, we might need to reset or map
                    // Here we blindly trust it for now but in prod we might want a migration
                    if (strategy.input_data && 'product_name' in strategy.input_data) {
                        setFormData(strategy.input_data)
                    } else {
                        // Inherit old data if possible or start fresh
                        setFormData(INITIAL_STATE)
                    }
                    setResult(strategy.output_data)
                } else {
                    setFormData(INITIAL_STATE)
                    setResult(null)
                }
            } catch (error) {
                console.error("Failed to load strategy:", error)
            }
        }
        loadStrategy()
    }, [selectedStore, toast])

    const handleInputChange = (field: keyof StrategyInput, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const generateStrategy = async () => {
        if (!selectedStore) {
            toast({
                title: "店舗が選択されていません",
                description: "戦略を生成するには、まず店舗を選択してください。",
                variant: "destructive",
            })
            return
        }

        // Simple validation
        if (!formData.product_name || !formData.target_persona) {
            toast({
                title: "入力が不足しています",
                description: "少なくとも「商品」と「ターゲット」は入力してください。",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        setResult(null)
        try {
            // Get API Key from localStorage
            const apiKey = localStorage.getItem("openai_api_key")

            const response = await fetch('/api/strategy/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    apiKey, // Pass the API key
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to generate strategy')
            }

            const data = await response.json()
            setResult(data)

            // Auto-save after generation
            await handleSave(data)

        } catch (error: any) {
            console.error(error)
            alert(`戦略の生成に失敗しました: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (dataToSave = result) => {
        if (!selectedStore || !dataToSave) return

        setSaving(true)
        try {
            const { success, error } = await saveStrategy(selectedStore.id, formData, dataToSave)
            if (success) {
                toast({
                    title: "戦略を保存しました",
                    description: "次回この店舗を選択すると自動で読み込まれます。",
                })
            } else {
                throw new Error(error)
            }
        } catch (error) {
            console.error("Failed to save strategy:", error)
            toast({
                title: "保存に失敗しました",
                description: "もう一度お試しください。",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    const copyToClipboard = () => {
        if (!result) return
        const text = JSON.stringify(result, null, 2)
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const updateResultDeep = (path: string[], value: any) => {
        setResult((prev: any) => {
            const newState = JSON.parse(JSON.stringify(prev))
            let current = newState
            for (let i = 0; i < path.length - 1; i++) {
                if (!current[path[i]]) current[path[i]] = {}
                current = current[path[i]]
            }
            current[path[path.length - 1]] = value
            return newState
        })
    }

    const handleArrayItemChange = (section: string, index: number, field: string, value: any) => {
        setResult((prev: any) => {
            const newState = JSON.parse(JSON.stringify(prev))
            if (newState[section] && newState[section][index]) {
                newState[section][index][field] = value
            }
            return newState
        })
    }

    return (
        <div className="container mx-auto py-4 max-w-4xl space-y-8">
            <div className="space-y-2">
                <h2 className="text-xl font-bold">広告戦略AI設定（厳選6問）</h2>
                <p className="text-muted-foreground text-sm">
                    たった6つの質問に答えるだけで、プロレベルの広告戦略を自動生成します。<br />
                    <span className="text-xs text-amber-600">※難しく考えず、普段お客様に話しているような言葉で入力してください。</span>
                </p>
                {!selectedStore && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
                        ⚠️ 店舗が選択されていません。戦略をより正確に生成するには、ヘッダーから店舗を選択してください。
                    </div>
                )}
            </div>

            {/* Form Section */}
            <div className="grid gap-6">

                {/* 1. Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                            あなたの商品・サービス（基本）
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Q1. 何を売っていますか？ <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="例：腰痛専門の整体、手作りシフォンケーキ、オンライン英会話"
                                value={formData.product_name}
                                onChange={(e) => handleInputChange('product_name', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Q2. 価格とメニュー</Label>
                            <Input
                                placeholder="例：60分 8,000円、ホール 2,500円、月額 980円"
                                value={formData.price_menu}
                                onChange={(e) => handleInputChange('price_menu', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 2. SWOT Seeds */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                            あなたの「武器」と「弱点」（SWOTの素）
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Q3. こだわり（強み）: 他のお店と何が違いますか？</Label>
                            <Textarea
                                placeholder="例：ボキボキしない施術、添加物を一切使わない、夜22時まで営業"
                                value={formData.strengths}
                                onChange={(e) => handleInputChange('strengths', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Q4. 正直な悩み（弱点）: 大手や有名店に負けているところは？</Label>
                            <Textarea
                                placeholder="例：マンションの一室で怪しい、賞味期限が短い、スタッフが私一人しかいない"
                                value={formData.weaknesses}
                                onChange={(e) => handleInputChange('weaknesses', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Target & Goal */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                            ターゲットとゴール
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Q5. 誰を助けたい？（たった一人のお客様） <span className="text-red-500">*</span></Label>
                            <Textarea
                                placeholder="その人はどんな生活をしていて、何に悩んでいますか？&#13;&#10;例：デスクワークで腰が限界の30代SE、子供に安全なおやつを食べさせたいママ"
                                value={formData.target_persona}
                                onChange={(e) => handleInputChange('target_persona', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Q6. どうなってほしい？（ゴール）</Label>
                            <Input
                                placeholder="例：まずはLINE登録、プロフィールを見てほしい、予約してほしい"
                                value={formData.goal}
                                onChange={(e) => handleInputChange('goal', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    onClick={generateStrategy}
                    disabled={loading || (!isAdmin && !!result)}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            戦略を生成中... (約10~20秒)
                        </>
                    ) : (!isAdmin && result) ? (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            生成済み (再生成は管理者のみ)
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            この内容でAIに戦略を作らせる
                        </>
                    )}
                </Button>
                {(!isAdmin && result) && (
                    <p className="text-xs text-center text-amber-600 font-medium">
                        ※AI戦略の再生成は管理者権限が必要です。修正はページ下部の「編集」機能をご利用ください。
                    </p>
                )}
            </div>

            {/* Result Section */}
            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">生成された戦略</h2>
                        <div className="flex gap-2">
                            <Button
                                variant={isEditing ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? <X className="h-4 w-4 mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
                                {isEditing ? "編集を終了" : "編集する"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleSave()} disabled={saving || !selectedStore}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                {saving ? "保存中..." : "保存する"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={copyToClipboard}>
                                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                {copied ? "コピーしました" : "JSONをコピー"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* SWOT */}
                        <Card>
                            <CardHeader><CardTitle>SWOT分析</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-blue-600">Strengths (強み)</h4>
                                    {isEditing ? (
                                        <Textarea
                                            value={result.swot?.strengths?.join('\n')}
                                            onChange={(e) => updateResultDeep(['swot', 'strengths'], e.target.value.split('\n'))}
                                            className="min-h-[100px]"
                                        />
                                    ) : (
                                        <ul className="list-disc pl-5 text-sm">{result.swot?.strengths?.map((i: string, idx: number) => <li key={idx}>{i}</li>)}</ul>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-red-600">Weaknesses (弱み)</h4>
                                    {isEditing ? (
                                        <Textarea
                                            value={result.swot?.weaknesses?.join('\n')}
                                            onChange={(e) => updateResultDeep(['swot', 'weaknesses'], e.target.value.split('\n'))}
                                            className="min-h-[100px]"
                                        />
                                    ) : (
                                        <ul className="list-disc pl-5 text-sm">{result.swot?.weaknesses?.map((i: string, idx: number) => <li key={idx}>{i}</li>)}</ul>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-600">Opportunities (機会)</h4>
                                    {isEditing ? (
                                        <Textarea
                                            value={result.swot?.opportunities?.join('\n')}
                                            onChange={(e) => updateResultDeep(['swot', 'opportunities'], e.target.value.split('\n'))}
                                            className="min-h-[100px]"
                                        />
                                    ) : (
                                        <ul className="list-disc pl-5 text-sm">{result.swot?.opportunities?.map((i: string, idx: number) => <li key={idx}>{i}</li>)}</ul>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-yellow-600">Threats (脅威)</h4>
                                    {isEditing ? (
                                        <Textarea
                                            value={result.swot?.threats?.join('\n')}
                                            onChange={(e) => updateResultDeep(['swot', 'threats'], e.target.value.split('\n'))}
                                            className="min-h-[100px]"
                                        />
                                    ) : (
                                        <ul className="list-disc pl-5 text-sm">{result.swot?.threats?.map((i: string, idx: number) => <li key={idx}>{i}</li>)}</ul>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* STP */}
                        <Card>
                            <CardHeader><CardTitle>STP分析</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">Segmentation (セグメンテーション)</h4>
                                    {isEditing ? (
                                        <Textarea
                                            value={result.stp.segmentation}
                                            onChange={(e) => updateResultDeep(['stp', 'segmentation'], e.target.value)}
                                        />
                                    ) : (
                                        <p className="text-sm">{result.stp.segmentation}</p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold">Targeting (ターゲティング)</h4>
                                    {isEditing ? (
                                        <Textarea
                                            value={result.stp.targeting}
                                            onChange={(e) => updateResultDeep(['stp', 'targeting'], e.target.value)}
                                        />
                                    ) : (
                                        <p className="text-sm">{result.stp.targeting}</p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold">Positioning (ポジショニング)</h4>
                                    {isEditing ? (
                                        <Textarea
                                            value={result.stp.positioning}
                                            onChange={(e) => updateResultDeep(['stp', 'positioning'], e.target.value)}
                                        />
                                    ) : (
                                        <p className="text-sm">{result.stp.positioning}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Persona */}
                        <Card className="md:col-span-2">
                            <CardHeader><CardTitle>ターゲットペルソナ</CardTitle></CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold">デモグラフィック属性</h4>
                                    {isEditing ? (
                                        <Textarea
                                            value={result.persona.demographics}
                                            onChange={(e) => updateResultDeep(['persona', 'demographics'], e.target.value)}
                                        />
                                    ) : (
                                        <p className="text-sm">{result.persona.demographics}</p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold">サイコグラフィック属性</h4>
                                    {isEditing ? (
                                        <Textarea
                                            value={result.persona.psychographics}
                                            onChange={(e) => updateResultDeep(['persona', 'psychographics'], e.target.value)}
                                        />
                                    ) : (
                                        <p className="text-sm">{result.persona.psychographics}</p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold">悩み・課題 (Pain Points)</h4>
                                    {isEditing ? (
                                        <Textarea
                                            value={result.persona.pain_points}
                                            onChange={(e) => updateResultDeep(['persona', 'pain_points'], e.target.value)}
                                        />
                                    ) : (
                                        <p className="text-sm">{result.persona.pain_points}</p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold">ニーズ・願望 (Needs)</h4>
                                    {isEditing ? (
                                        <Textarea
                                            value={result.persona.needs}
                                            onChange={(e) => updateResultDeep(['persona', 'needs'], e.target.value)}
                                        />
                                    ) : (
                                        <p className="text-sm">{result.persona.needs}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Strategy Summary */}
                        <Card className="md:col-span-2">
                            <CardHeader><CardTitle>戦略サマリー</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold">目標CPA</h4>
                                        {isEditing ? (
                                            <Input
                                                value={result.strategy_summary.target_cpa}
                                                onChange={(e) => updateResultDeep(['strategy_summary', 'target_cpa'], e.target.value)}
                                            />
                                        ) : (
                                            <p className="text-lg font-bold text-primary">{result.strategy_summary.target_cpa}</p>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">想定広告予算</h4>
                                        {isEditing ? (
                                            <Input
                                                value={result.strategy_summary.estimated_budget}
                                                onChange={(e) => updateResultDeep(['strategy_summary', 'estimated_budget'], e.target.value)}
                                            />
                                        ) : (
                                            <p className="text-lg font-bold text-primary">{result.strategy_summary.estimated_budget}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold">戦略的アドバイス</h4>
                                    {isEditing ? (
                                        <Textarea
                                            value={result.strategy_summary.advice}
                                            onChange={(e) => updateResultDeep(['strategy_summary', 'advice'], e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                    ) : (
                                        <p className="text-sm">{result.strategy_summary.advice}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recommended Media */}
                        <Card className="md:col-span-2">
                            <CardHeader><CardTitle>推奨媒体・手法</CardTitle></CardHeader>
                            <CardContent className="grid gap-4">
                                {result.recommended_media?.map((media: any, idx: number) => (
                                    <div key={idx} className="border p-4 rounded-lg">
                                        <h4 className="font-bold mb-2 flex items-center">
                                            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded mr-2">推奨</span>
                                            {isEditing ? (
                                                <Input
                                                    value={media.name}
                                                    onChange={(e) => handleArrayItemChange('recommended_media', idx, 'name', e.target.value)}
                                                    className="max-w-[300px]"
                                                />
                                            ) : (
                                                media.name
                                            )}
                                        </h4>
                                        <div className="text-sm text-muted-foreground">
                                            <span className="font-semibold text-foreground">選定理由：</span>
                                            {isEditing ? (
                                                <Textarea
                                                    value={media.reasoning}
                                                    onChange={(e) => handleArrayItemChange('recommended_media', idx, 'reasoning', e.target.value)}
                                                    className="mt-2"
                                                />
                                            ) : (
                                                media.reasoning
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Appeal Points */}
                        <Card className="md:col-span-2">
                            <CardHeader><CardTitle>主要訴求ポイント</CardTitle></CardHeader>
                            <CardContent className="grid gap-4">
                                {result.appeal_points?.map((point: any, idx: number) => (
                                    <div key={idx} className="border p-4 rounded-lg">
                                        {isEditing ? (
                                            <Input
                                                value={point.title}
                                                onChange={(e) => handleArrayItemChange('appeal_points', idx, 'title', e.target.value)}
                                                className="mb-2 font-bold"
                                            />
                                        ) : (
                                            <h4 className="font-bold mb-2 text-lg">{point.title}</h4>
                                        )}
                                        <div className="bg-muted p-3 rounded-md mb-2">
                                            <p className="text-xs font-semibold text-muted-foreground mb-1">広告コピー案</p>
                                            {isEditing ? (
                                                <Input
                                                    value={point.ad_copy_example}
                                                    onChange={(e) => handleArrayItemChange('appeal_points', idx, 'ad_copy_example', e.target.value)}
                                                    className="font-medium"
                                                />
                                            ) : (
                                                <p className="font-medium text-primary">「{point.ad_copy_example}」</p>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <span className="font-semibold text-foreground">なぜ刺さるか：</span>
                                            {isEditing ? (
                                                <Textarea
                                                    value={point.reasoning}
                                                    onChange={(e) => handleArrayItemChange('appeal_points', idx, 'reasoning', e.target.value)}
                                                    className="mt-2"
                                                />
                                            ) : (
                                                point.reasoning
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Funnel */}
                        <Card className="md:col-span-2">
                            <CardHeader><CardTitle>推奨集客ファネル</CardTitle></CardHeader>
                            <CardContent>
                                <div className="relative">
                                    {result.funnel_design?.steps?.map((step: any, idx: number) => (
                                        <div key={idx} className="flex items-start mb-6 last:mb-0 relative z-10 w-full">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mr-4">
                                                {idx + 1}
                                            </div>
                                            <div className="w-full">
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <Input
                                                            value={step.step}
                                                            onChange={(e) => {
                                                                const newSteps = [...result.funnel_design.steps]
                                                                newSteps[idx].step = e.target.value
                                                                updateResultDeep(['funnel_design', 'steps'], newSteps)
                                                            }}
                                                            className="font-bold"
                                                            placeholder="フェーズ名"
                                                        />
                                                        <Input
                                                            value={step.role}
                                                            onChange={(e) => {
                                                                const newSteps = [...result.funnel_design.steps]
                                                                newSteps[idx].role = e.target.value
                                                                updateResultDeep(['funnel_design', 'steps'], newSteps)
                                                            }}
                                                            placeholder="役割"
                                                        />
                                                        <Textarea
                                                            value={step.content_idea}
                                                            onChange={(e) => {
                                                                const newSteps = [...result.funnel_design.steps]
                                                                newSteps[idx].content_idea = e.target.value
                                                                updateResultDeep(['funnel_design', 'steps'], newSteps)
                                                            }}
                                                            placeholder="施策アイデア"
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h4 className="font-bold">{step.step}</h4>
                                                        <p className="text-sm text-muted-foreground mb-1">{step.role}</p>
                                                        <p className="text-sm bg-muted p-2 rounded">{step.content_idea}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {/* Vertical line connector */}
                                    <div className="absolute top-4 left-4 w-0.5 h-full bg-border -z-0" style={{ height: 'calc(100% - 32px)' }}></div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Instagram Posts */}
                        <Card className="md:col-span-2">
                            <CardHeader><CardTitle>そのまま使えるInstagram投稿案（4選）</CardTitle></CardHeader>
                            <CardContent className="grid gap-6">
                                {result.instagram_posts?.map((post: any, idx: number) => (
                                    <div key={idx} className="border rounded-lg overflow-hidden">
                                        <div className="bg-muted px-4 py-2 border-b flex justify-between items-center">
                                            {isEditing ? (
                                                <Input
                                                    value={post.title}
                                                    onChange={(e) => handleArrayItemChange('instagram_posts', idx, 'title', e.target.value)}
                                                    className="h-8 max-w-[300px]"
                                                />
                                            ) : (
                                                <h4 className="font-bold text-sm">投稿案 {idx + 1}: {post.title}</h4>
                                            )}
                                            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => navigator.clipboard.writeText(post.body)}>
                                                <Copy className="h-3 w-3 mr-1" /> 本文コピー
                                            </Button>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground mb-1">投稿本文</p>
                                                {isEditing ? (
                                                    <Textarea
                                                        value={post.body}
                                                        onChange={(e) => handleArrayItemChange('instagram_posts', idx, 'body', e.target.value)}
                                                        className="font-mono min-h-[150px]"
                                                    />
                                                ) : (
                                                    <div className="p-3 rounded-md text-sm whitespace-pre-wrap font-mono bg-muted">
                                                        {post.body}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-semibold block text-muted-foreground text-xs">狙い</span>
                                                    {isEditing ? (
                                                        <Textarea
                                                            value={post.purpose}
                                                            onChange={(e) => handleArrayItemChange('instagram_posts', idx, 'purpose', e.target.value)}
                                                        />
                                                    ) : (
                                                        post.purpose
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-semibold block text-muted-foreground text-xs">なぜ刺さるか</span>
                                                    {isEditing ? (
                                                        <Textarea
                                                            value={post.reasoning}
                                                            onChange={(e) => handleArrayItemChange('instagram_posts', idx, 'reasoning', e.target.value)}
                                                        />
                                                    ) : (
                                                        post.reasoning
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                    </div>
                </div>
            )}
        </div>
    )
}
