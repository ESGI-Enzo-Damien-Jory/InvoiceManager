import { supabase } from '#start/supabase'

interface InvoiceItemInput {
  item_id: string
  quantity: number
  unit_price: number
}

interface ItemWithDetails {
  name: string
  quantity: number
  unit_price: number
  total: number
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

export async function fetchItemsWithDetails(
  userId: string,
  items: any[]
): Promise<ItemWithDetails[]> {
  if (!items || items.length === 0) return []

  const itemIds = items.map((i: any) => i.item_id)

  const { data: itemDetails, error } = await supabase
    .from('items')
    .select('id, name, price')
    .in('id', itemIds)
    .eq('owner_id', userId)

  if (error) {
    throw new Error(`Failed to fetch item details: ${error.message}`)
  }

  return items.map((requestItem: any) => {
    const itemDetail = itemDetails.find((detail) => detail.id === requestItem.item_id)
    const quantity = Number(requestItem.quantity) || 0
    const unitPrice = Number(requestItem.unit_price) || Number(itemDetail?.price) || 0
    const total = quantity * unitPrice

    return {
      name: itemDetail?.name || 'Unknown Item',
      quantity,
      unit_price: unitPrice,
      total,
    }
  })
}

export function calculateTotalAmount(
  items: Array<{ quantity: number; unit_price: number; total?: number }>
): number {
  if (!items || items.length === 0) return 0

  return items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0
    const unitPrice = Number(item.unit_price) || 0

    const itemTotal = item.total !== undefined ? Number(item.total) : quantity * unitPrice

    return sum + (itemTotal || 0)
  }, 0)
}

export async function processInvoiceItems(
  userId: string,
  items: any[]
): Promise<{
  itemsWithDetails: ItemWithDetails[]
  totalAmount: number
}> {
  const itemsWithDetails = await fetchItemsWithDetails(userId, items)
  const totalAmount = calculateTotalAmount(itemsWithDetails)

  return {
    itemsWithDetails,
    totalAmount,
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
