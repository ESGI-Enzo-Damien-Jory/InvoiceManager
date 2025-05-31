/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),

  SUPABASE_URL: Env.schema.string({ format: 'url' }),
  SUPABASE_ANON_KEY: Env.schema.string(),
  SUPABASE_SERVICE_ROLE_KEY: Env.schema.string(),

  FRONTEND_URL: Env.schema.string({ format: 'url', tld: false }),

  SUPABASE_TEST_EMAIL: Env.schema.string.optional(),
  SUPABASE_TEST_PASSWORD: Env.schema.string.optional(),
})
