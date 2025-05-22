'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import * as React from 'react'
import { format } from 'date-fns'

import {
    Plus,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    CalendarIcon,
} from 'lucide-react'
import { DateRange } from 'react-day-picker'
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table'

interface CardStatsProps {
    discreteTitle: string
    value: number
    percentageValue: number
}

function CardStats({ discreteTitle, value, percentageValue }: CardStatsProps) {
    return (
        <div>
            <p className="text-gray-500">{discreteTitle}</p>
            <h1 className="text-4xl font-bold">{value}</h1>
            <div className="flex">
                <p className="text-gray-600 text-sm">
                    vs last week {percentageValue}%
                </p>
                {percentageValue > 0 ? (
                    <ArrowUpRight className="text-green-400" />
                ) : (
                    <ArrowDownRight className="text-red-400" />
                )}
            </div>
        </div>
    )
}

export default function Invoices() {
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
        undefined
    )

    return (
        <>
            <div className="flex justify-between px-4 h-1/12">
                <div>
                    <p className="text-gray-500">Overview</p>
                    <h1 className="text-4xl font-bold">Invoice</h1>
                </div>
                <div className="flex align-center gap-2 justify-center p-4">
                    <Button>
                        <Search />
                    </Button>
                    <Button>Send Statements</Button>
                    <Button>Import</Button>
                    <Button>
                        <Plus />
                        New Invoice
                    </Button>
                </div>
            </div>
            <div className="bg-gray-50 p-6 h-10/12">
                <div className="flex justify-between border rounded-xl py-10 px-12">
                    <CardStats
                        discreteTitle="Paid"
                        value={18}
                        percentageValue={-4.2}
                    />
                    <div className="hidden md:block">
                        <Separator
                            orientation="vertical"
                            className="mx-auto h-[120px]"
                        />
                    </div>
                    <CardStats
                        discreteTitle="Sent"
                        value={25}
                        percentageValue={4.8}
                    />
                    <div className="hidden md:block">
                        <Separator
                            orientation="vertical"
                            className="mx-auto h-[120px]"
                        />
                    </div>
                    <CardStats
                        discreteTitle="Pending"
                        value={10}
                        percentageValue={-2}
                    />
                    <div className="hidden md:block">
                        <Separator
                            orientation="vertical"
                            className="mx-auto h-[120px]"
                        />
                    </div>
                    <CardStats
                        discreteTitle="Overdue"
                        value={2}
                        percentageValue={-1}
                    />
                </div>
                <div className="flex justify-between px-2 pt-4 pb-2">
                    <p className="text-gray-500">Invoice List</p>
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline">Preset Period</Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-[200px] p-0"
                                align="start"
                            >
                                <div className="flex flex-col">
                                    <button
                                        className="p-2 text-left hover:bg-gray-100"
                                        onClick={() =>
                                            setDateRange({
                                                from: new Date(),
                                                to: new Date(),
                                            })
                                        }
                                    >
                                        Today
                                    </button>
                                    <button
                                        className="p-2 text-left hover:bg-gray-100"
                                        onClick={() => {
                                            const to = new Date()
                                            const from = new Date()
                                            from.setDate(to.getDate() - 6)
                                            setDateRange({ from, to })
                                        }}
                                    >
                                        Last 7 days
                                    </button>
                                    <button
                                        className="p-2 text-left hover:bg-gray-100"
                                        onClick={() => {
                                            const now = new Date()
                                            const from = new Date(
                                                now.getFullYear(),
                                                now.getMonth(),
                                                1
                                            )
                                            const to = new Date(
                                                now.getFullYear(),
                                                now.getMonth() + 1,
                                                0
                                            )
                                            setDateRange({ from, to })
                                        }}
                                    >
                                        This month
                                    </button>
                                    <button
                                        className="p-2 text-left hover:bg-gray-100"
                                        onClick={() => {
                                            const now = new Date()
                                            const from = new Date(
                                                now.getFullYear(),
                                                now.getMonth() - 1,
                                                1
                                            )
                                            const to = new Date(
                                                now.getFullYear(),
                                                now.getMonth(),
                                                0
                                            )
                                            setDateRange({ from, to })
                                        }}
                                    >
                                        Last month
                                    </button>
                                    <button
                                        className="p-2 text-left hover:bg-gray-100"
                                        onClick={() => setDateRange(undefined)}
                                    >
                                        Custom range...
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
                                        'w-[280px] justify-start text-left font-normal',
                                        !dateRange?.from &&
                                            !dateRange?.to &&
                                            'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(
                                                    dateRange.from,
                                                    'LLL dd, y'
                                                )}{' '}
                                                –{' '}
                                                {format(
                                                    dateRange.to,
                                                    'LLL dd, y'
                                                )}
                                            </>
                                        ) : (
                                            format(dateRange.from, 'LLL dd, y')
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    initialFocus
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">
                                    Invoice
                                </TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Amount
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">
                                    INV001
                                </TableCell>
                                <TableCell>Web Services</TableCell>
                                <TableCell>Enzo Hugonnier</TableCell>
                                <TableCell>Paid</TableCell>
                                <TableCell className="text-right">
                                    $250.00
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    )
}
