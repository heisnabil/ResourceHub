'use client'

import React, { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { fetchNotifications, fetchUnreadCount, markAllNotificationsRead, markNotificationRead } from '@/app/actions/notifications'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import type { Notification } from '@/types/erp'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)

  const load = async () => {
    const [listResult, countResult] = await Promise.all([
      fetchNotifications(),
      fetchUnreadCount(),
    ])
    if (listResult.success) setNotifications(listResult.data)
    if (countResult.success) setUnread(countResult.data)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkRead = async (id: string) => {
    const result = await markNotificationRead(id)
    if (result.success) load()
  }

  const handleMarkAllRead = async () => {
    const result = await markAllNotificationsRead()
    if (result.success) {
      toast.success('All notifications marked as read')
      load()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white">
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-[#0A0A0A] border-white/10">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unread > 0 && (
            <button type="button" onClick={handleMarkAllRead} className="text-xs text-blue-400 hover:text-blue-300">
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {notifications.length === 0 ? (
          <div className="py-6 text-center text-sm text-zinc-500">No notifications</div>
        ) : (
          notifications.slice(0, 10).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!n.isRead ? 'bg-blue-500/5' : ''}`}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
            >
              <span className="text-sm font-medium text-zinc-200">{n.title}</span>
              <span className="text-xs text-zinc-500">{n.message}</span>
              <span className="text-[10px] text-zinc-600">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
