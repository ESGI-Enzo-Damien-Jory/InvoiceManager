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
import type { CreateClientPayload, Client } from '@/services/clients'

interface ClientFormData {
    first_name: string
    last_name: string
    email: string
    phone_number: string
    address: string
}

interface CreateMutation {
    isPending: boolean
    mutate: (
        data: CreateClientPayload,
        options?: {
            onSuccess?: (data: Client[]) => void
            onError?: (error: unknown) => void
        }
    ) => void
    mutateAsync: (data: CreateClientPayload) => Promise<Client[]>
}

interface CreateClientDialogProps {
    isCreateDialogOpen: boolean
    setIsCreateDialogOpen: (open: boolean) => void
    handleCreateSubmit: (e: React.FormEvent) => void
    formData: ClientFormData
    setFormData: (data: ClientFormData) => void
    resetForm: () => void
    createMutation: CreateMutation
}

export default function CreateClientDialog({
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    handleCreateSubmit,
    formData,
    setFormData,
    resetForm,
    createMutation,
}: CreateClientDialogProps) {
    const handleCancel = () => {
        setIsCreateDialogOpen(false)
        resetForm()
    }

    return (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Client</DialogTitle>
                    <DialogDescription>
                        Add a new client to your business. All fields marked
                        with * are required.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubmit}>
                    <div className="grid gap-6 py-6">
                        {/* First Name & Last Name Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-first-name">
                                    First Name *
                                </Label>
                                <Input
                                    id="create-first-name"
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
                                <Label htmlFor="create-last-name">
                                    Last Name *
                                </Label>
                                <Input
                                    id="create-last-name"
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
                            <Label htmlFor="create-email">
                                Email Address *
                            </Label>
                            <Input
                                id="create-email"
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
                            <Label htmlFor="create-phone">Phone Number</Label>
                            <Input
                                id="create-phone"
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
                            <Label htmlFor="create-address">Address</Label>
                            <Input
                                id="create-address"
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
                            disabled={createMutation.isPending}
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
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Client'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
