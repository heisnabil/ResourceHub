import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/lib/auth-context'

export function profileFromAuthUser(user: User): UserProfile {
  const meta = user.user_metadata ?? {}
  const name =
    (typeof meta.name === 'string' && meta.name) ||
    (typeof meta.full_name === 'string' && meta.full_name) ||
    user.email?.split('@')[0] ||
    'User'

  const avatar =
    (typeof meta.avatar_url === 'string' && meta.avatar_url) ||
    (typeof meta.picture === 'string' && meta.picture) ||
    null

  return {
    id: user.id,
    name,
    email: user.email ?? '',
    role: 'employee',
    department: null,
    avatar,
  }
}

export function getDisplayProfile(
  profile: UserProfile | null,
  user: User | null
): UserProfile | null {
  if (profile) return profile
  if (user) return profileFromAuthUser(user)
  return null
}
