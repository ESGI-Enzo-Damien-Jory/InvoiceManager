import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarIcon, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

export const DateSelector = ({
    selectedDate,
    onDateChange,
}: {
    selectedDate: Date | undefined
    onDateChange: (date: Date | undefined) => void
}) => {
    return (
        <div className="flex gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            'flex-1 justify-start text-left font-normal h-11',
                            !selectedDate && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                            format(selectedDate, 'dd/MM/yyyy')
                        ) : (
                            <span>Select due date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={onDateChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            {selectedDate && (
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDateChange(undefined)}
                    className="text-muted-foreground hover:text-destructive transition-colors h-11 w-11"
                    title="Clear date"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}
