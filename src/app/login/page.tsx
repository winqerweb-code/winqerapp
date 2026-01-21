"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signInWithGoogle } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isSignUp, setIsSignUp] = useState(false)
    const [message, setMessage] = useState("")
    const { toast } = useToast()

    const handleGoogleLogin = async () => {
        setLoading(true)
        try {
            await signInWithGoogle()
        } catch (error) {
            console.error("Login failed:", error)
            setLoading(false)
        }
    }

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        try {
            const { signInWithEmail, signUpWithEmail } = await import("@/lib/auth")

            if (isSignUp) {
                await signUpWithEmail(email, password)
                setMessage("確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。")
                toast({ title: "確認メールを送信しました", description: "メールを確認してください。" })
            } else {
                await signInWithEmail(email, password)
                // Redirect is handled by middleware/auth state change usually, 
                // but we can force reload or router push if needed.
                // For now, let the onAuthStateChange in layout handle it or just wait.
                window.location.href = "/dashboard"
            }
        } catch (error: any) {
            console.error("Auth failed:", error)
            setMessage(error.message || "認証に失敗しました")
            toast({ title: "エラー", description: error.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="relative h-12 w-48">
                            <Image
                                src="/images/logo-black.png"
                                alt="WINQER"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                    <CardDescription>
                        {isSignUp ? "新しいアカウントを作成します" : "アカウントにログインしてダッシュボードにアクセスしてください"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 mb-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="メールアドレス"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="text-black"
                            />
                            <Input
                                type="password"
                                placeholder="パスワード"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="text-black"
                            />
                        </div>

                        {message && (
                            <p className={`text-sm ${isSignUp ? "text-green-600" : "text-red-500"}`}>
                                {message}
                            </p>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSignUp ? "アカウント作成" : "ログイン"}
                        </Button>
                    </form>

                    <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                または
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                        >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
                            Googleでログイン
                        </Button>
                    </div>

                    <div className="mt-4 text-center text-sm">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-blue-600 hover:underline"
                        >
                            {isSignUp ? "すでにアカウントをお持ちの方はこちら" : "アカウントをお持ちでない方はこちら"}
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
