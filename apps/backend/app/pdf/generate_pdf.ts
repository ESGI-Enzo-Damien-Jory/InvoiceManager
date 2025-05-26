import { generate } from '@pdfme/generator'
import { text, table } from '@pdfme/schemas'
import { invoiceTemplate } from './templates/invoice_template.js'

interface InvoiceData {
  title: string
  invoice_id: string
  total_amount: number
  state: string
  created_at: Date
  expiration_date?: Date

  owner_name: string
  owner_email: string

  client_first_name: string
  client_last_name: string
  client_email: string
  client_address?: string
  client_phone?: string

  items?: Array<{
    name: string
    quantity: number
    unit_price: number
    total: number
  }>
}

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  try {
    const issueDate = data.created_at.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const dueDate = data.expiration_date
      ? data.expiration_date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'No due date'

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(data.total_amount)

    const clientName = `${data.client_first_name} ${data.client_last_name}`
    const clientAddress = data.client_address || ''
    const clientPhone = data.client_phone ? `Phone: ${data.client_phone}` : ''
    const fullAddress = [clientAddress, clientPhone].filter(Boolean).join('\n')

    const tableData =
      data.items && data.items.length > 0
        ? data.items.map((item) => [
            item.name || 'Unnamed Item',
            String(item.quantity || 0),
            `$${(item.unit_price || 0).toFixed(2)}`,
            `$${(item.total || 0).toFixed(2)}`,
          ])
        : [['No items', '0', '$0.00', '$0.00']]

    const input = {
      invoice_title: 'INVOICE',
      invoice_id: `#${data.invoice_id.substring(0, 8).toUpperCase()}`,

      from_label: 'FROM:',
      from_name: data.owner_name,
      from_email: data.owner_email,

      to_label: 'BILL TO:',
      client_name: clientName,
      client_email: data.client_email,
      client_address: fullAddress,

      issue_date_label: 'Issue Date:',
      issue_date: issueDate,
      due_date_label: 'Due Date:',
      due_date: dueDate,
      status_label: 'Status:',
      status: data.state.toUpperCase(),

      description_label: 'Description:',
      description: data.title,

      items_table: tableData, // 2D array without headers

      total_label: 'TOTAL:',
      total_amount: formattedAmount,

      footer_note:
        'Thank you for your business! Please contact us if you have any questions about this invoice.',
    }

    const pdf = await generate({
      template: invoiceTemplate,
      inputs: [input],
      plugins: { text, table }, // Both plugins needed
    })

    return Buffer.from(pdf instanceof Uint8Array ? pdf.buffer : pdf)
  } catch (error: any) {
    throw new Error(`PDF generation failed: ${error.message}`)
  }
}
