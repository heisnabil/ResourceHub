'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ActionResult } from '@/types/erp'

export function useServerAction<T>(
  action: () => Promise<ActionResult<T>>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const actionRef = useRef(action)
  actionRef.current = action

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await actionRef.current()
    if (result.success) {
      setData(result.data)
    } else {
      setError(result.error)
      setData(null)
    }
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    refresh()
  }, [refresh])

  return { data, loading, error, refresh, setData }
}
