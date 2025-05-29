'use client'

import { FC } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
    title?: string
    message: string
    onRetry?: () => void
}

const ErrorState: FC<ErrorStateProps> = ({
    title = 'Something went wrong',
    message,
    onRetry,
}) => (
    <div className="flex min-h-[60vh] items-center justify-center px-4 w-full flex-col gap-6">
        <div className="mx-auto">
            <AlertTriangle className="h-12 text-destructive w-full" />
        </div>

        <h2 className="text-xl font-semibold text-destructive">{title}</h2>

        <p className="text-sm text-muted-foreground">{message}</p>

        {onRetry && (
            <Button variant="destructive" onClick={onRetry} className="px-8">
                Retry
            </Button>
        )}
    </div>
)

export default ErrorState
