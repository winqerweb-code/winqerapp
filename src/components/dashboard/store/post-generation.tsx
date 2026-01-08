"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, Image as ImageIcon, Copy, Check, Upload, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { generateInstagramPost } from "@/app/actions/generate-post"
import Image from "next/image"

interface PostGenerationProps {
    storeId: string
    strategyData: any
}

export function PostGeneration({ storeId, strategyData }: PostGenerationProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [topic, setTopic] = useState("")
    const [tone, setTone] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [results, setResults] = useState<any[] | null>(null)
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

    // Drag & Drop State
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleImageSelect(file)
        }
    }

    const handleImageSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast({
                title: "画像ファイルのみアップロード可能です",
                variant: "destructive"
            })
            return
        }

        // 5MB Limit Check (approx)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "ファイルサイズが大きすぎます (5MB以下)",
                variant: "destructive"
            })
            return
        }

        setImageFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            handleImageSelect(file)
        }
    }

    const clearImage = () => {
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleGenerate = async () => {
        const apiKey = localStorage.getItem("openai_api_key")
        if (!apiKey) {
            toast({
                title: "APIキー未設定",
                description: "設定画面からOpenAI APIキーを保存してください。",
                variant: "destructive"
            })
            return
        }

        if (!topic && !imageFile) {
            toast({
                title: "トピックまたは画像を入力してください",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        setResults(null)

        try {
            const res = await generateInstagramPost({
                storeId,
                apiKey,
                topic: topic || (imageFile ? "この画像について魅力的に紹介する投稿" : ""),
                imageBase64: imagePreview || undefined, // Send base64 directly
                tone
            })

            if (res.success && res.captions) {
                setResults(res.captions)
                toast({
                    title: "生成完了",
                    description: "3つの投稿案が生成されました。"
                })
            } else {
                throw new Error(res.error)
            }
        } catch (error: any) {
            console.error(error)
            toast({
                title: "生成失敗",
                description: "もう一度お試しください。",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    // Context Summary
    const persona = strategyData?.output_data?.persona?.demographics || strategyData?.input_data?.goal?.target_audience || "未設定"
    const usp = strategyData?.input_data?.comparison?.differentiation_points || "未設定"

    return (
        <div className="grid gap-6 md:grid-cols-2">

            {/* Left Col: Inputs */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            投稿を作成
                        </CardTitle>
                        <CardDescription>
                            戦略（ターゲット層: {persona}）に基づき、投稿文を生成します。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>画像 (任意・推奨)</Label>

                            {!imagePreview ? (
                                <div
                                    className={`
                                        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                                        ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}
                                    `}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Upload className="h-8 w-8" />
                                        <p className="text-sm font-medium">クリックまたは画像をドロップ</p>
                                        <p className="text-xs">画像を解析して投稿文に反映します</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative rounded-lg overflow-hidden border bg-black/5 aspect-square max-h-[300px] flex items-center justify-center">
                                    {/* Using standard img for local preview blob/base64 */}
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-h-full max-w-full object-contain"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 rounded-full h-8 w-8"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            clearImage()
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>投稿トピック</Label>
                            <Textarea
                                placeholder={imageFile ? "例: この料理のこだわりポイントなど（空欄でもOK）" : "例: 夏限定のキャンペーン告知、新メニューの紹介"}
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>投稿の雰囲気 (Tone)</Label>
                            <Select value={tone} onValueChange={setTone}>
                                <SelectTrigger>
                                    <SelectValue placeholder="戦略の設定に従う" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">戦略の設定に従う</SelectItem>
                                    <SelectItem value="friendly">親しみやすく・フランクに</SelectItem>
                                    <SelectItem value="professional">専門的・信頼感重視</SelectItem>
                                    <SelectItem value="emotional">エモーショナル・感動的に</SelectItem>
                                    <SelectItem value="sales">セールス強め（行動喚起）</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                            size="lg"
                            onClick={handleGenerate}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    画像を解析して生成中...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    AI投稿生成
                                </>
                            )}
                        </Button>

                        {/* Context Hint */}
                        <div className="text-xs text-muted-foreground p-3 bg-slate-50 rounded border">
                            <span className="font-semibold block mb-1">💡 現在の戦略コンテキスト</span>
                            ターゲット: {persona}<br />
                            強み: {usp}
                        </div>

                    </CardContent>
                </Card>
            </div>

            {/* Right Col: Results */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    生成結果
                </h3>

                {results ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {results.map((item, idx) => (
                            <Card key={idx} className="overflow-hidden">
                                <div className="bg-muted px-4 py-2 border-b flex justify-between items-center">
                                    <span className="font-bold text-sm text-purple-700">案{idx + 1}: {item.title}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => copyToClipboard(`${item.caption}\n\n${item.hashtags}`, idx)}
                                    >
                                        {copiedIndex === idx ? (
                                            <Check className="h-4 w-4 mr-1 text-green-600" />
                                        ) : (
                                            <Copy className="h-4 w-4 mr-1" />
                                        )}
                                        {copiedIndex === idx ? "コピー済" : "全文コピー"}
                                    </Button>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                                        {item.caption}
                                    </div>
                                    <div className="text-sm text-blue-600 font-medium pt-2 border-t border-dashed">
                                        {item.hashtags}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-slate-50/50">
                        <Sparkles className="h-10 w-10 mb-4 opacity-20" />
                        <p>左側のフォームから生成を実行してください</p>
                    </div>
                )}
            </div>
        </div>
    )
}
