import { Brain, Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface AIAnalysisProps {
    analysisResult: string | null
    analysisMetrics: any
    isAnalyzing: boolean
    onAnalyze: () => void
    industry: string
    setIndustry: (value: string) => void
    region: string
    setRegion: (value: string) => void
    adFormat: string
    setAdFormat: (value: string) => void
    adObjective: string
    setAdObjective: (value: string) => void
    targetAudience: string
    setTargetAudience: (value: string) => void
    cvLabel: string
    setCvLabel: (value: string) => void
    ga4CvEvent: string
    setGa4CvEvent: (value: string) => void
    remarks: string
    setRemarks: (value: string) => void
}

export function AIAnalysis({
    analysisResult,
    analysisMetrics,
    isAnalyzing,
    onAnalyze,
    industry,
    setIndustry,
    region,
    setRegion,
    adFormat,
    setAdFormat,
    adObjective,
    setAdObjective,
    targetAudience,
    setTargetAudience,
    cvLabel,
    setCvLabel,
    ga4CvEvent,
    setGa4CvEvent,
    remarks,
    setRemarks,
}: AIAnalysisProps) {
    console.log('🤖 [AIAnalysis] Rendered with:', { industry, region })
    return (
        <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    AI分析
                </CardTitle>
                <CardDescription>
                    店舗情報とパフォーマンスデータを基に、AIが分析を行います。
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Analysis Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>業種</Label>
                        <Input
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            placeholder="例: 美容室、飲食店"
                            className=""
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>地域</Label>
                        <Input
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            placeholder="例: 東京都渋谷区"
                            className=""
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>広告フォーマット</Label>
                        <Select value={adFormat} onValueChange={setAdFormat}>
                            <SelectTrigger className="">
                                <SelectValue placeholder="選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="image">画像 (フィード)</SelectItem>
                                <SelectItem value="video">動画 (リール)</SelectItem>
                                <SelectItem value="carousel">カルーセル</SelectItem>
                                <SelectItem value="ugc">UGC風動画</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>広告の目的</Label>
                        <Select value={adObjective} onValueChange={setAdObjective}>
                            <SelectTrigger className="">
                                <SelectValue placeholder="選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="traffic">LP誘導 (Traffic)</SelectItem>
                                <SelectItem value="sales">予約獲得 (Sales)</SelectItem>
                                <SelectItem value="line">LINE登録</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                        <Label>ターゲット属性</Label>
                        <Input
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            placeholder="例: 25〜39歳女性、主婦層、オーガニック志向"
                            className=""
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>CVの名前 (表示用)</Label>
                        <Input
                            value={cvLabel}
                            onChange={(e) => setCvLabel(e.target.value)}
                            placeholder="例: 予約完了、LINE追加"
                            className=""
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>GA4 CVイベント名</Label>
                        <Input
                            value={ga4CvEvent}
                            onChange={(e) => setGa4CvEvent(e.target.value)}
                            placeholder="例: purchase, generate_lead"
                            className=""
                        />
                    </div>
                    <div className="space-y-2 col-span-2">
                        <Label>備考・特記事項</Label>
                        <Textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="例: 今月から新メニューを開始、競合店が増えた、など"
                            className=""
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button
                        onClick={onAnalyze}
                        disabled={isAnalyzing}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isAnalyzing ? '分析中...' : 'AI分析を実行'}
                    </Button>
                </div>

                {/* Analysis Result Display */}
                {analysisResult && (
                    <div className="mt-6 p-6 bg-card rounded-lg border border-white/10 shadow-sm">
                        <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg text-purple-800">
                            <Brain className="h-5 w-5" />
                            分析結果
                        </h3>
                        <div className="prose prose-purple max-w-none">
                            <ReactMarkdown>{analysisResult}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
