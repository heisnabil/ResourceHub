/** Server-only admin allowlist — comma-separated emails in ADMIN_EMAILS */

function parseAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? ''
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function getAdminEmails(): string[] {
  return parseAdminEmails()
}

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const normalized = email.trim().toLowerCase()
  const allowlist = parseAdminEmails()
  if (allowlist.length === 0) return false
  return allowlist.includes(normalized)
}

export function isAdminPortalConfigured(): boolean {
  return parseAdminEmails().length > 0
}
