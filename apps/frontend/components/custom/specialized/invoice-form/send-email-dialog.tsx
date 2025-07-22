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
import { Textarea } from '@/components/ui/textarea'
import { Mail, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface SendEmailDialogProps {
    isOpen: boolean
    onClose: () => void
    invoiceId: string
    invoiceTitle: string
    clientEmail: string
    clientName: string
    onEmailSent?: () => void
}

export function SendEmailDialog({
    isOpen,
    onClose,
    invoiceId,
    invoiceTitle,
    clientEmail,
    clientName,
    onEmailSent,
}: SendEmailDialogProps) {
    const [isLoading, setIsLoading] = React.useState(false)
    const [isSuccess, setIsSuccess] = React.useState(false)
    const [customMessage, setCustomMessage] = React.useState('')

    const handleSendEmail = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(
                `/api/invoices/${invoiceId}/send-email`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ customMessage }),
                }
            )

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to send email')
            }

            setIsSuccess(true)
            toast.success('Email envoyé avec succès !')
            onEmailSent?.()

            // Close dialog after 2 seconds
            setTimeout(() => {
                onClose()
                setIsSuccess(false)
                setCustomMessage('')
            }, 2000)
        } catch (error: any) {
            console.error('Failed to send email:', error)
            toast.error(error.message || "Erreur lors de l'envoi de l'email")
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        if (!isLoading) {
            onClose()
            setIsSuccess(false)
            setCustomMessage('')
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Envoyer la facture par email
                    </DialogTitle>
                    <DialogDescription>
                        Envoyez la facture "{invoiceTitle}" à {clientName}
                    </DialogDescription>
                </DialogHeader>

                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                        <h3 className="text-lg font-medium text-green-900">
                            Email envoyé !
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            La facture a été envoyée avec succès à {clientEmail}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="client-email">Destinataire</Label>
                            <Input
                                id="client-email"
                                value={clientEmail}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="custom-message">
                                Message personnalisé (optionnel)
                            </Label>
                            <Textarea
                                id="custom-message"
                                placeholder="Ajoutez un message personnalisé à votre facture..."
                                value={customMessage}
                                onChange={(e) =>
                                    setCustomMessage(e.target.value)
                                }
                                rows={3}
                            />
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                <strong>Note :</strong> La facture sera
                                automatiquement générée et jointe à l'email.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleSendEmail}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Envoi en cours...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        Envoyer
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
