"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { GoogleAuthButton, AuthDivider } from "@/components/features/auth/google-auth-button"
import { toast } from "sonner"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at 6 characters or more")
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password, name)

    if (error) {
      toast.error(error)
      setLoading(false)
      return
    }

    toast.success("Account created! Please sign in.")
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex bg-[#050505]">
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, rgba(37,99,235,0.15) 0%, transparent 70%), radial-gradient(ellipse at 70% 80%, rgba(99,102,241,0.1) 0%, transparent 60%)",
          }}
        />
        <div className="absolute inset-0 bg-[#050505]/40" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-md px-8 text-center"
        >
          <div className="flex items-center justify-center mb-8">
            <Logo className="text-2xl" iconSize="size-10" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Join your team<br />on ResourceHub
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Create your account to start managing resources, submitting requests, and streamlining operations.
          </p>
        </motion.div>

        <div className="absolute inset-0 bg-subtle-grid opacity-30" />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center mb-10 lg:hidden">
            <Logo className="text-lg" iconSize="size-8" />
          </div>

          <div className="space-y-2 mb-8">
            <h1 className="text-2xl font-bold text-white">Create account</h1>
            <p className="text-sm text-zinc-500">Get started with ResourceHub</p>
          </div>

          <GoogleAuthButton label="Sign up with Google" />

          <AuthDivider />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Full Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-[#0A0A0A] border-white/10 rounded-xl h-11 text-sm placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Email</label>
              <Input
                type="email"
                placeholder="you@company.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#0A0A0A] border-white/10 rounded-xl h-11 text-sm placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#0A0A0A] border-white/10 rounded-xl h-11 text-sm pr-10 placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Confirm Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-[#0A0A0A] border-white/10 rounded-xl h-11 text-sm placeholder:text-zinc-600"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Create Account with Email"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
