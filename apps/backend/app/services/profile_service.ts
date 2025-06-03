import { supabase } from '#start/supabase'

export async function uploadAvatarToStorage(
  userId: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const filename = `${userId}/avatar-${Date.now()}.png`

  const { error } = await supabase.storage.from('avatars').upload(filename, file, {
    contentType,
    upsert: true,
  })

  if (error) {
    throw new Error(`Failed to upload avatar: ${error.message}`)
  }

  return filename
}
