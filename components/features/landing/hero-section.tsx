'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

function ShinyText({ children, className }: { children: React.ReactNode; className?: string }) {
    const [shining, setShining] = React.useState(false)

    const handleMouseEnter = React.useCallback(() => {
        if (shining) return
        setShining(true)
        setTimeout(() => setShining(false), 1000)
    }, [shining])

    return (
        <span
            className={cn(className)}
            onMouseEnter={handleMouseEnter}
            style={{
                backgroundImage: shining
                    ? 'linear-gradient(105deg, currentColor 0%, currentColor 35%, rgba(59,130,246,0.8) 42%, rgba(99,102,241,1) 47%, rgba(255,255,255,0.95) 50%, rgba(99,102,241,1) 53%, rgba(59,130,246,0.8) 58%, currentColor 65%, currentColor 100%)'
                    : 'linear-gradient(105deg, currentColor 0%, currentColor 100%)',
                backgroundSize: '200% 100%',
                backgroundPosition: shining ? '200% center' : '-200% center',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: shining ? 'background-position 0.8s ease-out' : 'none',
            }}>
            {children}
        </span>
    )
}

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection() {
    const { user, displayProfile } = useAuth()
    const isSignedIn = !!user || !!displayProfile
    const searchParams = useSearchParams()
    const router = useRouter()
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    React.useEffect(() => {
        if (isMounted && searchParams.get('logout') === 'true') {
            toast.success('Successfully logged out', {
                description: 'We hope to see you back soon!',
            })
            router.replace('/', { scroll: false })
        }
    }, [isMounted, searchParams, router])

    return (
        <>
            <main className="overflow-hidden">
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(220,90%,60%,.08)_0,hsla(220,80%,50%,.02)_50%,hsla(220,70%,40%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(220,90%,60%,.06)_0,hsla(220,70%,40%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(220,90%,60%,.04)_0,hsla(220,70%,40%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring',
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="absolute inset-0 -z-20">
                            <div
                                aria-hidden="true"
                                className="absolute inset-x-0 top-56 -z-20 hidden h-[1000px] w-full lg:top-32 dark:block"
                                style={{
                                    background: 'radial-gradient(circle at 50% -20%, rgba(37,99,235,0.15) 0%, transparent 70%)',
                                    opacity: 0.5
                                }}
                            />
                        </AnimatedGroup>
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        href="/dashboard"
                                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground text-sm">Introducing ResourceHub</span>
                                        <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    <ShinyText className="mt-8 block max-w-4xl mx-auto text-balance text-4xl sm:text-5xl md:text-7xl lg:mt-16 xl:text-[5.25rem] cursor-default">
                                        Secure Inventory & Resource Management
                                    </ShinyText>
                                    <p
                                        className="mx-auto mt-8 max-w-2xl text-balance text-lg text-zinc-400">
                                        Streamline operations with real-time tracking, multi-level approval workflows, and complete audit logging for all enterprise resources.
                                    </p>
                                </AnimatedGroup>

                                <div className="mt-12 flex flex-col items-center justify-center gap-4 md:flex-row min-h-[64px]">
                                    {isSignedIn ? (
                                        <>
                                            <div className="bg-foreground/10 rounded-[14px] border p-0.5">
                                                <Button
                                                    asChild
                                                    size="lg"
                                                    className="rounded-xl px-5 text-base">
                                                    <Link href="/dashboard">
                                                        <span className="text-nowrap">Go to Dashboard</span>
                                                    </Link>
                                                </Button>
                                            </div>
                                            <Button
                                                asChild
                                                size="lg"
                                                variant="ghost"
                                                className="h-10.5 rounded-xl px-5">
                                                <Link href="/dashboard">
                                                    <span className="text-nowrap">Explore Resources</span>
                                                </Link>
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="bg-foreground/10 rounded-[14px] border p-0.5 cursor-pointer">
                                                <Link href="/signup">
                                                    <Button
                                                        size="lg"
                                                        className="rounded-xl px-5 text-base bg-blue-600 hover:bg-blue-500 text-white">
                                                        <span className="text-nowrap">Get Started</span>
                                                    </Button>
                                                </Link>
                                            </div>
                                            <Link href="/login">
                                                <Button
                                                    size="lg"
                                                    variant="ghost"
                                                    className="h-10.5 rounded-xl px-5 cursor-pointer text-zinc-400 hover:text-white">
                                                    <span className="text-nowrap">Sign In</span>
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative mt-8 overflow-hidden px-2 sm:mt-12 md:mt-20">
                                <div
                                    aria-hidden
                                    className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                                />
                                <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F19] p-3 shadow-2xl shadow-blue-500/5 ring-1 ring-white/10">
                                    {/* Header / Window bar */}
                                    <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-3 rounded-full bg-red-500/70" />
                                            <span className="size-3 rounded-full bg-yellow-500/70" />
                                            <span className="size-3 rounded-full bg-green-500/70" />
                                        </div>
                                        <div className="h-5 w-40 rounded-md bg-white/5 border border-white/5 text-[9px] text-zinc-500 flex items-center justify-center font-mono">resourcehub.internal/dashboard</div>
                                        <div className="w-12" />
                                    </div>
                                    <div className="grid grid-cols-12 gap-4">
                                        {/* Mock Sidebar */}
                                        <div className="col-span-3 hidden md:block border-r border-white/5 pr-4 space-y-4">
                                            <div className="space-y-1.5">
                                                <div className="h-7 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center px-3 gap-2">
                                                    <div className="size-2 rounded-full bg-blue-500" />
                                                    <div className="h-2.5 w-16 rounded bg-blue-400/50" />
                                                </div>
                                                <div className="h-7 rounded-lg flex items-center px-3 gap-2 hover:bg-white/5 transition-colors">
                                                    <div className="size-2 rounded-full bg-zinc-600" />
                                                    <div className="h-2.5 w-20 rounded bg-zinc-600" />
                                                </div>
                                                <div className="h-7 rounded-lg flex items-center px-3 gap-2 hover:bg-white/5 transition-colors">
                                                    <div className="size-2 rounded-full bg-zinc-600" />
                                                    <div className="h-2.5 w-14 rounded bg-zinc-600" />
                                                </div>
                                                <div className="h-7 rounded-lg flex items-center px-3 gap-2 hover:bg-white/5 transition-colors">
                                                    <div className="size-2 rounded-full bg-zinc-600" />
                                                    <div className="h-2.5 w-18 rounded bg-zinc-600" />
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-white/5 space-y-2">
                                                <div className="h-2 w-12 rounded bg-zinc-700" />
                                                <div className="h-6 rounded bg-white/5" />
                                                <div className="h-6 rounded bg-white/5" />
                                            </div>
                                        </div>
                                        {/* Mock Main Content */}
                                        <div className="col-span-12 md:col-span-9 space-y-4">
                                            {/* Top Stat Cards */}
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="h-2.5 w-16 rounded bg-zinc-500" />
                                                        <div className="size-1.5 rounded-full bg-blue-500" />
                                                    </div>
                                                    <div className="h-5 w-8 rounded bg-white/10 font-bold text-white text-lg">1,482</div>
                                                </div>
                                                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="h-2.5 w-20 rounded bg-zinc-500" />
                                                        <div className="size-1.5 rounded-full bg-indigo-500" />
                                                    </div>
                                                    <div className="h-5 w-12 rounded bg-white/10 font-bold text-white text-lg">18 Pending</div>
                                                </div>
                                                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="h-2.5 w-14 rounded bg-zinc-500" />
                                                        <div className="size-1.5 rounded-full bg-purple-500" />
                                                    </div>
                                                    <div className="h-5 w-6 rounded bg-white/10 font-bold text-white text-lg">99.8%</div>
                                                </div>
                                            </div>
                                            {/* Large Chart Area */}
                                            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="h-3 w-32 rounded bg-zinc-400" />
                                                    <div className="flex gap-1">
                                                        <span className="h-4 w-10 rounded bg-white/5" />
                                                        <span className="h-4 w-10 rounded bg-white/5" />
                                                    </div>
                                                </div>
                                                <div className="h-32 flex items-end justify-between gap-1 sm:gap-2 px-2 pt-2 border-b border-white/5">
                                                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50, 65, 80].map((h, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex-1 rounded-t-md bg-gradient-to-t from-blue-600 via-indigo-500 to-purple-500/80 hover:opacity-80 transition-opacity"
                                                            style={{ height: `${h}%` }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
            </main>
        </>
    )
}
