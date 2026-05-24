"use client"

import { useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users } from "lucide-react"
import Link from "next/link"
import { fetchProfiles, updateUserRole } from "@/app/actions/notifications"
import { useServerAction } from "@/lib/hooks/use-server-action"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import type { Profile, UserRole } from "@/types/erp"

export default function AdminPage() {
  const { role } = useAuth()
  const { data: users, loading, error, refresh } = useServerAction(() => fetchProfiles(), [])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  if (role !== "admin") {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-zinc-400">Admin access required.</p>
        <Link href="/admin/login" className="text-blue-400 underline text-sm">
          Go to admin portal
        </Link>
      </div>
    )
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const result = await updateUserRole(userId, newRole)
    if (result.success) {
      toast.success("Role updated")
      refresh()
    } else {
      toast.error(result.error)
    }
  }

  const list = users ?? []

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
        <Users className="text-blue-500" /> User Management
      </h1>
      <p className="text-sm text-zinc-500 mb-8">
        Admin role requires an allowlisted email (ADMIN_EMAILS).
      </p>

      {loading ? (
        <Skeleton className="h-64 w-full bg-white/5" />
      ) : list.length === 0 ? (
        <p className="text-zinc-500 text-center py-16">No users found</p>
      ) : (
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl divide-y divide-white/5">
          {list.map((user: Profile) => (
            <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-zinc-500">{user.email}</p>
                {user.department && <p className="text-xs text-zinc-600">{user.department}</p>}
              </div>
              <Select value={user.role} onValueChange={(v) => handleRoleChange(user.id, v as UserRole)}>
                <SelectTrigger className="w-36 bg-[#111] border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
