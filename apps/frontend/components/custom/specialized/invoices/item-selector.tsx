import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { useState } from 'react'

interface ItemSelectorProps {
    items: Array<{ id: string; name: string; price: number }>
    onAddItem: (item: { id: string; name: string; price: number }) => void
    disabled: boolean
}

export const ItemSelector = ({
    items,
    onAddItem,
    disabled,
}: ItemSelectorProps) => {
    const [selectedItemId, setSelectedItemId] = useState<string>('')

    const handleAddItem = () => {
        const selectedItem = items.find((item) => item.id === selectedItemId)
        if (selectedItem) {
            onAddItem(selectedItem)
            setSelectedItemId('')
        }
    }

    return (
        <div className="flex gap-2">
            <Select
                value={selectedItemId}
                onValueChange={setSelectedItemId}
                disabled={disabled}
            >
                <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select an item" />
                </SelectTrigger>
                <SelectContent>
                    {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                            <div className="flex justify-between items-center w-full">
                                <span>{item.name}</span>
                                <span className="text-muted-foreground ml-2">
                                    {formatCurrency(item.price)}
                                </span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button
                type="button"
                onClick={handleAddItem}
                disabled={!selectedItemId || disabled}
                variant="outline"
                size="sm"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    )
}
