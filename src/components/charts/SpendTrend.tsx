"use client"

import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface SpendTrendProps {
    data: {
        month: string
        spend: number
        cv: number
        cpa: number
    }[]
    height?: number
}

export function SpendTrend({ data, height = 350 }: SpendTrendProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>月次成果推移 (Spend / CV / CPA)</CardTitle>
                <CardDescription>広告費と獲得成果の相関を確認します</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={height}>
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `¥${value.toLocaleString()}`}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            formatter={(value: number, name: string) => {
                                if (name === "Spend" || name === "CPA") return [`¥${value.toLocaleString()}`, name]
                                return [value, name]
                            }}
                            labelStyle={{ color: "#333" }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="spend" name="Spend" fill="#adfa1d" radius={[4, 4, 0, 0]} barSize={40} fillOpacity={0.8} />
                        <Line yAxisId="right" type="monotone" dataKey="cv" name="CV" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                        <Line yAxisId="left" type="monotone" dataKey="cpa" name="CPA" stroke="#ff6b6b" strokeWidth={2} dot={{ r: 4 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
