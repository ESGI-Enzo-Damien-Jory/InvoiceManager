'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { matchSorter } from 'match-sorter'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ListFiltersProps<T> {
    subtitle: string
    items: T[]
    searchKeys: Array<keyof T>
    onFiltered: (filtered: T[]) => void

    dateRange?: DateRange
    setDateRange: (range: DateRange | undefined) => void
}

export default function ListFilters<T extends Record<string, any>>({
    subtitle,
    items,
    searchKeys,
    onFiltered,
    dateRange,
    setDateRange,
}: ListFiltersProps<T>) {
    const [searchTerm, setSearchTerm] = useState('')
    const from = dateRange?.from
    const to = dateRange?.to

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value
        setSearchTerm(newSearchTerm)

        if (newSearchTerm.trim()) {
            const result = matchSorter(items, newSearchTerm, {
                keys: searchKeys as string[],
            })
            onFiltered(result)
        } else {
            onFiltered(items)
        }
    }

    const applyRange = (fromDate: Date, toDate: Date) =>
        setDateRange({ from: fromDate, to: toDate })

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
                <p className="text-gray-500">{subtitle}</p>

                {/* Fuzzy Search Input */}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                    className="border px-3 py-1 rounded-md focus:ring focus:ring-offset-1 focus:ring-blue-300"
                />
            </div>

            <div className="flex items-center gap-2">
                {/* Preset Period */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">Preset Period</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0" align="start">
                        <div className="flex flex-col">
                            <button
                                className="p-2 text-left hover:bg-gray-100"
                                onClick={() =>
                                    applyRange(new Date(), new Date())
                                }
                            >
                                Today
                            </button>
                            <button
                                className="p-2 text-left hover:bg-gray-100"
                                onClick={() => {
                                    const end = new Date()
                                    const start = new Date(end)
                                    start.setDate(end.getDate() - 6)
                                    applyRange(start, end)
                                }}
                            >
                                Last 7 Days
                            </button>
                            <button
                                className="p-2 text-left hover:bg-gray-100"
                                onClick={() => {
                                    const now = new Date()
                                    applyRange(
                                        new Date(
                                            now.getFullYear(),
                                            now.getMonth(),
                                            1
                                        ),
                                        new Date(
                                            now.getFullYear(),
                                            now.getMonth() + 1,
                                            0
                                        )
                                    )
                                }}
                            >
                                This Month
                            </button>
                            <button
                                className="p-2 text-left hover:bg-gray-100"
                                onClick={() => {
                                    const now = new Date()
                                    applyRange(
                                        new Date(
                                            now.getFullYear(),
                                            now.getMonth() - 1,
                                            1
                                        ),
                                        new Date(
                                            now.getFullYear(),
                                            now.getMonth(),
                                            0
                                        )
                                    )
                                }}
                            >
                                Last Month
                            </button>
                            <button
                                className="p-2 text-left hover:bg-gray-100"
                                onClick={() => setDateRange(undefined)}
                            >
                                Clear
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Date Range Picker */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                'w-64 justify-start text-left font-normal',
                                !from && 'text-muted-foreground'
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {from
                                ? to
                                    ? `${format(from, 'LLL dd, y')} – ${format(to, 'LLL dd, y')}`
                                    : format(from, 'LLL dd, y')
                                : 'Pick a date range'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
