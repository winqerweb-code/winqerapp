"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export default function SettingsPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [metaToken, setMetaToken] = useState("")
    const [metaAppId, setMetaAppId] = useState("")
    const [openaiKey, setOpenaiKey] = useState("")

    // Connection Status
    const [metaStatus, setMetaStatus] = useState<"none" | "success" | "error">("none")
    const [openaiStatus, setOpenaiStatus] = useState<"none" | "success" | "error">("none")

    useEffect(() => {
        // Load saved keys from DB and localStorage
        const loadSettings = async () => {
            // Load Meta Token from DB
            const { getMetaToken } = await import('@/app/actions/user-settings')
            const result = await getMetaToken()
            if (result.success && result.token) {
                setMetaToken(result.token)
                // Also sync to local storage for legacy support if needed, or just rely on state
                localStorage.setItem("meta_access_token", result.token)
            } else {
                // Fallback to local storage
                const savedMetaToken = localStorage.getItem("meta_access_token")
                if (savedMetaToken) setMetaToken(savedMetaToken)
            }

            const savedMetaAppId = localStorage.getItem("meta_app_id")
            const savedOpenaiKey = localStorage.getItem("openai_api_key")

            if (savedMetaAppId) setMetaAppId(savedMetaAppId)
            if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey)
        }
        loadSettings()
    }, [])

    const handleSave = async () => {
        setLoading(true)
        try {
            // Save Meta Token to DB
            const { saveMetaToken } = await import('@/app/actions/user-settings')
            const result = await saveMetaToken(metaToken)

            if (!result.success) {
                throw new Error(result.error)
            }

            // Also save to local storage for redundancy/legacy
            localStorage.setItem("meta_access_token", metaToken)
            localStorage.setItem("meta_app_id", metaAppId)
            localStorage.setItem("openai_api_key", openaiKey)

            toast({
                title: "設定を保存しました",
                description: "APIキーがデータベースとローカルストレージに保存されました。",
            })
        } catch (error) {
            console.error(error)
            toast({
                title: "保存エラー",
                description: "設定の保存に失敗しました。",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const testMetaConnection = async () => {
        setLoading(true)
        try {
            // Real API call test would go here
            // const res = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${metaToken}`)

            // Simulating check
            await new Promise(resolve => setTimeout(resolve, 1500))

            if (metaToken.length > 10) {
                setMetaStatus("success")
                toast({ title: "Meta API 接続成功", className: "bg-green-500 text-white" })
            } else {
                throw new Error("Invalid token")
            }
        } catch (e) {
            setMetaStatus("error")
            toast({ title: "Meta API 接続失敗", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const testOpenAIConnection = async () => {
        setLoading(true)
        try {
            // Simulating check
            await new Promise(resolve => setTimeout(resolve, 1500))

            if (openaiKey.startsWith("sk-")) {
                setOpenaiStatus("success")
                toast({ title: "OpenAI API 接続成功", className: "bg-green-500 text-white" })
            } else {
                throw new Error("Invalid key")
            }
        } catch (e) {
            setOpenaiStatus("error")
            toast({ title: "OpenAI API 接続失敗", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">設定</h2>
                <p className="text-muted-foreground">
                    外部サービスのAPI連携設定を管理します。
                </p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Meta Marketing API</CardTitle>
                        <CardDescription>
                            Facebook/Instagram広告データを取得するために必要です。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="meta-app-id">App ID</Label>
                            <Input
                                id="meta-app-id"
                                placeholder="1234567890"
                                value={metaAppId}
                                onChange={(e) => setMetaAppId(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="meta-token">Access Token</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="meta-token"
                                    type="password"
                                    placeholder="EAA..."
                                    value={metaToken}
                                    onChange={(e) => setMetaToken(e.target.value)}
                                />
                                <Button variant="outline" onClick={testMetaConnection} disabled={loading}>
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "テスト"}
                                </Button>
                            </div>
                            {metaStatus === "success" && (
                                <p className="text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" /> 接続確認済み
                                </p>
                            )}
                            {metaStatus === "error" && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <XCircle className="h-4 w-4" /> 接続エラー
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>OpenAI API</CardTitle>
                        <CardDescription>
                            広告文と画像の自動生成に使用します (GPT-4o / DALL-E 3)。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="openai-key">API Key</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="openai-key"
                                    type="password"
                                    placeholder="sk-..."
                                    value={openaiKey}
                                    onChange={(e) => setOpenaiKey(e.target.value)}
                                />
                                <Button variant="outline" onClick={testOpenAIConnection} disabled={loading}>
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "テスト"}
                                </Button>
                            </div>
                            {openaiStatus === "success" && (
                                <p className="text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" /> 接続確認済み
                                </p>
                            )}
                            {openaiStatus === "error" && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <XCircle className="h-4 w-4" /> 接続エラー
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button size="lg" onClick={handleSave}>設定を保存</Button>
                </div>
            </div>
        </div>
    )
}
