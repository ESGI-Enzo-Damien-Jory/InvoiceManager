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
import { useEffect } from 'react'
import type { Client, UpdateClientPayload } from '@/services/clients'

interface ClientFormData {
    first_name: string
    last_name: string
    email: string
    phone_number: string
    address: string
}

interface UpdateMutation {
    isPending: boolean
    mutate: (
        variables: { clientId: string; payload: UpdateClientPayload },
        options?: {
            onSuccess?: (data: Client[]) => void
            onError?: (error: unknown) => void
        }
    ) => void
    mutateAsync: (variables: {
        clientId: string
        payload: UpdateClientPayload
    }) => Promise<Client[]>
}

interface EditClientDialogProps {
    isEditDialogOpen: boolean
    setIsEditDialogOpen: (open: boolean) => void
    handleEditSubmit: (e: React.FormEvent) => void
    formData: ClientFormData
    setFormData: (data: ClientFormData) => void
    resetForm: () => void
    updateMutation: UpdateMutation
    selectedClient: Client | null
}

export default function EditClientDialog({
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleEditSubmit,
    formData,
    setFormData,
    resetForm,
    updateMutation,
    selectedClient,
}: EditClientDialogProps) {
    // Populate form when dialog opens with selected client data
    useEffect(() => {
        if (isEditDialogOpen && selectedClient) {
            setFormData({
                first_name: selectedClient.first_name,
                last_name: selectedClient.last_name,
                email: selectedClient.email,
                phone_number: selectedClient.phone_number || '',
                address: selectedClient.address || '',
            })
        }
    }, [isEditDialogOpen, selectedClient, setFormData])

    const handleCancel = () => {
        setIsEditDialogOpen(false)
        resetForm()
    }

    const handleOpenChange = (open: boolean) => {
        setIsEditDialogOpen(open)
        if (!open) {
            resetForm()
        }
    }

    return (
        <Dialog open={isEditDialogOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Client</DialogTitle>
                    <DialogDescription>
                        Update client information. All fields marked with * are
                        required.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditSubmit}>
                    <div className="grid gap-6 py-6">
                        {/* First Name & Last Name Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-first-name">
                                    First Name *
                                </Label>
                                <Input
                                    id="edit-first-name"
                                    value={formData.first_name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            first_name: e.target.value,
                                        })
                                    }
                                    placeholder="John"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-last-name">
                                    Last Name *
                                </Label>
                                <Input
                                    id="edit-last-name"
                                    value={formData.last_name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            last_name: e.target.value,
                                        })
                                    }
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email Address *</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                placeholder="john.doe@example.com"
                                required
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-phone">Phone Number</Label>
                            <Input
                                id="edit-phone"
                                type="tel"
                                value={formData.phone_number}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        phone_number: e.target.value,
                                    })
                                }
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-address">Address</Label>
                            <Input
                                id="edit-address"
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        address: e.target.value,
                                    })
                                }
                                placeholder="123 Main St, City, State 12345"
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
                                    Updating...
                                </>
                            ) : (
                                'Update Client'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
