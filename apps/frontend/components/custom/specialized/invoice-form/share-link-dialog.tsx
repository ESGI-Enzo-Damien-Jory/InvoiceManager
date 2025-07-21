'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Share2, Copy, CheckCircle, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ShareLinkDialogProps {
    isOpen: boolean
    onClose: () => void
    invoiceId: string
    invoiceTitle: string
    onShareLinkGenerated?: (link: string) => void
}

export function ShareLinkDialog({
    isOpen,
    onClose,
    invoiceId,
    invoiceTitle,
    onShareLinkGenerated,
}: ShareLinkDialogProps) {
    const [isLoading, setIsLoading] = React.useState(false)
    const [shareLink, setShareLink] = React.useState('')
    const [isCopied, setIsCopied] = React.useState(false)
    const [expiresAt, setExpiresAt] = React.useState('')

    const generateShareLink = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/invoices/share/${invoiceId}`, {
                method: 'POST',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to generate share link')
            }

            const data = await response.json()
            setShareLink(data.signed_url)
            setExpiresAt(data.expires_at)
            onShareLinkGenerated?.(data.signed_url)
            toast.success('Lien de partage généré !')
        } catch (error: any) {
            console.error('Failed to generate share link:', error)
            toast.error(error.message || 'Erreur lors de la génération du lien')
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareLink)
            setIsCopied(true)
            toast.success('Lien copié dans le presse-papiers !')
            setTimeout(() => setIsCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy to clipboard:', error)
            toast.error('Erreur lors de la copie')
        }
    }

    const openLink = () => {
        if (shareLink) {
            window.open(shareLink, '_blank')
        }
    }

    const handleClose = () => {
        if (!isLoading) {
            onClose()
            setShareLink('')
            setExpiresAt('')
            setIsCopied(false)
        }
    }

    React.useEffect(() => {
        if (isOpen && !shareLink) {
            generateShareLink()
        }
    }, [isOpen])

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Partager la facture
                    </DialogTitle>
                    <DialogDescription>
                        Partagez la facture "{invoiceTitle}" avec votre client
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                                Génération du lien...
                            </p>
                        </div>
                    ) : shareLink ? (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="share-link">
                                    Lien de partage
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="share-link"
                                        value={shareLink}
                                        readOnly
                                        className="font-mono text-sm"
                                    />
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={copyToClipboard}
                                        className="flex-shrink-0"
                                    >
                                        {isCopied ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {expiresAt && (
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        Expire le{' '}
                                        {new Date(expiresAt).toLocaleDateString(
                                            'fr-FR'
                                        )}
                                    </Badge>
                                </div>
                            )}

                            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    <strong>✓ Lien généré !</strong> Votre
                                    client peut maintenant accéder à la facture.
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={openLink}
                                    className="flex-1"
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Tester le lien
                                </Button>
                                <Button
                                    onClick={handleClose}
                                    className="flex-1"
                                >
                                    Fermer
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                Erreur lors de la génération du lien
                            </p>
                            <Button
                                onClick={generateShareLink}
                                className="mt-2"
                            >
                                Réessayer
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
