'use client'

import React from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { Logo } from '@/components/ui/logo'

const menuItems = [
    { name: 'Features', href: '/#features' },
    { name: 'Testimonials', href: '/#testimonials' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'FAQs', href: '/#faqs' },
]

export const HeroHeader = ({ sidebarTrigger, hideNavLinks, isFixed = true }: { sidebarTrigger?: React.ReactNode; hideNavLinks?: boolean; isFixed?: boolean } = {}) => {
    const { user, displayProfile, signOut } = useAuth()
    const isSignedIn = !!user || !!displayProfile
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => {
        setIsMounted(true)
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (!isMounted) {
        return <header className={cn("z-20 w-full px-2 group z-[999] h-16", isFixed ? "fixed top-0 left-0 right-0" : "relative")} />
    }

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className={cn("z-20 w-full px-2 group z-[999]", isFixed ? "fixed top-0 left-0 right-0" : "relative")}>
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <div className="flex items-center gap-2">
                                {sidebarTrigger && (
                                    <div className="flex items-center">
                                        {sidebarTrigger}
                                    </div>
                                )}
                                <Link
                                    href="/"
                                    aria-label="home"
                                    className="flex items-center space-x-2">
                                    <Logo />
                                </Link>
                            </div>

                            {!hideNavLinks && (
                                <button
                                    onClick={() => setMenuState(!menuState)}
                                    aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                    className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                    <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                    <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                                </button>
                            )}
                        </div>

                        {!hideNavLinks && (
                            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                                <ul className="flex gap-8 text-sm">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            {!hideNavLinks && (
                                <div className="lg:hidden">
                                    <ul className="space-y-6 text-base">
                                        {menuItems.map((item, index) => (
                                            <li key={index}>
                                                <Link
                                                    href={item.href}
                                                    className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                    <span>{item.name}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit items-center">
                                {!isSignedIn ? (
                                    <>
                                        <Link href="/login" className={cn(isScrolled && 'lg:hidden')}>
                                            <Button variant="outline" size="sm">
                                                <span>Sign In</span>
                                            </Button>
                                        </Link>
                                        <Link href="/signup" className={cn(isScrolled && 'lg:hidden')}>
                                            <Button size="sm">
                                                <span>Sign Up</span>
                                            </Button>
                                        </Link>
                                        <Link href="/signup" className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}>
                                            <Button size="sm">
                                                <span>Get Started</span>
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/dashboard" className={cn(isScrolled && 'lg:hidden')}>
                                            <Button variant="ghost" size="sm">
                                                <span>Dashboard</span>
                                            </Button>
                                        </Link>
                                        <Button variant="outline" size="sm" onClick={() => signOut()} className={cn(isScrolled && 'lg:hidden')}>
                                            <span>Sign Out</span>
                                        </Button>
                                        <Link href="/dashboard" className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}>
                                            <Button size="sm">
                                                <span>Go to Hub</span>
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
