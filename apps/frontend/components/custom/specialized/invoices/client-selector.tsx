import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectItem,
    SelectValue,
} from '@/components/ui/select'
import { User } from 'lucide-react'

export const ClientSelector = ({
    clients,
    selectedClientId,
    onClientChange,
}: {
    clients: Array<{
        id: string
        first_name: string
        last_name: string
        email: string
        address?: string
        phone_number?: string
    }>
    selectedClientId: string
    onClientChange: (clientId: string) => void
}) => {
    const selectedClient = clients.find((c) => c.id === selectedClientId)

    return (
        <Select value={selectedClientId} onValueChange={onClientChange}>
            <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a client">
                    {selectedClient && (
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-medium">
                                    {selectedClient.first_name}{' '}
                                    {selectedClient.last_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {selectedClient.email}
                                </span>
                            </div>
                        </div>
                    )}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium">
                                    {client.first_name} {client.last_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {client.email}
                                </span>
                            </div>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
