import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesService } from '@/services/invoices'
import type { Invoice } from '@/types'
import { toast } from 'sonner'

export function useInvoices() {
    const queryClient = useQueryClient()

    const { data: invoices = [], isLoading: loading, error } = useQuery({
        queryKey: ['invoices'],
        queryFn: invoicesService.getAll,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    const deleteMutation = useMutation({
        mutationFn: invoicesService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
            toast.success('Invoice deleted successfully')
        },
        onError: (error: any) => {
            console.error('Failed to delete invoice:', error)
            toast.error(error?.response?.data?.error || 'Failed to delete invoice')
        },
    })

    const deleteInvoice = async (id: string) => {
        await deleteMutation.mutateAsync(id)
    }

    return {
        invoices,
        loading,
        error: error?.message,
        deleteInvoice,
        isDeleting: deleteMutation.isPending,
    }
}

export function useInvoice(id: string) {
    return useQuery({
        queryKey: ['invoice', id],
        queryFn: () => invoicesService.getById(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export function useInvoiceActions() {
    const queryClient = useQueryClient()

    const downloadMutation = useMutation({
        mutationFn: invoicesService.downloadPdf,
        onError: (error: any) => {
            console.error('Failed to download invoice:', error)
            toast.error('Failed to download invoice')
        },
    })

    const shareMutation = useMutation({
        mutationFn: invoicesService.generateSignedUrl,
        onSuccess: (data) => {
            // Copy to clipboard
            navigator.clipboard.writeText(data.signed_url)
            toast.success('Share link copied to clipboard!')
        },
        onError: (error: any) => {
            console.error('Failed to generate share link:', error)
            toast.error('Failed to generate share link')
        },
    })

      // Generate PDF mutation
  const generatePdfMutation = useMutation({
    mutationFn: (invoiceId: string) => invoicesService.generatePdf(invoiceId),
    onSuccess: (data) => {
      toast.success('PDF generated successfully!')
      // Invalidate the invoices query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: (error: any) => {
      console.error('Failed to generate PDF:', error)
      toast.error(error?.response?.data?.error || 'Failed to generate PDF')
    },
  })

    const downloadInvoice = async (id: string) => {
        try {
            const blob = await downloadMutation.mutateAsync(id)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `invoice-${id}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            // Error is handled by the mutation
        }
    }

    const shareInvoice = async (id: string) => {
        await shareMutation.mutateAsync(id)
    }

    return {
        downloadInvoice,
        shareInvoice,
        generatePdf: generatePdfMutation.mutate,
        isDownloading: downloadMutation.isPending,
        isSharing: shareMutation.isPending,
        isGeneratingPdf: generatePdfMutation.isPending,
    }
} 