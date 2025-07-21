import type { HttpContext } from '@adonisjs/core/http'
import { supabase } from '#start/supabase'
import { uploadAvatarToStorage } from '#services/profile_service'
import { promises as fs } from 'node:fs'
import { UserProfile, Update, UpdateProfilePayload } from '@inma/types'

interface ProfileResponse
  extends Pick<UserProfile, 'id' | 'display_name' | 'email' | 'phone_number' | 'updated_at'> {
  avatar_url: string | null
}

export default class ProfilesController {
  public async show({ request }: HttpContext) {
    const user = request.user

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, display_name, email, phone_number, avatar_url, updated_at')
      .eq('id', user.id)
      .single()

    if (error) {
      throw new Error(`[USER] Failed to fetch profile: ${error.message}`)
    }

    const profileData = profile as Pick<
      UserProfile,
      'id' | 'display_name' | 'email' | 'phone_number' | 'avatar_url' | 'updated_at'
    >

    let avatarSignedUrl: string | null = null
    if (profileData.avatar_url) {
      const { data, error: urlError } = await supabase.storage
        .from('avatars')
        .createSignedUrl(profileData.avatar_url, 60 * 60)

      if (!urlError && data?.signedUrl) {
        avatarSignedUrl = data.signedUrl
      }
    }

    const response: ProfileResponse = {
      ...profileData,
      avatar_url: avatarSignedUrl,
    }

    return response
  }

  public async update({ request, logger }: HttpContext) {
    const user = request.user
    const updates: UpdateProfilePayload = request.only(['display_name', 'phone_number'])

    logger.info(`[USER] Updating profile for user ${user.id}`)

    const updateData: Update<'profiles'> = updates

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()

    if (error) {
      logger.error(`[USER] Update failed: ${error.message}`)
      throw new Error(error.message)
    }

    const profiles = data as UserProfile[]
    logger.info(`[USER] Profile updated for ${user.email}`)
    return profiles[0]
  }

  public async uploadAvatar({ request, response, logger }: HttpContext) {
    const user = request.user
    const avatarFile = request.file('avatar', {
      extnames: ['jpg', 'jpeg', 'png'],
      size: '5mb',
    })

    if (!avatarFile) {
      return response.badRequest({ error: 'No file uploaded' })
    }

    if (!avatarFile.isValid) {
      return response.badRequest({ error: avatarFile.errors })
    }

    try {
      if (!avatarFile.type) {
        return response.badRequest({ error: 'File type is missing' })
      }

      const buffer = await fs.readFile(avatarFile.tmpPath!)
      const avatarPath = await uploadAvatarToStorage(user.id, buffer, avatarFile.type)

      const updateData: Update<'profiles'> = {
        avatar_url: avatarPath,
      }

      const { error } = await supabase.from('profiles').update(updateData).eq('id', user.id)

      if (error) {
        throw new Error(error.message)
      }

      logger.info(`[USER] Avatar uploaded for ${user.id}`)
      return { message: 'Avatar uploaded successfully' }
    } catch (err: any) {
      logger.error(`[USER] Avatar upload failed: ${err.message}`)
      return response.internalServerError({ error: 'Avatar upload failed', details: err.message })
    }
  }
}
