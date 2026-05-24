'use client'

import { cn } from '@/lib/utils'

type GreenHoverBeamProps = {
  radiusClass?: string
  className?: string
}

export function GreenHoverBeam({ radiusClass = 'rounded-xl', className }: GreenHoverBeamProps) {
  return (
    <>
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-50',
          radiusClass,
          'bg-[radial-gradient(600px_circle_at_50%_0%,rgba(34,197,94,0.2),transparent_65%)]',
          className,
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute top-[-150%] left-[-150%] h-[300%] w-[300%] rotate-25',
          'opacity-0 transition-all duration-500 ease-out',
          'bg-[linear-gradient(120deg,transparent_42%,rgba(34,197,94,0.2)_47%,rgba(34,197,94,0.55)_50%,rgba(34,197,94,0.2)_53%,transparent_58%)]',
          'group-hover:opacity-100 group-hover:translate-x-[55%] group-hover:translate-y-[55%]',
        )}
      />
    </>
  )
}

