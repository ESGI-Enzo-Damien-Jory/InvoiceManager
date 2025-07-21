'use client'

import { Suspense } from 'react'
import { AnalyticsOverview } from '@/components/custom/specialized/analytics/analytics-overview'
import { AnalyticsCharts } from '@/components/custom/specialized/analytics/analytics-charts'
import { AnalyticsInsights } from '@/components/custom/specialized/analytics/analytics-insights'
import LoadingState from '@/components/custom/states/loading-state'

export default function AnalyticsPage() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                        Deep insights into your business performance
                    </span>
                </div>
            </div>

            <Suspense fallback={<LoadingState />}>
                <AnalyticsOverview />
            </Suspense>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Suspense fallback={<LoadingState />}>
                    <AnalyticsCharts className="col-span-2" />
                </Suspense>
                <Suspense fallback={<LoadingState />}>
                    <AnalyticsInsights />
                </Suspense>
            </div>
        </div>
    )
}
