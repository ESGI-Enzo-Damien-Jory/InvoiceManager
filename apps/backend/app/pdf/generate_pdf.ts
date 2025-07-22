import { generate } from '@pdfme/generator'
import { text, table, svg, line, multiVariableText } from '@pdfme/schemas'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

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

    // Read template JSON file
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const templatePath = join(__dirname, '../../templates/template.json')
    const templateContent = readFileSync(templatePath, 'utf-8')
    const template = JSON.parse(templateContent)

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

    const clientName = `${data.client_first_name} ${data.client_last_name}`
    const clientAddress = data.client_address || ''
    const clientPhone = data.client_phone ? `Phone: ${data.client_phone}` : ''
    const fullAddress = [clientAddress, clientPhone].filter(Boolean).join('\n')

    // Format client info for the template
    const clientInfo = [clientName, data.client_email, fullAddress].filter(Boolean).join('\n')

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
          String(unitPrice), // Remove $ symbol for calculations
          String(itemTotal), // Remove $ symbol for calculations
        ]

        console.log(`Generated row:`, row)
        return row
      })
    } else {
      console.log('No items provided, using default row')
      tableData = [['No items', '0', '0', '0']]
    }

    console.log('Final table data:', tableData)

    // Format payment info
    const paymentInfo = [
      'Invoice Manager',
      `Account Name: ${clientName}`,
      `Email: ${data.client_email}`,
      `Due Date: ${dueDate}`,
    ].join('\n')

    const input = {
      billedToInput: clientInfo,
      info: JSON.stringify({
        InvoiceNo: data.invoice_id.substring(0, 8).toUpperCase(),
        Date: issueDate,
      }),
      orders: tableData,
      taxInput: JSON.stringify({
        rate: '10',
      }),
      paymentInfoInput: paymentInfo,
      shopName: 'Invoice Manager',
      shopAddress: 'Professional Invoice Management System',
    }

    console.log('PDF input data:', JSON.stringify(input, null, 2))

    const pdf = await generate({
      template: template as any,
      inputs: [input],
      plugins: { text, table, svg, line, multiVariableText },
    })

    return Buffer.from(pdf instanceof Uint8Array ? pdf.buffer : pdf)
  } catch (error: any) {
    console.error('PDF generation error:', error)
    throw new Error(`PDF generation failed: ${error.message}`)
  }
}
