import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRef = 'hrxghlenxbymmgfcsjmp'
const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const migrationPath = join(root, 'supabase', 'migrations', '001_production_schema.sql')

console.log('\nResourceHub database setup\n')
console.log('The app needs tables like public.requests — run the migration in Supabase:\n')
console.log(`  1. Open: ${sqlEditorUrl}`)
console.log(`  2. Paste the contents of:\n     ${migrationPath}`)
console.log('  3. Click Run\n')
console.log('After it succeeds, refresh the app.\n')
console.log('To promote your account to admin (replace email):')
console.log("  UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';\n")

try {
  const sql = readFileSync(migrationPath, 'utf8')
  const lineCount = sql.split('\n').length
  console.log(`Migration file: ${lineCount} lines ready to copy.\n`)
} catch {
  console.log('Could not read migration file.\n')
}

try {
  execSync(`start "" "${sqlEditorUrl}"`, { stdio: 'ignore', shell: true })
} catch {
  // non-Windows or start failed — URL is printed above
}
