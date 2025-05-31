'use client'

import React from 'react'
import LoadingState from '@/components/custom/loading-state'
import ErrorState from '@/components/custom/error-state'
import EmptyState from '@/components/custom/empty-state'
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table'
import { Box } from 'lucide-react'
import { useItems } from '@/hooks/use-items'

export default function ItemsPage() {
    const { data: items, status, error, refetch } = useItems()

    if (status === 'pending') {
        return <LoadingState message="Loading items..." />
    }

    if (status === 'error') {
        return (
            <ErrorState
                message={error?.message || 'An error occurred'}
                onRetry={() => refetch()}
            />
        )
    }

    if (items.length === 0) {
        return (
            <EmptyState
                title="No items yet"
                description="Start by adding your first item."
                linkText="Create an item"
                linkHref="/items/new"
                icon={<Box className="h-12 w-12 text-muted-foreground" />}
            />
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price ($)</TableHead>
                    <TableHead>Last Updated</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.price.toFixed(2)}</TableCell>
                        <TableCell>
                            {new Date(item.updated_at).toLocaleDateString()}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
