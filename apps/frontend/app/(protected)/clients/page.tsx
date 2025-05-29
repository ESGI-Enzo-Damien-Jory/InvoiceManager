'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Users, AlertCircle, UserCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Topbar from '@/components/custom/top-bar'
import CommonPageLayout from '@/components/custom/common-page-layout'
import Pagination from '@/components/custom/pagination'
import ListHeader from '@/components/custom/list-header'
import CommonCenterLayout from '@/components/custom/common-center-layout'
import ClientGrid from '@/components/custom/specialized/client-grid'

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

const sampleClients: Client[] = [
    {
        id: '1',
        first_name: 'Enzo',
        last_name: 'Hugonnier',
        email: 'enzo@example.com',
        phone_number: '+33 6 12 34 56 78',
        address: '123 Avenue des Champs-Élysées, Paris, France',
        avatar: null,
        updated_at: new Date().toISOString(),
        total_invoices: 3,
        total_revenue: 1250.0,
        unpaid_amount: 0,
        status: 'Active',
    },
    {
        id: '2',
        first_name: 'Alice',
        last_name: 'Dupont',
        email: 'alice@example.com',
        phone_number: '+33 6 23 45 67 89',
        address: '45 Rue de Rivoli, Paris, France',
        avatar: null,
        updated_at: new Date(
            new Date().setDate(new Date().getDate() - 3)
        ).toISOString(),
        total_invoices: 2,
        total_revenue: 400.0,
        unpaid_amount: 400.0,
        status: 'Active',
    },
    {
        id: '3',
        first_name: 'Bob',
        last_name: 'Martin',
        email: 'bob@example.com',
        phone_number: '+1 415-555-1234',
        address: '789 Market St, San Francisco, CA, USA',
        avatar: null,
        updated_at: new Date(
            new Date().setDate(new Date().getDate() - 5)
        ).toISOString(),
        total_invoices: 1,
        total_revenue: 600.0,
        unpaid_amount: 600.0,
        status: 'Active',
    },
    {
        id: '4',
        first_name: 'Emma',
        last_name: 'Johnson',
        email: 'emma@example.com',
        phone_number: '+44 20 1234 5678',
        address: '10 Downing Street, London, UK',
        avatar: null,
        updated_at: new Date(
            new Date().setDate(new Date().getDate() - 8)
        ).toISOString(),
        total_invoices: 1,
        total_revenue: 350.0,
        unpaid_amount: 350.0,
        status: 'Active',
    },
    {
        id: '5',
        first_name: 'Charles',
        last_name: 'Wilson',
        email: 'charles@example.com',
        phone_number: '+49 30 1234567',
        address: 'Unter den Linden 77, Berlin, Germany',
        avatar: null,
        updated_at: new Date(
            new Date().setDate(new Date().getDate() - 15)
        ).toISOString(),
        total_invoices: 1,
        total_revenue: 500.0,
        unpaid_amount: 0,
        status: 'Active',
    },
    {
        id: '6',
        first_name: 'Diana',
        last_name: 'Smith',
        email: 'diana@example.com',
        phone_number: '+61 2 1234 5678',
        address: '42 George Street, Sydney, Australia',
        avatar: null,
        updated_at: new Date(
            new Date().setDate(new Date().getDate() - 18)
        ).toISOString(),
        total_invoices: 1,
        total_revenue: 325.0,
        unpaid_amount: 325.0,
        status: 'Active',
    },
    {
        id: '7',
        first_name: 'Frank',
        last_name: 'Miller',
        email: 'frank@example.com',
        phone_number: '+1 212-555-6789',
        address: '350 Fifth Avenue, New York, NY, USA',
        avatar: null,
        updated_at: new Date(
            new Date().setDate(new Date().getDate() - 22)
        ).toISOString(),
        total_invoices: 1,
        total_revenue: 1200.0,
        unpaid_amount: 1200.0,
        status: 'Active',
    },
    {
        id: '8',
        first_name: 'Grace',
        last_name: 'Lee',
        email: 'grace@example.com',
        phone_number: '+65 6123 4567',
        address: '1 Marina Boulevard, Singapore',
        avatar: null,
        updated_at: new Date(
            new Date().setDate(new Date().getDate() - 25)
        ).toISOString(),
        total_invoices: 1,
        total_revenue: 180.0,
        unpaid_amount: 180.0,
        status: 'Active',
    },
    {
        id: '9',
        first_name: 'Henry',
        last_name: 'Brown',
        email: 'henry@example.com',
        phone_number: '+81 3-1234-5678',
        address: '1-1 Marunouchi, Tokyo, Japan',
        avatar: null,
        updated_at: new Date(
            new Date().setDate(new Date().getDate() - 30)
        ).toISOString(),
        total_invoices: 1,
        total_revenue: 750.0,
        unpaid_amount: 0,
        status: 'Inactive',
    },
    {
        id: '10',
        first_name: 'Isabella',
        last_name: 'Garcia',
        email: 'isabella@example.com',
        phone_number: '+34 91 123 4567',
        address: 'Calle Gran Vía 1, Madrid, Spain',
        avatar: null,
        updated_at: new Date(
            new Date().setDate(new Date().getDate() - 35)
        ).toISOString(),
        total_invoices: 1,
        total_revenue: 450.0,
        unpaid_amount: 0,
        status: 'Active',
    },
    {
        id: '11',
        first_name: 'Jack',
        last_name: 'Taylor',
        email: 'jack@example.com',
        phone_number: '+39 06 1234 5678',
        address: 'Via del Corso 12, Rome, Italy',
        avatar: null,
        updated_at: new Date(
            new Date().setDate(new Date().getDate() - 40)
        ).toISOString(),
        total_invoices: 1,
        total_revenue: 550.0,
        unpaid_amount: 0,
        status: 'Active',
    },
    {
        id: '12',
        first_name: 'Kelly',
        last_name: 'Anderson',
        email: 'kelly@example.com',
        phone_number: '+55 11 1234-5678',
        address: 'Avenida Paulista 1000, São Paulo, Brazil',
        avatar: null,
        updated_at: new Date(
            new Date().setDate(new Date().getDate() - 45)
        ).toISOString(),
        total_invoices: 1,
        total_revenue: 950.0,
        unpaid_amount: 0,
        status: 'Inactive',
    },
]

