import { Database } from '@/types/database'
import {
    AlertTriangle,
    CheckCircle,
    PenTool,
    Send,
    XCircle,
} from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

type InvoiceState = Database['public']['Enums']['invoice_state']

export const StatusBadge = ({ status }: { status: InvoiceState }) => {
    const statusConfig = {
        Draft: {
            label: 'Draft',
            icon: PenTool,
            className:
                'bg-muted text-muted-foreground border-muted-foreground/20',
            tooltip: 'Invoice is in draft mode and not yet sent',
        },
        Sent: {
            label: 'Sent',
            icon: Send,
            className: 'bg-blue-100 text-blue-700 border-blue-300',
            tooltip: 'Invoice has been sent to client',
        },
        Paid: {
            label: 'Paid',
            icon: CheckCircle,
            className: 'bg-green-100 text-green-700 border-green-300',
            tooltip: 'Payment received and complete',
        },
        Overdue: {
            label: 'Overdue',
            icon: AlertTriangle,
            className: 'bg-red-100 text-red-700 border-red-300',
            tooltip: 'Invoice is past due date',
        },
        Cancelled: {
            label: 'Cancelled',
            icon: XCircle,
            className: 'bg-gray-100 text-gray-700 border-gray-300',
            tooltip: 'Invoice has been cancelled',
        },
    } as const

    const config = statusConfig[status]
    const IconComponent = config.icon

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge
                        variant="outline"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-all duration-200 ${config.className}`}
                    >
                        <IconComponent className="h-3 w-3" />
                        {config.label}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-sm">{config.tooltip}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
