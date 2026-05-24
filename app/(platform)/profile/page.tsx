"use client"

import React, { useState, useEffect } from "react"
import { UserCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { fetchProfileStats, updateProfile } from "@/app/actions/notifications"
import { useServerAction } from "@/lib/hooks/use-server-action"
import { format } from "date-fns"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function ProfilePage() {
  const { displayProfile, role, loading: authLoading, refreshProfile } = useAuth()
  const { data, loading: statsLoading, error, refresh } = useServerAction(
    () => fetchProfileStats(),
    []
  )
  const activeProfile = displayProfile
  const [name, setName] = useState("")
  const [department, setDepartment] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (activeProfile) {
      setName(activeProfile.name)
      setDepartment(activeProfile.department ?? "")
    }
  }, [activeProfile])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const handleSave = async () => {
    setSaving(true)
    const result = await updateProfile({ name, department })
    setSaving(false)
    if (result.success) {
      toast.success("Profile updated")
      await refreshProfile()
      refresh()
    } else {
      toast.error(result.error)
    }
  }

  if (authLoading && !activeProfile) {
    return <Skeleton className="h-64 m-8 bg-white/5" />
  }

  if (!activeProfile) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-zinc-400">You are not signed in.</p>
        <Link href="/login">
          <Button>Go to Login</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 sm:px-6 py-8 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
          <UserCircle className="size-8 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{activeProfile.name}</h1>
          <p className="text-zinc-500">{activeProfile.email}</p>
          <Badge className="mt-1 capitalize bg-white/5 border-white/10">{role}</Badge>
        </div>
      </div>

      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold">Edit Profile</h2>
        <div>
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#111] border-white/5 mt-1"
          />
        </div>
        <div>
          <Label>Department</Label>
          <Input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-[#111] border-white/5 mt-1"
          />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Submitted", value: data?.submitted ?? 0 },
          { label: "Approved", value: data?.approved ?? 0 },
          { label: "Pending", value: data?.pending ?? 0 },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[#0A0A0A] border border-white/5 rounded-xl p-4 text-center"
          >
            <p className="text-[10px] text-zinc-500 uppercase">{s.label}</p>
            <p className="text-2xl font-bold mt-1">
              {statsLoading ? "—" : s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl divide-y divide-white/5">
        <p className="p-4 text-sm font-medium text-zinc-400">Your Activity</p>
        {statsLoading ? (
          <Skeleton className="h-24 m-4 bg-white/5" />
        ) : (data?.activity ?? []).length === 0 ? (
          <p className="p-4 text-sm text-zinc-500 text-center">No activity yet</p>
        ) : (
          (data?.activity ?? []).map((a) => (
            <div key={a.id} className="p-4">
              <p className="text-sm">{a.description}</p>
              <p className="text-[10px] text-zinc-600 mt-1">
                {format(new Date(a.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
