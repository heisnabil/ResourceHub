/**
 * Create or reset the admin user (safe to run multiple times).
 * Requires .env.local: ADMIN_EMAIL, ADMIN_PASSWORD, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL
 *
 * Use the SAME Supabase project as Vercel production before testing https://resource-hub-fawn.vercel.app/admin/login
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnvLocal() {
  const path = join(root, '.env.local')
  if (!existsSync(path)) {
    console.error('Missing .env.local')
    process.exit(1)
  }
  const lines = readFileSync(path, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvLocal()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD

if (!url || !serviceKey || !email || !password) {
  console.error('Set in .env.local:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL')
  console.error('  SUPABASE_SERVICE_ROLE_KEY')
  console.error('  ADMIN_EMAIL')
  console.error('  ADMIN_PASSWORD')
  process.exit(1)
}

if (password.length < 8) {
  console.error('ADMIN_PASSWORD must be at least 8 characters')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

let userId = null

const { data: created, error: createError } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { name: 'System Admin' },
})

if (createError) {
  if (!createError.message.toLowerCase().includes('already')) {
    console.error('Create user failed:', createError.message)
    process.exit(1)
  }
  console.log('Auth user already exists — resetting password and admin profile...')
} else {
  userId = created.user?.id
  console.log('Created new auth user.')
}

if (!userId) {
  const { data: list, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (listError) {
    console.error('listUsers failed:', listError.message)
    process.exit(1)
  }
  const user = list?.users.find((u) => u.email?.toLowerCase() === email)
  if (!user) {
    console.error('Could not find user for', email)
    process.exit(1)
  }
  userId = user.id
}

const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
  password,
  email_confirm: true,
})

if (updateError) {
  console.error('Password update failed:', updateError.message)
  process.exit(1)
}

const { error: profileError } = await admin.from('profiles').upsert(
  {
    id: userId,
    name: 'System Admin',
    email,
    role: 'admin',
  },
  { onConflict: 'id' }
)

if (profileError) {
  console.error('Profile upsert failed:', profileError.message)
  process.exit(1)
}

console.log('\n✓ Admin ready')
console.log('  Supabase:', url)
console.log('  Email:   ', email)
console.log('  Password: (from ADMIN_PASSWORD in .env.local)')
console.log('\nLocal:      http://localhost:3000/admin/login')
console.log('Production: https://resource-hub-fawn.vercel.app/admin/login')
console.log('\nVercel must have the same ADMIN_EMAILS value:')
console.log(`  ADMIN_EMAILS=${email}`)
