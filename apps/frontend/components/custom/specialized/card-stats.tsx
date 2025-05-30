import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

interface CardStatsProps {
    title: string
    value: number
    delta: number
}

export default function CardStats({ title, value, delta }: CardStatsProps) {
    return (
        <div className="flex-1 text-center">
            <p className="text-gray-500">{title}</p>
            <h2 className="text-4xl font-bold">{value}</h2>
            <div className="flex items-center justify-center text-sm text-gray-600">
                <span className="mr-1">vs last week {delta}%</span>
                {delta > 0 ? (
                    <ArrowUpRight className="text-green-400" />
                ) : (
                    <ArrowDownRight className="text-red-400" />
                )}
            </div>
        </div>
    )
}
