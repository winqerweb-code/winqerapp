"use client"

import * as React from "react"
import { addDays, format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerWithRange({
    className,
    date,
    setDate,
}: React.HTMLAttributes<HTMLDivElement> & {
    date?: DateRange
    setDate?: (date: DateRange | undefined) => void
}) {
    // Internal state fallback if not controlled
    const [internalDate, setInternalDate] = React.useState<DateRange | undefined>({
        from: new Date(2023, 0, 20),
        to: addDays(new Date(2023, 0, 20), 20),
    })

    const selectedDate = date || internalDate
    const onSelect = setDate || setInternalDate

    // Preset Options
    const presets = [
        {
            label: "今日",
            date: { from: new Date(), to: new Date() }
        },
        {
            label: "昨日",
            date: { from: subDays(new Date(), 1), to: subDays(new Date(), 1) }
        },
        {
            label: "過去7日間",
            date: { from: subDays(new Date(), 7), to: new Date() }
        },
        {
            label: "過去30日間",
            date: { from: subDays(new Date(), 30), to: new Date() }
        },
        {
            label: "今月",
            date: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) }
        },
        {
            label: "先月",
            date: { from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }
        },
    ]

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate?.from ? (
                            selectedDate.to ? (
                                <>
                                    {format(selectedDate.from, "yyyy/MM/dd")} -{" "}
                                    {format(selectedDate.to, "yyyy/MM/dd")}
                                </>
                            ) : (
                                format(selectedDate.from, "yyyy/MM/dd")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex flex-col sm:flex-row">
                        <div className="p-3 bg-muted/30 border-r border-border min-w-[140px] space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">期間を選択</p>
                            {presets.map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-xs h-8"
                                    onClick={() => onSelect(preset.date)}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                        <div className="p-0">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={selectedDate?.from}
                                selected={selectedDate}
                                onSelect={onSelect}
                                numberOfMonths={2}
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
