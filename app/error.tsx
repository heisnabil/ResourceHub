'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-4 px-6">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-zinc-500 text-center max-w-md">
        {error.message || 'A client error occurred. Try refreshing the page.'}
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
