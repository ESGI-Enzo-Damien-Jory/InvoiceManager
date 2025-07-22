'use client'

import { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { useUser, useUpdateProfile, useUploadAvatar } from '@/hooks/use-auth'
import { getInvoiceSettings, updateInvoiceSettings } from '@/services/invoiceSettings'
import type { InvoiceSettings } from '@/types/api'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select'
import { Loader2, User, Upload, Palette, Check } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

// Define cool themes (not just accent)
const THEMES = [
    {
        name: 'Default',
        className: 'theme-default',
        preview: 'bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600',
        text: 'Default',
    },
    {
        name: 'Ocean',
        className: 'theme-ocean',
        preview: 'bg-gradient-to-br from-sky-400 via-cyan-500 to-blue-600',
        text: 'Ocean',
    },
    {
        name: 'Sunset',
        className: 'theme-sunset',
        preview:
            'bg-gradient-to-br from-amber-400 via-orange-500 to-purple-600',
        text: 'Sunset',
    },
    {
        name: 'Nord',
        className: 'theme-nord',
        preview: 'bg-gradient-to-br from-slate-400 via-blue-500 to-cyan-600',
        text: 'Nord',
    },
    {
        name: 'Tokyo Night',
        className: 'theme-tokyo',
        preview: 'bg-gradient-to-br from-purple-500 via-pink-500 to-blue-600',
        text: 'Tokyo',
    },
    {
        name: 'Emerald',
        className: 'theme-emerald',
        preview:
            'bg-gradient-to-br from-emerald-400 via-green-500 to-yellow-600',
        text: 'Emerald',
    },
    {
        name: 'Dracula',
        className: 'theme-dracula',
        preview: 'bg-gradient-to-br from-purple-400 via-pink-500 to-green-400',
        text: 'Dracula',
    },
    {
        name: 'Catppuccin',
        className: 'theme-catppuccin',
        preview: 'bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400',
        text: 'Catppuccin',
    },
]

export default function SettingsPage() {
    // Profile state
    const { data: userProfile, status } = useUser()
    const { updateMutate, status: updateStatus } = useUpdateProfile()
    const { uploadMutate, status: uploadStatus } = useUploadAvatar()
    const [displayName, setDisplayName] = useState('')
    const [phone, setPhone] = useState('')
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Theme state (session only)
    const { resolvedTheme, setTheme } = useTheme()
    const [theme, setThemeState] = useState('system')
    const [customTheme, setCustomTheme] = useState('theme-default')
    const [darkMode, setDarkMode] = useState(false)

    // UI state
    const [tab, setTab] = useState('profile')
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)
    // Invoice ID settings state
    const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings | null>(null)
    const [prefix, setPrefix] = useState('')
    const [invoiceSettingsLoading, setInvoiceSettingsLoading] = useState(false)
    const [invoiceSettingsError, setInvoiceSettingsError] = useState<string | null>(null)
    const [invoiceSettingsSaved, setInvoiceSettingsSaved] = useState(false)

    // Load profile
    useEffect(() => {
        if (userProfile) {
            setDisplayName(userProfile.display_name || '')
            setPhone(userProfile.phone_number || '')
            setAvatarPreview(userProfile.avatar_url || null)
        }
    }, [userProfile])

    // Load theme from sessionStorage
    useEffect(() => {
        const storedTheme =
            sessionStorage.getItem('customTheme') || 'theme-default'
        setCustomTheme(storedTheme)
    }, [])

    // Apply theme on change (to <html> via Providers)
    useEffect(() => {
        sessionStorage.setItem('customTheme', customTheme)
        window.dispatchEvent(new CustomEvent('theme:change'))
    }, [customTheme])

    // Theme mode (light/dark/system)
    useEffect(() => {
        setTheme(theme)
        sessionStorage.setItem('themeMode', theme)
    }, [theme, setTheme])

    // Load invoice settings
    useEffect(() => {
        if (tab === 'invoice-ids' && !invoiceSettings) {
            setInvoiceSettingsLoading(true)
            getInvoiceSettings()
                .then((data: InvoiceSettings) => {
                    setInvoiceSettings(data)
                    setPrefix(data.prefix)
                })
                .catch(() => setInvoiceSettingsError('Failed to load invoice settings'))
                .finally(() => setInvoiceSettingsLoading(false))
        }
    }, [tab, invoiceSettings])

    // Avatar upload
    const handleAvatarClick = () => fileInputRef.current?.click()
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB')
            return
        }
        const reader = new FileReader()
        reader.onload = (e) => setAvatarPreview(e.target?.result as string)
        reader.readAsDataURL(file)
        setError(null)
        uploadMutate(file, {
            onError: (err) => setError('Upload failed'),
        })
    }

    // Save profile
    const handleSaveProfile = () => {
        setLoading(true)
        setError(null)
        updateMutate(
            { display_name: displayName, phone_number: phone },
            {
                onSuccess: () => {
                    setLoading(false)
                    setSaved(true)
                    setTimeout(() => setSaved(false), 2000)
                },
                onError: (err) => {
                    setLoading(false)
                    setError('Update failed')
                },
            }
        )
    }

    // Save invoice settings
    const handleSaveInvoiceSettings = async () => {
        setInvoiceSettingsLoading(true)
        setInvoiceSettingsError(null)
        try {
            const updated = await updateInvoiceSettings({ prefix })
            setInvoiceSettings(updated)
            setInvoiceSettingsSaved(true)
            setTimeout(() => setInvoiceSettingsSaved(false), 2000)
        } catch (e) {
            setInvoiceSettingsError('Failed to update invoice settings')
        } finally {
            setInvoiceSettingsLoading(false)
        }
    }

    if (status === 'pending') {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin w-8 h-8" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto py-10">
            <Toaster />
            <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>
                        Manage your profile and personalize your experience.{' '}
                        <span className="text-muted-foreground">
                            (Profile is saved, theme is session-only)
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={tab} onValueChange={setTab} className="w-full">
                        <TabsList className="mb-6">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="appearance">Appearance</TabsTrigger>
                            <TabsTrigger value="invoice-ids">Invoice IDs</TabsTrigger>
                        </TabsList>
                        <TabsContent value="profile">
                            <div className="flex flex-col gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <Avatar className="size-20">
                                            {avatarPreview ? (
                                                <AvatarImage
                                                    src={avatarPreview}
                                                    alt="avatar"
                                                />
                                            ) : (
                                                <AvatarFallback>
                                                    <User />
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="outline"
                                            className="absolute bottom-0 right-0 size-8"
                                            onClick={handleAvatarClick}
                                        >
                                            <Upload className="w-4 h-4" />
                                        </Button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <div className="flex-1 grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="displayName">
                                                Display Name
                                            </Label>
                                            <Input
                                                id="displayName"
                                                value={displayName}
                                                onChange={(e) =>
                                                    setDisplayName(
                                                        e.target.value
                                                    )
                                                }
                                                maxLength={50}
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="phone"
                                                value={phone}
                                                onChange={(e) =>
                                                    setPhone(e.target.value)
                                                }
                                                maxLength={20}
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {error && (
                                    <div className="text-destructive text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="appearance">
                            <div className="grid gap-8">
                                <div className="grid gap-2">
                                    <Label>
                                        <Palette className="w-4 h-4" /> Theme
                                    </Label>
                                    <Select
                                        value={theme}
                                        onValueChange={setThemeState}
                                    >
                                        <SelectTrigger className="w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="system">
                                                System
                                            </SelectItem>
                                            <SelectItem value="light">
                                                Light
                                            </SelectItem>
                                            <SelectItem value="dark">
                                                Dark
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>
                                        <Palette className="w-4 h-4" /> Color
                                        Theme
                                    </Label>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        {THEMES.map((opt) => (
                                            <button
                                                key={opt.className}
                                                type="button"
                                                className={cn(
                                                    'relative flex flex-col items-center gap-1 w-20',
                                                    'focus:outline-none',
                                                    customTheme ===
                                                        opt.className &&
                                                        'ring-2 ring-primary'
                                                )}
                                                aria-label={opt.name}
                                                onClick={() =>
                                                    setCustomTheme(
                                                        opt.className
                                                    )
                                                }
                                            >
                                                <div
                                                    className={cn(
                                                        'w-12 h-8 rounded-lg shadow-sm',
                                                        opt.preview,
                                                        opt.className
                                                    )}
                                                />
                                                <span className="text-xs mt-1 text-muted-foreground">
                                                    {opt.text}
                                                </span>
                                                {customTheme ===
                                                    opt.className && (
                                                    <Check className="absolute top-1 right-1 w-4 h-4 text-primary bg-background rounded-full" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Theme is stored in session and only
                                        affects this device.
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="invoice-ids">
                            <div className="grid gap-6">
                                <div className="mb-2 text-sm text-muted-foreground">
                                    <b>European law:</b> Invoice numbers must be strictly sequential and unique. <b>Changing the prefix mid-year is forbidden</b> (except at year change or for legal reasons).<br />
                                    <span className="text-xs">If you change the prefix, you must ensure compliance with your local regulations.</span>
                                </div>
                                {invoiceSettingsLoading ? (
                                    <div className="flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Loading…</div>
                                ) : invoiceSettingsError ? (
                                    <div className="text-destructive text-sm">{invoiceSettingsError}</div>
                                ) : invoiceSettings ? (
                                    <form
                                        onSubmit={e => { e.preventDefault(); handleSaveInvoiceSettings(); }}
                                        className="grid gap-4"
                                    >
                                        <div className="grid gap-2">
                                            <Label htmlFor="prefix">Invoice Prefix</Label>
                                            <Input
                                                id="prefix"
                                                value={prefix}
                                                onChange={e => setPrefix(e.target.value.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 12))}
                                                maxLength={12}
                                                autoComplete="off"
                                            />
                                            <span className="text-xs text-muted-foreground">Max 12 alphanumeric characters. Example: <b>INV</b>, <b>2024-</b>, <b>FCT</b></span>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Next Invoice Number</Label>
                                            <Input
                                                value={invoiceSettings.prefix + String(invoiceSettings.next_number).padStart(6, '0')}
                                                readOnly
                                                className="font-mono"
                                            />
                                            <span className="text-xs text-muted-foreground">Preview of the next invoice number to be generated.</span>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button type="submit" disabled={invoiceSettingsLoading}>Save</Button>
                                            {invoiceSettingsSaved && <span className="text-success text-xs">Saved!</span>}
                                        </div>
                                    </form>
                                ) : null}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    {tab === 'profile' && (
                        <Button
                            onClick={handleSaveProfile}
                            disabled={loading || updateStatus === 'pending'}
                        >
                            {loading || updateStatus === 'pending' ? (
                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                            ) : null}
                            Save Profile
                        </Button>
                    )}
                    {tab === 'profile' && saved && (
                        <span className="text-success text-xs">Saved!</span>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
