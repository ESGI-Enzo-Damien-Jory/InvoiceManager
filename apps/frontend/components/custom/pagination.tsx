'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    startIndex: number
    endIndex: number
    totalEntries: number
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    startIndex,
    endIndex,
    totalEntries,
}: PaginationProps) {
    return (
        <div className="flex items-center justify-between border-t px-4 py-3 mt-4 bg-[#fafafa]">
            <div className="text-sm text-gray-500">
                Showing {startIndex} to {endIndex} of {totalEntries} entries
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous page</span>
                </Button>

                <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <Button
                            key={i}
                            variant={
                                currentPage === i + 1 ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => onPageChange(i + 1)}
                            className="w-8 h-8 p-0"
                        >
                            {i + 1}
                        </Button>
                    ))}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next page</span>
                </Button>
            </div>
        </div>
    )
}
