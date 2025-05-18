'use client'

import React from 'react'
import { Search } from 'lucide-react'

interface ListHeaderProps {
    subtitle: string
    searchValue: string
    onSearchChange: (value: string) => void
    placeholder?: string
}

export default function ListHeader({
    subtitle,
    searchValue,
    onSearchChange,
    placeholder = 'Search...',
}: ListHeaderProps) {
    return (
        <div className="flex justify-between items-center">
            <p className="text-gray-500">{subtitle}</p>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder={placeholder}
                    className="pl-10 pr-4 py-2 border rounded-md"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
        </div>
    )
}
