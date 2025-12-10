"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface CreativeComparisonProps {
    data: {
        name: string
        ctr: number
        cvr: number
        cpa: number
    }[]
    height?: number
}

export function CreativeComparison({ data, height = 400 }: CreativeComparisonProps) {
    return (
        <Card className="col-span-4 lg:col-span-2">
            <CardHeader>
                <CardTitle>クリエイティブ別パフォーマンス</CardTitle>
                <CardDescription>CTR / CVR / CPA の比較</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            tick={{ fontSize: 10 }}
                            interval={0}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            labelStyle={{ color: "#333" }}
                        />
                        <Legend />
                        <Bar dataKey="ctr" name="CTR (%)" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20} />
                        <Bar dataKey="cvr" name="CVR (%)" fill="#82ca9d" radius={[0, 4, 4, 0]} barSize={20} />
                        {/* CPA is usually much larger, so it might distort the chart if on same axis. 
                For now, we keep it simple or maybe omit CPA if scale is too different. 
                Let's keep it but user might want to separate it later. */}
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
