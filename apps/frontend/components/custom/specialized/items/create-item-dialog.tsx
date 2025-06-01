import { DialogHeader, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface FormData {
    name: string
    price: string
}

interface CreateMutation {
    isPending: boolean
    mutateAsync: (data: any) => Promise<any>
}

interface CreateItemDialogProps {
    isCreateDialogOpen: boolean
    setIsCreateDialogOpen: (open: boolean) => void
    handleCreateSubmit: (e: React.FormEvent) => void
    formData: FormData
    setFormData: (data: FormData) => void
    resetForm: () => void
    createMutation: CreateMutation
}

export default function CreateItemDialog({
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    handleCreateSubmit,
    formData,
    setFormData,
    resetForm,
    createMutation,
}: CreateItemDialogProps) {
    const handleCancel = () => {
        setIsCreateDialogOpen(false)
        resetForm()
    }

    return (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Item</DialogTitle>
                    <DialogDescription>
                        Add a new item to your inventory. Enter the name and
                        price below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="create-name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="create-name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                                htmlFor="create-price"
                                className="text-right"
                            >
                                Price ($)
                            </Label>
                            <Input
                                id="create-price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        price: e.target.value,
                                    })
                                }
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            variant="ghost"
                            className="text-foreground shadow-sm hover:bg-muted font-medium"
                        >
                            {createMutation.isPending
                                ? 'Creating...'
                                : 'Create Item'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
