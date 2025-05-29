import { BaseCommand } from '@adonisjs/core/ace'
import { supabase } from '#start/supabase'

export default class SeedTestData extends BaseCommand {
  static readonly commandName = 'seed:test'
  static readonly description = 'Insert test user, client, and invoice for dev/testing'

  async run() {
    const userId = '81ac2d5b-0965-4456-a5da-088a1179011a'
    const clientId = '22222222-2222-2222-2222-222222222222'
    const invoiceId = '33333333-3333-3333-3333-333333333333'

    const { error: clientError } = await supabase.from('clients').upsert([
      {
        id: clientId,
        user_id: userId,
        first_name: 'Client',
        last_name: 'One',
        email: 'client1@example.com',
        phone_number: '987-654-3210',
        address: '123 Main Street\nCity, Country',
      },
    ])

    if (clientError) {
      this.logger.error(`❌ Failed to insert client: ${clientError.message}`)
      return
    }

    const { error: invoiceError } = await supabase.from('invoices').upsert([
      {
        id: invoiceId,
        owner_id: userId,
        client_id: clientId,
        title: 'Test Invoice',
        state: 'Draft',
        total_amount: 100.0,
        expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ])

    if (invoiceError) {
      this.logger.error(`❌ Failed to insert invoice: ${invoiceError.message}`)
      return
    }

    this.logger.success('✅ Test client and invoice inserted successfully')
  }
}
