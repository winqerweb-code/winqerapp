"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface FunnelChartProps {
    data: {
        label: string
        value: number
        fill?: string
    }[]
    height?: number
}

export function FunnelChart({ data, height = 350 }: FunnelChartProps) {
    // Map data to specific funnel stages
    // Expected data order: Impressions, Clicks, Sessions, Conversions
    // or we map by label if possible. For now, assuming order or finding by label.

    const findValue = (key: string) => {
        const item = data.find(d => d.label === key)
        return item ? item.value : 0
    }

    // Fallback if labels don't match exactly, use index
    const getValue = (index: number, key: string) => {
        if (data[index]) return data[index].value
        return findValue(key)
    }

    const stages = [
        { label: "認知", subLabel: "Impressions", value: getValue(0, "Impressions"), color: "#22d3ee" }, // Cyan-400
        { label: "興味・関心", subLabel: "Clicks", value: getValue(1, "Clicks"), color: "#0ea5e9" }, // Sky-500
        { label: "比較・検討", subLabel: "Sessions", value: getValue(2, "Sessions"), color: "#0284c7" }, // Sky-600
        { label: "購入", subLabel: "Conversions", value: getValue(3, "Conversions"), color: "#0c4a6e" }, // Sky-900
    ]

    return (
        <Card className="col-span-4 lg:col-span-2">
            <CardHeader>
                <CardTitle>コンバージョンファネル</CardTitle>
                <CardDescription>ユーザーの離脱ポイントを可視化</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-6">
                <div className="w-full max-w-md relative" style={{ height: height }}>
                    <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-xl">
                        {/* 1. Awareness (Top) */}
                        <path d="M0,0 L400,0 L350,75 L50,75 Z" fill={stages[0].color} />
                        <text x="200" y="30" textAnchor="middle" fill="white" className="text-sm font-bold">
                            {stages[0].label}
                        </text>
                        <text x="200" y="50" textAnchor="middle" fill="white" className="text-xs opacity-90">
                            {stages[0].value.toLocaleString()}
                        </text>

                        {/* 2. Interest */}
                        <path d="M50,75 L350,75 L300,150 L100,150 Z" fill={stages[1].color} />
                        <text x="200" y="105" textAnchor="middle" fill="white" className="text-sm font-bold">
                            {stages[1].label}
                        </text>
                        <text x="200" y="125" textAnchor="middle" fill="white" className="text-xs opacity-90">
                            {stages[1].value.toLocaleString()}
                        </text>

                        {/* 3. Consideration */}
                        <path d="M100,150 L300,150 L250,225 L150,225 Z" fill={stages[2].color} />
                        <text x="200" y="180" textAnchor="middle" fill="white" className="text-sm font-bold">
                            {stages[2].label}
                        </text>
                        <text x="200" y="200" textAnchor="middle" fill="white" className="text-xs opacity-90">
                            {stages[2].value.toLocaleString()}
                        </text>

                        {/* 4. Purchase (Bottom) */}
                        <path d="M150,225 L250,225 L200,300 Z" fill={stages[3].color} />
                        <text x="200" y="250" textAnchor="middle" fill="white" className="text-sm font-bold">
                            {stages[3].label}
                        </text>
                        <text x="200" y="270" textAnchor="middle" fill="white" className="text-xs opacity-90">
                            {stages[3].value.toLocaleString()}
                        </text>
                    </svg>
                </div>
            </CardContent>
        </Card>
    )
}
