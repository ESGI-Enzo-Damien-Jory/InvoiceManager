import { supabase } from '#start/supabase'

export async function uploadInvoicePdfToStorage(
  userId: string,
  pdfBuffer: Buffer,
  invoiceId: string
): Promise<string> {
  const filename = `${userId}/invoices/${invoiceId}.pdf`

  const { error } = await supabase.storage.from('invoices').upload(filename, pdfBuffer, {
    contentType: 'application/pdf',
    upsert: true,
  })

  if (error) {
    throw new Error(`Failed to upload PDF: ${error.message}`)
  }

  const { data } = supabase.storage.from('invoices').getPublicUrl(filename)
  return data.publicUrl
}
