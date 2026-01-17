"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { User } from "firebase/auth"

interface PricingSectionProps {
    user: User | null
}

export function PricingSection({ user }: PricingSectionProps) {
    return (
        <>
            {/* Pricing Hookline - Bold conversion moment */}
            <section className="py-16 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-stone-50 to-emerald-100 border-y border-emerald-100/50">
                <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-0 text-center">
                    <div className="inline-block px-8 py-6 bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-white/50 ring-1 ring-emerald-100">
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-stone-700 leading-tight">
                            Why pay{" "}
                            <span className="text-stone-400 line-through decoration-2 decoration-rose-400">$20-50/month</span>{" "}
                            on other tools with less quality?
                        </p>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                            We deliver REAL VALUE only at{" "}
                            <span className="text-3xl sm:text-4xl md:text-5xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent drop-shadow-sm">
                                $9.99/month!
                            </span>
                        </p>
                        <p className="text-sm sm:text-base text-stone-600 mt-4 font-medium">
                            Better quality. Better features. Still 70% cheaper.
                        </p>
                        {!user && (
                            <div className="mt-6">
                                <Link href="/signup" className="relative inline-flex h-12 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-50 shadow-xl hover:scale-105 transition-transform duration-200">
                                    <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#059669_0%,#6ee7b7_50%,#059669_100%)]" />
                                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-emerald-600 px-8 py-1 text-base font-semibold text-white backdrop-blur-3xl transition-colors hover:bg-emerald-700">
                                        Start saving today <ArrowRight className="ml-2 h-4 w-4" />
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Pricing Details */}
            <section id="pricing" className="mt-20 py-16 px-4 md:px-6 lg:px-8 bg-white/50">
                <h2 className="text-center text-2xl font-semibold text-slate-900">
                    Pricing that grows with your LinkedIn
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Start free, upgrade when the platform starts driving pipeline.
                </p>
                <p className="mt-3 text-center text-xs font-medium text-emerald-600">
                    Better quality than $20-50/month tools — all for just $9.99/month
                </p>
                <div className="mt-8 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
                    <Card className="border-stone-200 bg-white shadow-sm transition-transform duration-150 hover:-translate-y-1">
                        <CardHeader>
                            <CardTitle className="flex items-baseline justify-between">
                                <span className="text-slate-900">Free</span>
                                <span className="text-sm font-normal text-slate-500">
                                    For testing the waters
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-slate-700">
                            <p className="text-2xl font-semibold text-slate-900">
                                $0{" "}
                                <span className="text-xs font-normal text-slate-500">
                                    / month
                                </span>
                            </p>
                            <ul className="space-y-1.5">
                                <li>• 5 repurposes / month</li>
                                <li>• All four LinkedIn formats</li>
                                <li>• No history, no regenerate</li>
                                <li>• Paste text input only</li>
                            </ul>
                            <Button variant="outline" className="mt-2 w-full border-stone-200 hover:bg-stone-50 text-emerald-600 hover:text-emerald-700" asChild>
                                <Link href="/signup">Get started free</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-md transition-transform duration-150 hover:-translate-y-1.5">
                        <CardHeader>
                            <CardTitle className="flex items-baseline justify-between">
                                <span className="text-slate-900">Creator</span>
                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                    Recommended
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-emerald-900">
                            <p className="text-2xl font-semibold text-slate-900">
                                $9.99{" "}
                                <span className="text-xs font-normal text-emerald-700/80">
                                    / month
                                </span>
                            </p>
                            <ul className="space-y-1.5">
                                <li>• 100 repurposes / month</li>
                                <li>• Full history &amp; one-click regenerate</li>
                                <li>• URL input (Medium, Notion, Google Docs)</li>
                                <li>• Custom tone presets &amp; emoji control</li>
                            </ul>
                            <Link href="/signup" className="relative mt-2 w-full inline-flex h-12 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-50 shadow-xl hover:scale-105 transition-transform duration-200">
                                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#059669_0%,#6ee7b7_50%,#059669_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-emerald-600 px-8 py-1 text-base font-semibold text-white backdrop-blur-3xl transition-colors hover:bg-emerald-700">
                                    Upgrade my LinkedIn <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </>
    )
}
