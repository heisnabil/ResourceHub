"use client"

import React from "react"
import { cn } from "@/lib/utils"

export function Logo({ className, iconSize = "size-7" }: { className?: string; iconSize?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5 text-xl font-bold tracking-tight", className)}>
      <svg className={iconSize} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="primary-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="accent-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Isometric Cube / Hexagon representing a secure hub and repository */}
        {/* Left Side */}
        <path d="M50 15 L18 33.5 L18 69.5 L50 88 L50 51.5 Z" fill="url(#primary-grad)" opacity="0.9" />
        {/* Right Side */}
        <path d="M50 51.5 L82 33.5 L82 69.5 L50 88 Z" fill="url(#primary-grad)" opacity="0.75" />
        {/* Top Side */}
        <path d="M50 15 L82 33.5 L50 51.5 L18 33.5 Z" fill="url(#accent-grad)" opacity="0.95" />
        {/* Floating Inner Core / Node for 'Hub' concept */}
        <circle cx="50" cy="51.5" r="6" fill="#FFFFFF" filter="url(#glow)" />
        {/* Connection lines */}
        <path d="M50 15 L50 30" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M18 33.5 L32 40.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M82 33.5 L68 40.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
      <span className="text-white bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent font-extrabold tracking-tight">
        Resource<span className="text-blue-500 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Hub</span>
      </span>
    </span>
  )
}
