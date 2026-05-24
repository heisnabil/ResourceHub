'use client'

import { useEffect, useRef, useState } from 'react'

type UseCountUpOptions = {
  start?: number
  end: number
  duration?: number
}

export function useCountUp({ start = 0, end, duration = 2 }: UseCountUpOptions): number {
  const [value, setValue] = useState(start)
  const frameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const previousEndRef = useRef<number>(end)

  useEffect(() => {
    // Reset when end changes significantly
    if (previousEndRef.current !== end) {
      previousEndRef.current = end
      setValue(start)
      startTimeRef.current = null
    }

    const totalDurationMs = Math.max(duration, 0.2) * 1000

    const step = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / totalDurationMs, 1)

      const nextValue = start + (end - start) * progress
      setValue(Math.round(nextValue))

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(step)
      }
    }

    frameRef.current = window.requestAnimationFrame(step)

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [start, end, duration])

  return value
}

