"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface RegionComparisonProps {
    data: {
        region: string
        cvr: number
        cpc: number
        ctr: number
        spend: number
    }[]
    height?: number
}

export function RegionComparison({ data, height = 300 }: RegionComparisonProps) {
    if (!data || data.length === 0) return null

    return (
        <Card className="col-span-4 lg:col-span-2">
            <CardHeader>
                <CardTitle>地域別パフォーマンス</CardTitle>
                <CardDescription>地域ごとの効率比較</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="region"
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
                            tickFormatter={(val) => `${val}%`}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `¥${val}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            labelStyle={{ color: "#333" }}
                            formatter={(value: number, name: string) => [
                                name === 'CVR' || name === 'CTR' ? `${value}%` : `¥${value.toLocaleString()}`,
                                name
                            ]}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="ctr" name="CTR" fill="#ffc658" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="spend" name="消化金額" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
