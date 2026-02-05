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
interface StrategyInput {
    goal: {
        main_objective: string;
        monthly_new_customers: string;
    };
    product: {
        menu_name: string;
        price_first: string;
        price_normal: string;
        format: string;
        usage_type: string;
    };
    constraints: {
        max_capacity: string;
        ng_conditions: string[];
        unwanted_customer_types: string;
    };
    customer_voice: {
        frequent_questions: string;
        pre_visit_anxieties: string;
        deciding_factors: string;
        refusal_reasons: string;
    };
    comparison: {
        competitors: string[];
        differentiation_points: string;
    };
    assets: {
        available_assets: string;
        feasible_channels: string[];
        writing_skill: string;
    };
    brand: {
        ng_expressions: string;
        desired_image: string;
    };
}

const INITIAL_STATE: StrategyInput = {
    goal: { main_objective: "", monthly_new_customers: "" },
    product: { menu_name: "", price_first: "", price_normal: "", format: "", usage_type: "" },
    constraints: { max_capacity: "", ng_conditions: [], unwanted_customer_types: "" },
    customer_voice: { frequent_questions: "", pre_visit_anxieties: "", deciding_factors: "", refusal_reasons: "" },
    comparison: { competitors: [], differentiation_points: "" },
    assets: { available_assets: "", feasible_channels: [], writing_skill: "" },
    brand: { ng_expressions: "", desired_image: "" },
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
                    setFormData(strategy.input_data)
                    setResult(strategy.output_data)
                    // Optional toast - might be annoying if switching tabs frequently
                    /*
                    toast({
                        title: "戦略を読み込みました",
                        description: "保存された戦略データを表示します。",
                    })
                    */
                } else {
                    // No strategy found, reset form but keep store context
                    setFormData(INITIAL_STATE)
                    setResult(null)
                }
            } catch (error) {
                console.error("Failed to load strategy:", error)
            }
        }
        loadStrategy()
    }, [selectedStore, toast])

    const handleInputChange = (section: keyof StrategyInput, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }))
    }

    const handleArrayToggle = (section: keyof StrategyInput, field: string, value: string) => {
        setFormData(prev => {
            // @ts-ignore
            const currentArray = prev[section][field] as string[]
            const newArray = currentArray.includes(value)
                ? currentArray.filter(item => item !== value)
                : [...currentArray, value]

            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: newArray
                }
            }
        })
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
                <h2 className="text-xl font-bold">広告戦略AI設定</h2>
                <p className="text-muted-foreground text-sm">
                    あなたのビジネス情報をもとに、プロレベルの広告戦略を自動生成します。
                </p>
                {!selectedStore && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
                        ⚠️ 店舗が選択されていません。戦略をより正確に生成するには、ヘッダーから店舗を選択してください。
                    </div>
                )}
            </div>

            {/* Form Section */}
            <div className="grid gap-6">

                {/* 1. Goal */}
                <Card>
                    <CardHeader>
                        <CardTitle>1. ゴール確認（超シンプル）</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Q1. 今回の集客で一番増やしたいのはどれですか？（1つ）</Label>
                            <Select value={formData.goal.main_objective} onValueChange={(val) => handleInputChange('goal', 'main_objective', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="来店・予約数">来店・予約数</SelectItem>
                                    <SelectItem value="問い合わせ">問い合わせ</SelectItem>
                                    <SelectItem value="とりあえず認知（今回は不要）">とりあえず認知（今回は不要）</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Q2. 月に新規で、何人くらい増えたら理想ですか？</Label>
                            <Select value={formData.goal.monthly_new_customers} onValueChange={(val) => handleInputChange('goal', 'monthly_new_customers', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5人くらい">5人くらい</SelectItem>
                                    <SelectItem value="10人くらい">10人くらい</SelectItem>
                                    <SelectItem value="15人くらい">15人くらい</SelectItem>
                                    <SelectItem value="20人くらい">20人くらい</SelectItem>
                                    <SelectItem value="よく分からない（お任せ）">よく分からない（お任せ）</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Product */}
                <Card>
                    <CardHeader>
                        <CardTitle>2. 商品・サービス（事実だけ）</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Q3. 今回、特に案内したいメニューは何ですか？</Label>
                            <Input
                                placeholder="例：プレミアムフェイシャル"
                                value={formData.product.menu_name}
                                onChange={(e) => handleInputChange('product', 'menu_name', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Q4. 初回価格</Label>
                                <Input
                                    placeholder="例：5000"
                                    value={formData.product.price_first}
                                    onChange={(e) => handleInputChange('product', 'price_first', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>通常価格</Label>
                                <Input
                                    placeholder="例：10000"
                                    value={formData.product.price_normal}
                                    onChange={(e) => handleInputChange('product', 'price_normal', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Q5. 提供形式</Label>
                            <Select value={formData.product.format} onValueChange={(val) => handleInputChange('product', 'format', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="来店">来店</SelectItem>
                                    <SelectItem value="オンライン">オンライン</SelectItem>
                                    <SelectItem value="その他">その他</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Q6. 基本的な利用形態</Label>
                            <Select value={formData.product.usage_type} onValueChange={(val) => handleInputChange('product', 'usage_type', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="単発利用が多い">単発利用が多い</SelectItem>
                                    <SelectItem value="継続利用が多い">継続利用が多い</SelectItem>
                                    <SelectItem value="どちらも同じくらい">どちらも同じくらい</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Constraints */}
                <Card>
                    <CardHeader>
                        <CardTitle>3. キャパ・制約条件（かなり重要）</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Q7. 月に新規で対応できる最大人数は何人ですか？</Label>
                            <Input
                                placeholder="例：10"
                                value={formData.constraints.max_capacity}
                                onChange={(e) => handleInputChange('constraints', 'max_capacity', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Q8. 対応できない条件があれば選んでください（複数可）</Label>
                            <div className="flex flex-wrap gap-2">
                                {['男性', '妊娠中', '生理中', '飲酒後'].map((item) => (
                                    <Button
                                        key={item}
                                        variant={formData.constraints.ng_conditions.includes(item) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleArrayToggle('constraints', 'ng_conditions', item)}
                                    >
                                        {item}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Q9. 正直、集めたくないお客様のタイプはありますか？</Label>
                            <Input
                                placeholder="例：安さ目的、無断キャンセルが多い など"
                                value={formData.constraints.unwanted_customer_types}
                                onChange={(e) => handleInputChange('constraints', 'unwanted_customer_types', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Customer Voice */}
                <Card>
                    <CardHeader>
                        <CardTitle>4. お客様のリアルな声（広告の核）</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Q10. 初めての方からよく聞かれる質問は何ですか？（最大3つ）</Label>
                            <Textarea
                                placeholder="・痛くないですか？&#13;&#10;・時間はどれくらいかかりますか？"
                                value={formData.customer_voice.frequent_questions}
                                onChange={(e) => handleInputChange('customer_voice', 'frequent_questions', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Q11. 来店前によく不安に思われていることは何ですか？</Label>
                            <Textarea
                                placeholder="例：熱そう／恥ずかしい／効果が分からない"
                                value={formData.customer_voice.pre_visit_anxieties}
                                onChange={(e) => handleInputChange('customer_voice', 'pre_visit_anxieties', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Q12. 実際に来店された決め手になった理由は何ですか？</Label>
                            <Textarea
                                placeholder="例：家から近い、口コミが良い"
                                value={formData.customer_voice.deciding_factors}
                                onChange={(e) => handleInputChange('customer_voice', 'deciding_factors', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Q13. 断られるときに多い理由はどれですか？</Label>
                            <Select value={formData.customer_voice.refusal_reasons} onValueChange={(val) => handleInputChange('customer_voice', 'refusal_reasons', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="価格">価格</SelectItem>
                                    <SelectItem value="距離">距離</SelectItem>
                                    <SelectItem value="時間">時間</SelectItem>
                                    <SelectItem value="タイミング">タイミング</SelectItem>
                                    <SelectItem value="その他">その他</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* 5. Comparison */}
                <Card>
                    <CardHeader>
                        <CardTitle>5. 比較対象（ポジション決定用）</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Q14. 比較されやすい相手はどれですか？（複数可）</Label>
                            <div className="flex flex-wrap gap-2">
                                {['大手サロン', '格安店', '他サービス（岩盤浴・整体など）'].map((item) => (
                                    <Button
                                        key={item}
                                        variant={formData.comparison.competitors.includes(item) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleArrayToggle('comparison', 'competitors', item)}
                                    >
                                        {item}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Q15. それらと比べて「ここは違う」と思う点は何ですか？</Label>
                            <Textarea
                                placeholder="うまく書けなくてOK"
                                value={formData.comparison.differentiation_points}
                                onChange={(e) => handleInputChange('comparison', 'differentiation_points', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 6. Assets */}
                <Card>
                    <CardHeader>
                        <CardTitle>6. 素材・発信できる範囲（現実ベース）</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Q16. 広告や発信に使えそうな素材はありますか？</Label>
                            <Select value={formData.assets.available_assets} onValueChange={(val) => handleInputChange('assets', 'available_assets', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="お客様の声">お客様の声</SelectItem>
                                    <SelectItem value="施術写真・動画">施術写真・動画</SelectItem>
                                    <SelectItem value="顔出しOK">顔出しOK</SelectItem>
                                    <SelectItem value="特にない">特にない</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Q17. 無理なくできそうな発信はどれですか？（複数可）</Label>
                            <div className="flex flex-wrap gap-2">
                                {['Instagram投稿（月1〜4回）', 'ホームページの固定ページ', 'Googleマップ（口コミ中心）', '正直、ほぼ何もできない'].map((item) => (
                                    <Button
                                        key={item}
                                        variant={formData.assets.feasible_channels.includes(item) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleArrayToggle('assets', 'feasible_channels', item)}
                                    >
                                        {item}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Q18. 文章を書くのはどれくらい得意ですか？</Label>
                            <Select value={formData.assets.writing_skill} onValueChange={(val) => handleInputChange('assets', 'writing_skill', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="苦ではない">苦ではない</SelectItem>
                                    <SelectItem value="少し苦手">少し苦手</SelectItem>
                                    <SelectItem value="かなり苦手">かなり苦手</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* 7. Brand */}
                <Card>
                    <CardHeader>
                        <CardTitle>7. NG表現・ブランド方針（暴走防止）</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Q19. 絶対にやりたくない広告表現はありますか？</Label>
                            <Input
                                placeholder="例：安売り／煽り／派手 など"
                                value={formData.brand.ng_expressions}
                                onChange={(e) => handleInputChange('brand', 'ng_expressions', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Q20. 将来的に、どんな存在として選ばれたいですか？</Label>
                            <Select value={formData.brand.desired_image} onValueChange={(val) => handleInputChange('brand', 'desired_image', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="地域で信頼される">地域で信頼される</SelectItem>
                                    <SelectItem value="専門性が高い">専門性が高い</SelectItem>
                                    <SelectItem value="気軽に通える">気軽に通える</SelectItem>
                                    <SelectItem value="その他">その他</SelectItem>
                                </SelectContent>
                            </Select>
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
                            戦略を生成中...
                        </>
                    ) : (!isAdmin && result) ? (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            生成済み (再生成は管理者のみ)
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            戦略を生成する
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
