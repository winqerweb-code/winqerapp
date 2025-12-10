"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

interface KpiData {
    label: string
    current: number
    previous: number
    unit: string
    format?: (val: number) => string
    inverse?: boolean // If true, lower is better (e.g. CPA, CPC)
}

interface KpiMoMCardsProps {
    data: KpiData[]
}

export function KpiMoMCards({ data }: KpiMoMCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data.map((item, index) => {
                const diff = item.current - item.previous
                const diffPercent = item.previous ? (diff / item.previous) * 100 : 0

                // Determine if the change is "good" or "bad"
                // Default: Increase is good (green), Decrease is bad (red)
                // Inverse: Increase is bad (red), Decrease is good (green)
                let isPositive = diff > 0
                let isGood = item.inverse ? !isPositive : isPositive

                // Handle zero diff
                if (diff === 0) isGood = true // Neutral

                return (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {item.format ? item.format(item.current) : item.current.toLocaleString()}
                                <span className="text-sm font-normal text-muted-foreground ml-1">{item.unit}</span>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <span className="mr-1">先月: {item.format ? item.format(item.previous) : item.previous.toLocaleString()}</span>

                                {diff !== 0 ? (
                                    <span className={`flex items-center ${isGood ? "text-green-500" : "text-red-500"} ml-auto font-medium`}>
                                        {diff > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                                        {Math.abs(diffPercent).toFixed(1)}%
                                    </span>
                                ) : (
                                    <span className="flex items-center text-gray-500 ml-auto font-medium">
                                        <Minus className="h-3 w-3 mr-1" />
                                        0.0%
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