const statusColors: Record<Client['status'], string> = {
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-gray-100 text-gray-800',
}

export default function Clients() {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const itemsPerPage = 6
    const clients = sampleClients

    const filteredClients = searchTerm
        ? clients.filter(
              (c) =>
                  c.first_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  c.last_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  c.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : clients

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentClients = filteredClients.slice(
        indexOfFirstItem,
        indexOfLastItem
    )
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
    const paginate = (page: number) =>
        page > 0 && page <= totalPages && setCurrentPage(page)

    const totalClients = clients.length
    const activeClients = clients.filter((c) => c.status === 'Active').length
    const totalUnpaidAmount = clients.reduce(
        (sum, c) => sum + c.unpaid_amount,
        0
    )

    const numFmt = useMemo(
        () => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }),
        []
    )

    return (
        <CommonPageLayout>
            <Topbar subtitle="Overview" title="Clients">
                <Link href="/clients/new">
                    <Button>
                        <Plus className="mr-2" /> New Client
                    </Button>
                </Link>
            </Topbar>

            <CommonCenterLayout>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="flex items-center space-x-3">
                            <Users className="w-6 h-6 text-slate-600" />
                            <div>
                                <p className="text-sm text-slate-500">
                                    Total Clients
                                </p>
                                <p className="text-xl font-semibold">
                                    {numFmt.format(totalClients)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center space-x-3">
                            <UserCheck className="w-6 h-6 text-emerald-600" />
                            <div>
                                <p className="text-sm text-slate-500">
                                    Active Clients
                                </p>
                                <p className="text-xl font-semibold">
                                    {numFmt.format(activeClients)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center space-x-3">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                            <div>
                                <p className="text-sm text-slate-500">
                                    Total Unpaid
                                </p>
                                <p className="text-xl font-semibold">
                                    ${numFmt.format(totalUnpaidAmount)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <ListHeader
                    subtitle="Client List"
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search clients..."
                />
                <ClientGrid
                    clients={currentClients}
                    statusColors={statusColors}
                    linkPrefix="/clients"
                />
            </CommonCenterLayout>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={paginate}
                startIndex={indexOfFirstItem + 1}
                endIndex={Math.min(indexOfLastItem, filteredClients.length)}
                totalEntries={filteredClients.length}
            />
        </CommonPageLayout>
    )
}
