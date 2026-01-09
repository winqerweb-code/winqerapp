"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface Option {
    id: string
    label: string
    subLabel?: string
}

interface IdInputWithSelectProps {
    label: string
    value: string
    onChange: (value: string) => void
    onSave: (value: string) => Promise<void>
    options: Option[]
    placeholder?: string
    buttonLabel?: string
    onFetch?: () => Promise<void>
    isLoadingFetch?: boolean
    isLoadingSave?: boolean
    disabled?: boolean
    fetchLabel?: string
}

export function IdInputWithSelect({
    label,
    value,
    onChange,
    onSave,
    options,
    placeholder = "IDを入力または選択",
    buttonLabel = "保存",
    onFetch,
    isLoadingFetch = false,
    isLoadingSave = false,
    disabled = false,
    fetchLabel = "取得"
}: IdInputWithSelectProps) {
    const [localValue, setLocalValue] = useState(value)

    // Update local state when prop changes
    useEffect(() => {
        setLocalValue(value)
    }, [value])

    const handleSelectChange = (val: string) => {
        setLocalValue(val)
        onChange(val)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setLocalValue(val)
        onChange(val)
    }

    const handleSave = async () => {
        await onSave(localValue)
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label>{label}</Label>
                {onFetch && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onFetch}
                        disabled={isLoadingFetch || disabled}
                        className="h-7 text-xs"
                    >
                        <RefreshCw className={cn("h-3 w-3 mr-1", isLoadingFetch && "animate-spin")} />
                        {fetchLabel}
                    </Button>
                )}
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        value={localValue}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="pr-8 bg-background"
                    />
                    {options.length > 0 && (
                        <div className="absolute right-0 top-0 h-full w-8">
                            <Select onValueChange={handleSelectChange} disabled={disabled}>
                                <SelectTrigger className="h-full w-full border-0 bg-transparent p-0 focus:ring-0 opacity-0 absolute top-0 left-0 z-10 cursor-pointer">
                                    <span className="sr-only">選択</span>
                                </SelectTrigger>
                                <div className="absolute top-0 right-0 h-full w-full flex items-center justify-center pointer-events-none border-l bg-accent/10">
                                    <span className="text-[10px] text-muted-foreground mr-0.5">▼</span>
                                </div>
                                <SelectContent align="end" className="w-[300px]">
                                    {options.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            候補がありません
                                        </div>
                                    ) : (
                                        options.map((opt) => (
                                            <SelectItem key={opt.id} value={opt.id} className="cursor-pointer">
                                                <div className="flex flex-col text-left">
                                                    <span className="font-medium truncate">{opt.label}</span>
                                                    {opt.subLabel && (
                                                        <span className="text-xs text-muted-foreground truncate">
                                                            {opt.subLabel}
                                                        </span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <Button
                    onClick={handleSave}
                    disabled={isLoadingSave || disabled || !localValue}
                    size="default"
                >
                    {isLoadingSave ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                </Button>
            </div>
            {localValue && options.find(o => o.id === localValue) && (
                <p className="text-xs text-muted-foreground ml-1">
                    選択中: {options.find(o => o.id === localValue)?.label}
                </p>
            )}
        </div>
    )
}
