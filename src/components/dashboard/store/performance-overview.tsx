import { BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { DateRange } from "react-day-picker"
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

interface PerformanceOverviewProps {
    metrics: any
    adAccounts: any[]
    selectedAdAccountId: string
    onAdAccountChange: (value: string) => void
    dateRange: DateRange | undefined
    onDateRangeChange: (range: DateRange | undefined) => void
}

export function PerformanceOverview({
    metrics,
    adAccounts,
    selectedAdAccountId,
    onAdAccountChange,
    dateRange,
    onDateRangeChange,
}: PerformanceOverviewProps) {
    if (!metrics) return null

    return (
        <Card className="bg-slate-50 border-blue-100">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    パフォーマンス概要 (直近30日)
                </CardTitle>
                {/* Ad Account Selector & Date Picker */}
                <div className="flex items-center gap-2">
                    {adAccounts.length > 0 && (
                        <Select value={selectedAdAccountId} onValueChange={onAdAccountChange}>
                            <SelectTrigger className="w-[200px] h-8 text-xs bg-white">
                                <SelectValue placeholder="広告アカウント選択" />
                            </SelectTrigger>
                            <SelectContent>
                                {adAccounts.map((account) => (
                                    <SelectItem key={account.id} value={account.id}>
                                        {account.name} ({account.id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <DatePickerWithRange
                        className="w-auto"
                        date={dateRange}
                        setDate={onDateRangeChange}
                    />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white rounded-lg border shadow-sm">
                        <p className="text-xs text-muted-foreground">消化金額</p>
                        <p className="text-2xl font-bold text-blue-900">¥{metrics.spend.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border shadow-sm">
                        <p className="text-xs text-muted-foreground">CPA</p>
                        <p className="text-2xl font-bold text-blue-900">¥{metrics.cpa.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">CV: {metrics.cvCount}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border shadow-sm">
                        <p className="text-xs text-muted-foreground">CTR</p>
                        <p className="text-2xl font-bold text-blue-900">{metrics.ctr}%</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Click: {metrics.clicks.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border shadow-sm">
                        <p className="text-xs text-muted-foreground">CVR</p>
                        <p className="text-2xl font-bold text-blue-900">{metrics.cvr}%</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Imp: {metrics.impressions.toLocaleString()}</p>
                    </div>
                </div>

                {/* Charts */}
                {metrics.daily && metrics.daily.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Spend & CPA Chart */}
                        <div className="h-[300px] w-full bg-white p-4 rounded-lg border">
                            <h4 className="text-sm font-medium mb-4 text-center">消化金額 & CPA 推移</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={metrics.daily}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={(value) => value.slice(5)} // MM-DD
                                    />
                                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{ fontSize: 10 }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="spend" name="消化金額" fill="#8884d8" barSize={20} />
                                    <Line yAxisId="right" type="monotone" dataKey="cpa" name="CPA" stroke="#82ca9d" strokeWidth={2} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Clicks & CVR Chart */}
                        <div className="h-[300px] w-full bg-white p-4 rounded-lg border">
                            <h4 className="text-sm font-medium mb-4 text-center">クリック数 & CVR 推移</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={metrics.daily}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={(value) => value.slice(5)} // MM-DD
                                    />
                                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{ fontSize: 10 }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#ff7300" tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="clicks" name="クリック数" fill="#8884d8" barSize={20} />
                                    <Line yAxisId="right" type="monotone" dataKey="cvr" name="CVR (%)" stroke="#ff7300" strokeWidth={2} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
