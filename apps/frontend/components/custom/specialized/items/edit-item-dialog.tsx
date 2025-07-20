// edit-item-dialog.tsx
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
import { Loader2 } from 'lucide-react'
import type { Item } from '@/types'

interface FormData {
    name: string
    price: string
}

interface UpdateMutation {
    isPending: boolean
    mutateAsync: (data: {
        id: string
        payload: {
            name?: string
            price?: number
            avatarHex?: string | null
        }
    }) => Promise<Item>
}

interface EditItemDialogProps {
    isEditDialogOpen: boolean
    setIsEditDialogOpen: (open: boolean) => void
    handleEditSubmit: (e: React.FormEvent) => void
    formData: FormData
    setFormData: (data: FormData) => void
    setEditingItem: React.Dispatch<React.SetStateAction<Item | null>>
    resetForm: () => void
    updateMutation: UpdateMutation
}

export default function EditItemDialog({
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleEditSubmit,
    formData,
    setFormData,
    setEditingItem,
    resetForm,
    updateMutation,
}: EditItemDialogProps) {
    const handleCancel = () => {
        setIsEditDialogOpen(false)
        setEditingItem(null)
        resetForm()
    }

    return (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Item</DialogTitle>
                    <DialogDescription>
                        Update the item details below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="edit-name"
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
                            <Label htmlFor="edit-price" className="text-right">
                                Price ($)
                            </Label>
                            <Input
                                id="edit-price"
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
                            disabled={updateMutation.isPending}
                            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                            variant="ghost"
                            className="text-foreground shadow-sm hover:bg-muted font-medium"
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
