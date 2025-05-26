import { generate } from '@pdfme/generator'
import { invoiceTemplate } from './templates/invoice_template.js'

interface TestData {
  a: string
  b: string
  c: string
}

export async function generateInvoicePdf(data: TestData): Promise<Buffer> {
  const pdf = await generate({
    template: invoiceTemplate,
    inputs: [data],
  })

  return pdf instanceof Uint8Array ? Buffer.from(pdf.buffer) : Buffer.from(pdf)
}
