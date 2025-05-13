import type { HttpContext } from '@adonisjs/core/http'
import { supabase } from '#start/supabase'

export default class ClientsController {
  public async index({ request }: HttpContext) {
    const user = request.user
    console.log('📦 request.user in controller:', request.user)

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) throw new Error(error.message)
    return data
  }

  public async store({ request }: HttpContext) {
    const user = request.user
    const body = request.only(['first_name', 'last_name', 'email', 'phone_number', 'address'])

    const { data, error } = await supabase.from('clients').insert({ ...body, user_id: user.id })

    if (error) throw new Error(error.message)
    return data
  }

  public async update({ request, params }: HttpContext) {
    const user = request.user
    const body = request.only(['first_name', 'last_name', 'email', 'phone_number', 'address'])

    const { data, error } = await supabase
      .from('clients')
      .update(body)
      .match({ id: params.id, user_id: user.id })

    if (error) throw new Error(error.message)
    return data
  }

  public async destroy({ request, params }: HttpContext) {
    const user = request.user

    const { error } = await supabase
      .from('clients')
      .update({ deleted_at: new Date().toISOString() })
      .match({ id: params.id, user_id: user.id })

    if (error) throw new Error(error.message)
    return { deleted: true }
  }
}
