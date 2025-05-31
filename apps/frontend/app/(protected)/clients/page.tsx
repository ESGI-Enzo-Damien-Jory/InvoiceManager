'use client'
import React, {
    useState,
    useEffect,
    useMemo,
    useCallback, // ← on importe useCallback
} from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Users, UserPlus, UserCheck, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Topbar from '@/components/custom/top-bar'
import CommonPageLayout from '@/components/custom/common-page-layout'
import Pagination from '@/components/custom/pagination'
import ListHeader from '@/components/custom/list-header'
import CommonCenterLayout from '@/components/custom/common-center-layout'
import ClientGrid from '@/components/custom/specialized/client-grid'
import LoadingState from '@/components/custom/loading-state'
import ErrorState from '@/components/custom/error-state'
import EmptyState from '@/components/custom/empty-state'

interface Client {
    id: string
    first_name: string
    last_name: string
    email: string
    phone_number: string | null
    address: string | null
    avatar: string | null
    updated_at: string
    total_invoices: number
    total_revenue: number
    unpaid_amount: number
    status: 'Active' | 'Inactive'
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')

    const itemsPerPage = 6

    // on peut directement lire le token ici
    const getToken = useCallback((): string | null => {
        try {
            return localStorage.getItem('token')
        } catch {
            return null
        }
    }, [])

    const loadClients = useCallback(async (): Promise<void> => {
        setLoading(true)
        setError(null)

        const token = getToken()
        if (!token) {
            setError('Auth token missing. Please log in.')
            setLoading(false)
            return
        }

        try {
            const res = await fetch(`${API_URL}/api/clients`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!res.ok) {
                throw new Error(
                    `Failed to fetch clients: ${res.status} ${res.statusText}`
                )
            }

            const data: Client[] = await res.json()
            setClients(data)
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
        loadClients()
    }, [loadClients])

    const filtered = useMemo(() => {
        const term = searchTerm.toLowerCase()
        return term
            ? clients.filter(
                  (c) =>
                      c.first_name.toLowerCase().includes(term) ||
                      c.last_name.toLowerCase().includes(term) ||
                      c.email.toLowerCase().includes(term)
              )
            : clients
    }, [clients, searchTerm])

    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const startIdx = (currentPage - 1) * itemsPerPage
    const endIdx = startIdx + itemsPerPage
    const currentClients = filtered.slice(startIdx, endIdx)

    const numFmt = useMemo(
        () => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }),
        []
    )

    if (loading) return <LoadingState message="Loading clients..." />
    if (error) return <ErrorState message={error} onRetry={loadClients} />
    if (filtered.length === 0)
        return (
            <CommonPageLayout>
                <CommonCenterLayout>
                    <EmptyState
                        icon={<Users className="h-12 w-12 text-muted-foreground" />}
                        title="No clients yet"
                        description="Start by adding your first client to track invoices and revenue."
                        linkText="Add a client"
                        linkHref="/clients/new"
                    />
                </CommonCenterLayout>
            </CommonPageLayout>
        )

    return (
        <CommonPageLayout>
            <Topbar subtitle="Overview" title="Clients">
                <Link href="/clients/new">
                    <Button>
                        <UserPlus className="mr-2 h-5 w-5" /> New Client
                    </Button>
                </Link>
            </Topbar>

            <CommonCenterLayout>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {[
                        {
                            icon: (
                                <Users className="h-5 w-5 text-muted-foreground" />
                            ),
                            label: 'Total Clients',
                            value: numFmt.format(clients.length),
                        },
                        {
                            icon: (
                                <UserCheck className="h-5 w-5 text-green-500" />
                            ),
                            label: 'Active Clients',
                            value: numFmt.format(
                                clients.filter((c) => c.status === 'Active')
                                    .length
                            ),
                        },
                        {
                            icon: (
                                <DollarSign className="h-5 w-5 text-yellow-500" />
                            ),
                            label: 'Total Unpaid',
                            value: `$${numFmt.format(
                                clients.reduce(
                                    (sum, c) => sum + c.unpaid_amount,
                                    0
                                )
                            )}`,
                        },
                    ].map(({ icon, label, value }) => (
                        <Card key={label}>
                            <CardContent className="flex items-center space-x-3">
                                {icon}
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {label}
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {value}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <ListHeader
                    subtitle="Client List"
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search clients..."
                />
                <ClientGrid clients={currentClients} linkPrefix="/clients" />
            </CommonCenterLayout>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                startIndex={startIdx + 1}
                endIndex={Math.min(endIdx, filtered.length)}
                totalEntries={filtered.length}
            />
        </CommonPageLayout>
    )
}
