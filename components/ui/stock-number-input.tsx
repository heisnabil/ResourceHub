'use client'

import { Input } from '@/components/ui/input'
import { useEffect, useState, type ComponentProps } from 'react'

const MAX_DIGITS = 6

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** Strip leading zeros; empty string if only zeros. */
function stripLeadingZeros(digits: string): string {
  return digits.replace(/^0+/, '')
}

function numberToDisplay(n: number, min: number): string {
  if (n === 0 && min === 0) return ''
  return String(n)
}

function parseInput(raw: string, min: number, max: number): { display: string; value: number } {
  let digits = raw.replace(/\D/g, '').slice(0, MAX_DIGITS)

  if (digits === '') {
    return { display: '', value: min > 0 ? min : 0 }
  }

  const withoutLeading = stripLeadingZeros(digits)
  if (withoutLeading === '') {
    return { display: '', value: 0 }
  }

  const value = clamp(Number.parseInt(withoutLeading, 10), min, max)
  const display = value === 0 && min === 0 ? '' : String(value)
  return { display, value }
}

type StockNumberInputProps = Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> & {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

/** Whole numbers only — no leading zeros; empty field when 0 (min 0). */
export function StockNumberInput({
  value,
  onChange,
  min = 0,
  max = 999_999,
  placeholder,
  ...props
}: StockNumberInputProps) {
  const [text, setText] = useState(() => numberToDisplay(clamp(value, min, max), min))

  useEffect(() => {
    setText(numberToDisplay(clamp(value, min, max), min))
  }, [value, min, max])

  return (
    <Input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder ?? (min > 0 ? String(min) : '0')}
      value={text}
      onChange={(e) => {
        const { display, value: next } = parseInput(e.target.value, min, max)
        setText(display)
        onChange(next)
      }}
      onBlur={() => {
        const normalized = clamp(value, min, max)
        setText(numberToDisplay(normalized, min) || (min > 0 ? String(min) : ''))
        if (normalized !== value) onChange(normalized)
      }}
      {...props}
    />
  )
}
