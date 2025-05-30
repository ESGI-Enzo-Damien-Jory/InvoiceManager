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
    name?: string
    item_id?: string
    quantity: number
    unit_price: number
    total?: number
  }>
}

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  try {
    console.log('PDF Generation - Input data:', JSON.stringify(data, null, 2))

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

    let calculatedTotal = 0
    if (data.items && data.items.length > 0) {
      calculatedTotal = data.items.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0
        const unitPrice = Number(item.unit_price) || 0
        const itemTotal = item.total !== undefined ? Number(item.total) : quantity * unitPrice
        return sum + itemTotal
      }, 0)
      console.log('Calculated total from items:', calculatedTotal)
    }

    const finalTotal = calculatedTotal > 0 ? calculatedTotal : Number(data.total_amount) || 0
    console.log('Final total amount:', finalTotal)

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(finalTotal)

    const clientName = `${data.client_first_name} ${data.client_last_name}`
    const clientAddress = data.client_address || ''
    const clientPhone = data.client_phone ? `Phone: ${data.client_phone}` : ''
    const fullAddress = [clientAddress, clientPhone].filter(Boolean).join('\n')

    let tableData: string[][]

    if (data.items && data.items.length > 0) {
      console.log('Processing items for table:', data.items)

      tableData = data.items.map((item, index) => {
        console.log(`Processing item ${index}:`, item)

        const itemName = item.name || `Item ${index + 1}`
        const quantity = Number(item.quantity) || 0
        const unitPrice = Number(item.unit_price) || 0

        const itemTotal = item.total !== undefined ? Number(item.total) : quantity * unitPrice

        const row = [
          itemName,
          String(quantity),
          `$${unitPrice.toFixed(2)}`,
          `$${itemTotal.toFixed(2)}`,
        ]

        console.log(`Generated row:`, row)
        return row
      })
    } else {
      console.log('No items provided, using default row')
      tableData = [['No items', '0', '$0.00', '$0.00']]
    }

    console.log('Final table data:', tableData)

    const input = {
      invoice_title: 'INVOICE',
      invoice_id: `#${data.invoice_id.substring(0, 8).toUpperCase()}`,

      from_label: 'FROM:',
      from_name: data.owner_name || 'N/A',
      from_email: data.owner_email || 'N/A',

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

      items_table: tableData,

      total_label: 'TOTAL:',
      total_amount: formattedAmount,

      footer_note:
        'Thank you for your business! Please contact us if you have any questions about this invoice.',
    }

    console.log('PDF input data:', JSON.stringify(input, null, 2))

    const pdf = await generate({
      template: invoiceTemplate,
      inputs: [input],
      plugins: { text, table },
    })

    return Buffer.from(pdf instanceof Uint8Array ? pdf.buffer : pdf)
  } catch (error: any) {
    console.error('PDF generation error:', error)
    throw new Error(`PDF generation failed: ${error.message}`)
  }
}
