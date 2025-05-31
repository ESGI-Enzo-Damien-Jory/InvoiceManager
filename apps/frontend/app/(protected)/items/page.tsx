'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Topbar from '@/components/custom/top-bar'
import CommonPageLayout from '@/components/custom/common-page-layout'
import CommonCenterLayout from '@/components/custom/common-center-layout'
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
import { Item } from '@/types/items'
import { Box } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export default function ItemsPage() {
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const getToken = useCallback((): string | null => {
        try {
            return localStorage.getItem('token')
        } catch {
            return null
        }
    }, [])

    const loadItems = useCallback(async (): Promise<void> => {
        setLoading(true)
        setError(null)

        const token = getToken()
        if (!token) {
            setError('Auth token missing. Please log in.')
            setLoading(false)
            return
        }

        try {
            const res = await fetch(`${API_URL}/api/items`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!res.ok) {
                throw new Error(
                    `Failed to fetch items: ${res.status} ${res.statusText}`
                )
            }

            const data: Item[] = await res.json()
            setItems(data)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError(String(err))
            }
        } finally {
            setLoading(false)
        }
    }, [getToken])

    useEffect(() => {
        loadItems()
    }, [loadItems])

    if (loading) return <LoadingState message="Loading items..." />
    if (error) return <ErrorState message={error} onRetry={loadItems} />

    if (items.length === 0) {
        return (
            <CommonPageLayout>
                <Topbar subtitle="Overview" title="Items">
                    <Link href="/items/new">
                        <Button>Add New Item</Button>
                    </Link>
                </Topbar>
                <div className='flex h-full'>
                    <EmptyState
                        title="No items yet"
                        description="Start by adding your first item."
                        linkText="Create an item"
                        linkHref="/items/new"
                        icon={
                            <Box className="h-12 w-12 text-muted-foreground" />
                        }
                    />
                </div>
            </CommonPageLayout>
        )
    }

    return (
        <CommonPageLayout>
            <Topbar subtitle="Overview" title="Items">
                <Link href="/items/new">
                    <Button>Add New Item</Button>
                </Link>
            </Topbar>

            <CommonCenterLayout>
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
                                    {new Date(
                                        item.updated_at
                                    ).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CommonCenterLayout>
        </CommonPageLayout>
    )
}
