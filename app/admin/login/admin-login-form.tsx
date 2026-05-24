'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Eye, EyeOff, Shield } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { useAuth } from '@/lib/auth-context'
import { verifyAdminPortalAccess } from '@/app/actions/auth'
import { toast } from 'sonner'

export function AdminLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const err = searchParams.get('error')
    if (err === 'forbidden') toast.error('Admin access required')
    if (err === 'use_admin_portal') {
      toast.error('Use your admin email and password here — not Google sign-in')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const normalizedEmail = email.trim().toLowerCase()

    const { error: signInError } = await signIn(normalizedEmail, password)
    if (signInError) {
      const lower = signInError.toLowerCase()
      if (lower.includes('invalid') && lower.includes('credential')) {
        toast.error(
          'Wrong email or password. Run npm run admin:create once (see package.json scripts).'
        )
      } else {
        toast.error(signInError)
      }
      setLoading(false)
      return
    }

    const result = await verifyAdminPortalAccess()
    if (!result.success) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success('Admin access granted')
    router.refresh()
    router.push('/admin')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="size-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Shield className="size-7 text-blue-500" />
            </div>
          </div>
          <Logo className="text-lg justify-center" iconSize="size-8" />
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-sm text-zinc-500">
            Email + password only. Google sign-in is not used here.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
              Admin email
            </label>
            <Input
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#0A0A0A] border-white/10 rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#0A0A0A] border-white/10 rounded-xl h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Sign in as Admin'}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Employee?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Use employee login
          </Link>
        </p>
      </div>
    </div>
  )
}
