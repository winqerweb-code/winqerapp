"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

// Mock status for now (since we removed client-side key checks)
// In a real implementation, we'd fetch "integration status" from a server action that checks if keys exist for the assigned store.
// But for "Global Settings" (User Settings), clients NO LONGER HAVE ACCESS.
// This page should probably be removed or repurposed for "User Profile" only.
// The prompt says: "Client Admin: Restricted access (View Data, Use Features)".
// "Authentication information and linkage settings must not be handled".

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">設定</h2>
                <p className="text-muted-foreground">
                    アカウント設定と連携ステータス
                </p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>外部サービス連携</CardTitle>
                        <CardDescription>
                            連携設定は管理者が行います。変更が必要な場合は運営にお問い合わせください。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="font-medium">Meta Marketing API</div>
                            </div>
                            <Badge variant="outline" className="gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                <span>管理・運用中</span>
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="font-medium">OpenAI API</div>
                            </div>
                            <Badge variant="outline" className="gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                <span>有効</span>
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="font-medium">Google Gemini API</div>
                            </div>
                            <Badge variant="outline" className="gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                <span>有効</span>
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>アカウント情報</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            ログイン中のアカウント: (Google認証済み)
                        </p>
                        {/* We could show the email here if we fetch it */}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
