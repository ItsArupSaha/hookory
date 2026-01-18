"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { User } from "firebase/auth"

interface NavbarProps {
    user: User | null
    loading: boolean
    navLoading: null | "login" | "signup" | "dashboard"
    setNavLoading: (state: null | "login" | "signup" | "dashboard") => void
    navigateWithFade: (href: string) => Promise<void>
    handleScrollToPricing: () => void
}

export function Navbar({ user, loading, navLoading, setNavLoading, navigateWithFade, handleScrollToPricing }: NavbarProps) {
    const router = useRouter()

    return (
        <nav className="fixed top-6 left-0 right-0 max-w-[95%] mx-auto rounded-full bg-white/80 backdrop-blur-xl border border-stone-300 shadow-sm z-50 transition-all duration-300">
            <div className="container mx-auto flex items-center justify-between px-6 py-3">
                <Link href="/" className="flex items-center gap-3 group">
                    <Image
                        src="/hookory_Logo_light_nobg.png"
                        alt="Hookory"
                        width={160}
                        height={160}
                        className="h-40 w-40 -my-16 -ml-6 object-contain"
                    />
                </Link>
                <div className="flex items-center gap-3 md:gap-4">
                    <button
                        type="button"
                        onClick={handleScrollToPricing}
                        className="text-sm text-slate-600 transition-colors hover:text-emerald-700 font-medium"
                    >
                        Pricing
                    </button>
                    {loading ? (
                        <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
                    ) : user ? (
                        <Button size="sm" asChild className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-md">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-1"
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (navLoading) return
                                    setNavLoading("dashboard")
                                    navigateWithFade("/dashboard")
                                }}
                            >
                                Dashboard
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    setNavLoading("login")
                                    router.push("/login")
                                }}
                                className="text-sm text-slate-600 transition-colors hover:text-emerald-700 font-medium"
                            >
                                {navLoading === "login" ? "Loading..." : "Log in"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setNavLoading("signup")
                                    router.push("/signup")
                                }}
                                className="relative inline-flex h-8 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-50 shadow-md hover:scale-105 transition-transform duration-200"
                            >
                                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#059669_0%,#6ee7b7_50%,#059669_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-emerald-600 px-4 text-xs font-semibold text-white backdrop-blur-3xl transition-colors hover:bg-emerald-700">
                                    {navLoading === "signup" ? (
                                        <span className="flex items-center gap-1">
                                            <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                            Loading...
                                        </span>
                                    ) : (
                                        <>
                                            Try free
                                            <ArrowRight className="ml-1 h-3 w-3" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
