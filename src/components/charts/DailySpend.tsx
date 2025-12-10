"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface DailySpendProps {
    data: {
        date: string
        spend: number
    }[]
    height?: number
}

export function DailySpend({ data, height = 300 }: DailySpendProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>日別広告費消化</CardTitle>
                <CardDescription>日々の予算消化状況を確認</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => val.slice(5)} // Show MM-DD
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `¥${value.toLocaleString()}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            formatter={(value: number) => [`¥${value.toLocaleString()}`, "Spend"]}
                            labelStyle={{ color: "#333" }}
                        />
                        <Bar dataKey="spend" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
