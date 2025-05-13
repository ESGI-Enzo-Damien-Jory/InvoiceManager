import { BaseCommand } from '@adonisjs/core/ace'
import { supabase } from '#start/supabase'

export default class SupabaseLogin extends BaseCommand {
  static commandName = 'supabase:login'
  static description = 'Login a Supabase user and print the access token'

  async run() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'yourpassword',
    })

    if (error) {
      console.error('❌ Login failed:', error.message)
    } else {
      console.log('✅ JWT token:', data.session?.access_token)
    }
  }
}
