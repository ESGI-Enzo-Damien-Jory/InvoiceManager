import type { HttpContext } from '@adonisjs/core/http'
import { supabase as supabaseService } from '#start/supabase'

export default class InvoiceSettingsController {
  // GET /api/invoice-settings
  public async show({ request, response, logger }: HttpContext) {
    const user = request.user
    logger.info(`[InvoiceSettings] Fetching settings for user: ${user.id}`)
    
    // First, let's check with the service client (bypasses RLS)
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('invoice_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()
      
    logger.info(`[InvoiceSettings] Service client result: ${JSON.stringify(serviceData)}, error: ${serviceError?.message}`)
    
    // Now try with the user's client (respects RLS)
    const { data, error } = await request.supabase
      .from('invoice_settings')
      .select('prefix, next_number')
      .eq('user_id', user.id)
      .single()
      
    if (error) {
      logger.warn(`[InvoiceSettings] Error fetching settings with user client: ${error.message}`)
    }
    
    if (error || !data) {
      logger.info(`[InvoiceSettings] No settings found, creating defaults for user: ${user.id}`)
      // Auto-create default settings if missing - use service client to bypass RLS
      const { data: created, error: createError } = await supabaseService
        .from('invoice_settings')
        .insert({ user_id: user.id, prefix: 'INV', next_number: 1 })
        .select('prefix, next_number')
        .single()
        
      if (createError) {
        logger.error(`[InvoiceSettings] Failed to create settings: ${createError.message}`)
      }
      
      if (createError || !created) {
        return response.status(404).json({ error: 'Invoice settings not found and could not be created' })
      }
      logger.info(`[InvoiceSettings] Created default settings: ${JSON.stringify(created)}`)
      return response.json(created)
    }
    
    logger.info(`[InvoiceSettings] Found settings: ${JSON.stringify(data)}`)
    return response.json(data)
  }

  // PUT /api/invoice-settings
  public async update({ request, response, logger }: HttpContext) {
    const user = request.user
    const { prefix, reset_number } = request.only(['prefix', 'reset_number'])
    
    logger.info(`[InvoiceSettings] Update request for user ${user.id}: prefix=${prefix}, reset_number=${reset_number}`)
    
    const updateData: any = {}
    if (prefix) updateData.prefix = prefix
    if (reset_number === true) updateData.next_number = 1
    if (Object.keys(updateData).length === 0) {
      return response.badRequest({ error: 'No changes provided' })
    }
    updateData.updated_at = new Date().toISOString()
    
    // Use service client to bypass RLS for now
    const { data, error } = await supabaseService
      .from('invoice_settings')
      .update(updateData)
      .eq('user_id', user.id)
      .select('prefix, next_number')
      .single()
      
    if (error) {
      logger.error(`[InvoiceSettings] Update failed: ${error.message}`)
    }
    
    if (error || !data) {
      return response.status(500).json({ error: 'Failed to update invoice settings' })
    }
    
    logger.info(`[InvoiceSettings] Updated settings: ${JSON.stringify(data)}`)
    return response.json(data)
  }
} 