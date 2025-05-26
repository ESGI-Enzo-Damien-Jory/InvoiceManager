import { supabase } from '#start/supabase'
interface InvoiceItemInput {
  item_id: string
  quantity: number
  unit_price: number
}
export async function insertInvoiceItems(
  userId: string,
  invoiceId: string,
  items: InvoiceItemInput[]
): Promise<void> {
  if (items.length === 0) return

  const itemIds = items.map((item) => item.item_id)
  const { data: validItems, error } = await supabase
    .from('items')
    .select('id')
    .in('id', itemIds)
    .eq('owner_id', userId)
    .is('deleted_at', null)

  if (error) {
    throw new Error(`Item validation failed: ${error.message}`)
  }

  const validItemIds = validItems.map((i) => i.id)
  const invalidItemIds = itemIds.filter((id) => !validItemIds.includes(id))

  if (invalidItemIds.length > 0) {
    throw new Error(`Invalid item IDs: ${invalidItemIds.join(', ')}`)
  }

  const insertPayload = items.map((item) => ({
    invoice_id: invoiceId,
    item_id: item.item_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }))

  const { error: insertError } = await supabase.from('invoice_items').insert(insertPayload)
  if (insertError) {
    throw new Error(`Failed to insert invoice items: ${insertError.message}`)
  }
}

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
