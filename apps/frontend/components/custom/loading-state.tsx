'use client'
import { FC } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
    message?: string
}

const LoadingState: FC<LoadingStateProps> = ({ message = 'Loading...' }) => (
    <div className="flex flex-col items-center space-y-4 py-10 w-full justify-center">
        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
        <p className="text-center text-base text-muted-foreground">{message}</p>
    </div>
)

export default LoadingState
