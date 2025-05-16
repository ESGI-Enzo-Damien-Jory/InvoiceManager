import { BaseCommand } from '@adonisjs/core/ace'
import { supabase } from '#start/supabase'
import env from '#start/env'

export default class SupabaseLogin extends BaseCommand {
  static commandName = 'supabase:login'
  static description = 'Login a Supabase user and print the access token'

  async run() {
    const email = env.get('SUPABASE_TEST_EMAIL')
    const password = env.get('SUPABASE_TEST_PASSWORD')

    if (!email || !password) {
      this.logger.error('❌ Missing SUPABASE_TEST_EMAIL or SUPABASE_TEST_PASSWORD in .env')
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      this.logger.error(`❌ Login failed: ${error.message}`)
    } else {
      this.logger.success('✅ Login successful')
      this.logger.info(`JWT token: ${data.session?.access_token}`)
    }
  }
}
