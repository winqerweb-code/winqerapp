'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, CheckCircle2, Lock, Key } from 'lucide-react'
import { ApiKeyStatus } from '@/app/actions/api-key-actions'

interface SecureApiKeyInputProps {
    label: string
    description?: string
    onSave: (key: string) => Promise<{ success: boolean; error?: string }>
    fetchStatus: () => Promise<{ success: boolean; data?: ApiKeyStatus; error?: string }>
    placeholder?: string
}

export function SecureApiKeyInput({
    label,
    description,
    onSave,
    fetchStatus,
    placeholder = "sk-..."
}: SecureApiKeyInputProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState<ApiKeyStatus | null>(null)
    const [inputValue, setInputValue] = useState('')
    const [isEditing, setIsEditing] = useState(false)

    const loadStatus = useCallback(async () => {
        try {
            const result = await fetchStatus()
            if (result.success && result.data) {
                setStatus(result.data)
            }
        } catch (error) {
            console.error('Failed to load API key status', error)
        } finally {
            setLoading(false)
        }
    }, [fetchStatus])

    useEffect(() => {
        loadStatus()
    }, [loadStatus])

    const handleSave = async () => {
        if (!inputValue.trim()) return

        setSaving(true)
        try {
            const result = await onSave(inputValue)
            if (result.success) {
                toast({
                    title: "APIキーを保存しました",
                    description: "安全にデータベースへ保存されました。",
                    className: "bg-green-500 text-white border-green-600",
                })
                setInputValue('')
                setIsEditing(false)
                await loadStatus() // Refresh status to show masked key
            } else {
                throw new Error(result.error || "Unknown error")
            }
        } catch (error: any) {
            toast({
                title: "保存エラー",
                description: error.message || "APIキーの保存に失敗しました。",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-2 animate-pulse">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-10 w-full bg-muted rounded"></div>
            </div>
        )
    }

    const hasKey = status?.hasApiKey
    const maskedKey = status?.last4 ? `••••••••••••${status.last4}` : null

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {description && <p className="text-sm text-muted-foreground mb-2">{description}</p>}

            <div className="flex gap-2 items-start">
                <div className="relative flex-1">
                    {!isEditing && hasKey ? (
                        <div className="flex items-center justify-between h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                            <div className="flex items-center gap-2 text-muted-foreground font-mono">
                                <Lock className="h-4 w-4" />
                                <span>{maskedKey}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> 設定済み
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <Input
                                type="password"
                                placeholder={placeholder}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="pr-10"
                                autoComplete="off"
                            />
                            <div className="absolute right-3 top-3 text-muted-foreground">
                                <Key className="h-4 w-4 opacity-50" />
                            </div>
                        </div>
                    )}
                </div>

                {(!isEditing && hasKey) ? (
                    <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                    >
                        変更
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        {hasKey && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setIsEditing(false)
                                    setInputValue('')
                                }}
                            >
                                キャンセル
                            </Button>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={saving || !inputValue.trim()}
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "保存"}
                        </Button>
                    </div>
                )}
            </div>

            {isEditing && (
                <p className="text-xs text-muted-foreground mt-1">
                    <Lock className="h-3 w-3 inline mr-1" />
                    新しいキーを入力して保存すると、以前のキーは上書きされます。
                </p>
            )}
        </div>
    )
}
