'use client'

import { useState, useRef, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { useUser, useUpdateProfile, useUploadAvatar } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertCircle,
    Loader2,
    Camera,
    User,
    Mail,
    Phone,
    Upload,
} from 'lucide-react'

const profileSchema = z.object({
    display_name: z
        .string()
        .min(2, 'Display name must be at least 2 characters'),
    phone_number: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
    const { data: userProfile, status: userStatus } = useUser()
    const { updateMutate, status: updateStatus } = useUpdateProfile()
    const { uploadMutate, status: uploadStatus } = useUploadAvatar()

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            display_name: '',
            phone_number: '',
        },
    })

    // Reset form when user data changes or modal opens
    useEffect(() => {
        if (userProfile && open) {
            reset({
                display_name: userProfile.display_name,
                phone_number: userProfile.phone_number || '',
            })
            setError(null)
            setAvatarPreview(null)
        }
    }, [userProfile, reset, open])

    const isPending = updateStatus === 'pending' || uploadStatus === 'pending'

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB')
            return
        }

        // Check file extension
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
        if (!allowedTypes.includes(file.type)) {
            setError('Only JPG, JPEG and PNG files are allowed')
            return
        }

        setError(null)

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
            setAvatarPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)

        // Upload immediately
        uploadMutate(file, {
            onSuccess: () => {
                setAvatarPreview(null)
            },
            onError: (err) => {
                console.error('Avatar upload error:', err)
                setError(
                    err instanceof Error ? err.message : 'Avatar upload failed'
                )
                setAvatarPreview(null)
            },
        })

        // Clear the input
        event.target.value = ''
    }

    const onSubmit = (data: ProfileFormValues) => {
        setError(null)

        const payload: { display_name: string; phone_number?: string } = {
            display_name: data.display_name,
        }

        // Only include phone_number if it's not empty
        if (data.phone_number && data.phone_number.trim()) {
            payload.phone_number = data.phone_number.trim()
        }

        updateMutate(payload, {
            onSuccess: () => {
                onOpenChange(false)
            },
            onError: (err) => {
                console.error('Profile update error:', err)
                setError(err instanceof Error ? err.message : 'Update failed')
            },
        })
    }

    if (userStatus === 'pending') {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    if (!userProfile) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Account Settings
                    </DialogTitle>
                    <DialogDescription>
                        Update your profile information and avatar.
                    </DialogDescription>
                </DialogHeader>

                {/* Error message */}
                {error && (
                    <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <div>{error}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative group">
                            <Avatar className="h-20 w-20">
                                <AvatarImage
                                    src={
                                        avatarPreview ||
                                        userProfile.avatar_url ||
                                        undefined
                                    }
                                    alt={userProfile.display_name}
                                />
                                <AvatarFallback className="text-lg">
                                    {userProfile.display_name
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {/* Upload overlay */}
                            <button
                                type="button"
                                onClick={handleAvatarClick}
                                disabled={uploadStatus === 'pending'}
                                className={cn(
                                    'absolute inset-0 flex items-center justify-center',
                                    'bg-black/60 text-white rounded-full',
                                    'opacity-0 group-hover:opacity-100 transition-opacity',
                                    'disabled:opacity-50'
                                )}
                            >
                                {uploadStatus === 'pending' ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Camera className="h-5 w-5" />
                                )}
                            </button>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAvatarClick}
                            disabled={uploadStatus === 'pending'}
                            className="text-xs"
                        >
                            {uploadStatus === 'pending' ? (
                                <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-3 w-3" />
                                    Change Avatar
                                </>
                            )}
                        </Button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Email (read-only) */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4" />
                                Email
                            </Label>
                            <Input
                                value={userProfile.email}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                Email cannot be changed
                            </p>
                        </div>

                        {/* Display Name */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="display_name"
                                className="flex items-center gap-2 text-sm"
                            >
                                <User className="h-4 w-4" />
                                Display Name
                            </Label>
                            <Input
                                id="display_name"
                                placeholder="Your display name"
                                className={cn(
                                    'input-autofill',
                                    errors.display_name &&
                                        'border-destructive focus-visible:ring-destructive'
                                )}
                                disabled={isPending}
                                {...register('display_name')}
                            />
                            {errors.display_name && (
                                <div className="flex items-center gap-2 text-xs text-destructive">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.display_name.message}
                                </div>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="phone_number"
                                className="flex items-center gap-2 text-sm"
                            >
                                <Phone className="h-4 w-4" />
                                Phone Number
                            </Label>
                            <Input
                                id="phone_number"
                                placeholder="Your phone number (optional)"
                                className="input-autofill"
                                disabled={isPending}
                                {...register('phone_number')}
                            />
                            {errors.phone_number && (
                                <div className="flex items-center gap-2 text-xs text-destructive">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.phone_number.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!isDirty || isPending}>
                            {updateStatus === 'pending' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
