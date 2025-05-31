import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

declare module '@adonisjs/core/http' {
  interface Request {
    user: User
    supabase: SupabaseClient
  }
}
