"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface DemographicsChartsProps {
    data: {
        gender: { gender: string, spend: number, ctr: number }[]
        age: { age: string, spend: number, ctr: number }[]
    }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function DemographicsCharts({ data }: DemographicsChartsProps) {
    if (!data || (!data.gender && !data.age)) return null

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Gender Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>性別パフォーマンス</CardTitle>
                    <CardDescription>性別ごとの消化金額とCTR</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.gender}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: { name: string, percent?: number }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="spend"
                                    nameKey="gender"
                                >
                                    {data.gender.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* CTR Table for Gender */}
                    <div className="mt-4">
                        <div className="grid grid-cols-3 gap-2 text-sm font-medium border-b pb-2 mb-2">
                            <div>性別</div>
                            <div className="text-right">消化金額</div>
                            <div className="text-right">CTR</div>
                        </div>
                        {data.gender.map((item, i) => (
                            <div key={i} className="grid grid-cols-3 gap-2 text-sm py-1">
                                <div>{item.gender}</div>
                                <div className="text-right">¥{Math.round(item.spend).toLocaleString()}</div>
                                <div className="text-right">{item.ctr.toFixed(2)}%</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Age Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>年齢別パフォーマンス</CardTitle>
                    <CardDescription>年齢層ごとの消化金額とCTR</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.age} layout="vertical" margin={{ left: 10, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="age" type="category" width={40} fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    name === 'spend' ? `¥${value.toLocaleString()}` : `${value.toFixed(2)}%`,
                                    name === 'spend' ? '消化金額' : 'CTR'
                                ]}
                            />
                            <Bar dataKey="spend" name="spend" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                    {/* CTR Table for Age */}
                    <div className="mt-4">
                        <div className="grid grid-cols-3 gap-2 text-sm font-medium border-b pb-2 mb-2">
                            <div>年齢</div>
                            <div className="text-right">消化金額</div>
                            <div className="text-right">CTR</div>
                        </div>
                        {data.age.map((item, i) => (
                            <div key={i} className="grid grid-cols-3 gap-2 text-sm py-1">
                                <div>{item.age}</div>
                                <div className="text-right">¥{Math.round(item.spend).toLocaleString()}</div>
                                <div className="text-right">{item.ctr.toFixed(2)}%</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
