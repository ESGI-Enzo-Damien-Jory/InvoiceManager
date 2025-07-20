'use client'

import { Suspense } from 'react'
import { DashboardOverview } from '@/components/custom/specialized/dashboard/dashboard-overview'
import { DashboardBento } from '@/components/custom/specialized/dashboard/dashboard-bento'
import LoadingState from '@/components/custom/states/loading-state'

export default function DashboardPage() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                        Welcome back! Here's what's happening with your business.
                    </span>
                </div>
            </div>
            
            <Suspense fallback={<LoadingState />}>
                <DashboardOverview />
            </Suspense>
            
            <Suspense fallback={<LoadingState />}>
                <DashboardBento />
            </Suspense>
        </div>
    )
}
