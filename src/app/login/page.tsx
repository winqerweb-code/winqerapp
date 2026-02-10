"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { signInWithGoogle, signInWithEmail, signUpWithEmail, supabase } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const { toast } = useToast()

    const handleGoogleLogin = async () => {
        setLoading(true)
        try {
            await signInWithGoogle()
        } catch (error) {
            console.error("Login failed:", error)
            setLoading(false)
            toast({ title: "ログインに失敗しました", description: "もう一度お試しください", variant: "destructive" })
        }
    }

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (isSignUp) {
                await signUpWithEmail(email, password)
                toast({
                    title: "確認メールを送信しました",
                    description: "メール内のリンクをクリックして登録を完了してください。リンクをクリックするまでログインはできません。",
                    duration: 6000,
                })
            } else {
                const data = await signInWithEmail(email, password)

                // Strict check: If email is not confirmed, sign out immediately
                if (data.user && !data.user.email_confirmed_at) {
                    await supabase.auth.signOut()
                    throw new Error("Email not confirmed")
                }

                // Redirect will be handled by auth state change or middleware usually, 
                // but if not, we might need manual redirect. 
                // Assuming auth listener handles it or user stays on page until redirect.
                // For now, let's assume successful login leads to dashboard via middleware/auth hook.
                window.location.href = "/dashboard";
            }
        } catch (error: any) {
            console.error("Auth failed:", error)

            let errorMessage = "もう一度お試しください";
            if (error.message === "User already registered") {
                errorMessage = "このメールアドレスは既に登録されています";
            } else if (error.message === "Invalid login credentials") {
                errorMessage = "メールアドレスまたはパスワードが間違っています";
            } else if (error.message.includes("Password should be at least")) {
                errorMessage = "パスワードは6文字以上で入力してください";
            } else if (error.message.includes("Email not confirmed")) {
                errorMessage = "メールアドレスの認証が完了していません。送信されたメールを確認してください。";
            }

            toast({
                title: isSignUp ? "登録に失敗しました" : "ログインに失敗しました",
                description: errorMessage,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="relative h-32 w-32 mx-auto">
                            <Image
                                src="/images/logo.png"
                                alt="WINQER"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                    <CardTitle className="text-2xl mb-2 text-black">{isSignUp ? "アカウント作成" : "ログイン"}</CardTitle>
                    <CardDescription className="text-gray-700 font-medium">
                        {isSignUp
                            ? "メールアドレスとパスワードで登録してください"
                            : "メールアドレスまたはGoogleアカウントでログインしてください"}
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
                                disabled={loading}
                                className="border-gray-400 text-black placeholder:text-gray-500"
                            />
                            <Input
                                type="password"
                                placeholder="パスワード"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                minLength={6}
                                className="border-gray-400 text-black placeholder:text-gray-500"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 text-base"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                isSignUp ? "アカウント登録" : "ログイン"
                            )}
                        </Button>
                    </form>

                    <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-400" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-black font-medium">または</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            variant="outline"
                            className="w-full h-12 text-base border-gray-400 text-black hover:bg-gray-50"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
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
                            )}
                            Googleでログイン
                        </Button>
                    </div>
                    <div className="mt-4 text-center text-sm">
                        <span className="text-gray-700">
                            {isSignUp ? "すでにアカウントをお持ちですか？" : "アカウントをお持ちでないですか？"}
                        </span>
                        <Button
                            variant="link"
                            className="pl-2 font-semibold text-primary"
                            onClick={() => setIsSignUp(!isSignUp)}
                            disabled={loading}
                        >
                            {isSignUp ? "ログイン" : "新規登録"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
