"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Check, X } from "lucide-react"
import Link from "next/link"
import { User } from "firebase/auth"

interface PricingSectionProps {
    user: User | null
}

export function PricingSection({ user }: PricingSectionProps) {
    return (
        <section id="pricing" className="py-20 md:py-28 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-stone-50 to-teal-50 border-y border-emerald-100/50">
            <div className="max-w-5xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-14 md:mb-20">
                    <h2 className="text-3xl md:text-4xl font-semibold text-stone-900">
                        Pricing for <span className="text-emerald-600">people who post with intent</span>
                    </h2>
                    <div className="mt-6 space-y-2">
                        <p className="text-lg text-stone-600">
                            Most tools charge for volume.
                        </p>
                        <p className="text-lg text-stone-600">
                            Hookory is priced for clarity, consistency, and confidence.
                        </p>
                    </div>
                    <p className="mt-4 text-sm text-stone-500">
                        Start free. Upgrade when LinkedIn stops being optional.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                    {/* FREE Plan */}
                    <Card className="relative flex flex-col border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center justify-between">
                                <span className="text-2xl font-semibold text-stone-900">Free</span>
                            </CardTitle>
                            <p className="text-sm text-stone-500 mt-1">Understand how Hookory thinks</p>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-1">
                            <div className="space-y-6">
                                <div>
                                    <span className="text-4xl font-bold text-stone-900">$0</span>
                                    <span className="text-stone-500 ml-1">/ month</span>
                                </div>

                                {/* What this plan is for */}
                                <p className="text-sm text-stone-600 leading-relaxed">
                                    The Free plan exists so you can experience Hookory&apos;s approach before committing.
                                    It&apos;s for testing the structure, seeing how hooks change outcomes, and deciding whether this fits the way you want to post on LinkedIn.
                                </p>

                                {/* What you can do */}
                                <div>
                                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">What you can do</p>
                                    <ul className="space-y-2.5">
                                        <li className="flex items-start gap-2 text-sm text-stone-700">
                                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                            <span>Turn short text into a LinkedIn-ready post</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-stone-700">
                                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                            <span>Explore multiple LinkedIn formats</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-stone-700">
                                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                            <span>See how angle and hook shape the output</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-stone-700">
                                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                            <span>Evaluate whether the results feel &quot;postable&quot;</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* What this plan is NOT for */}
                                <div>
                                    <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">Not designed for</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-sm text-stone-400">
                                            <X className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span>Consistent weekly posting</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-stone-400">
                                            <X className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span>Iteration and refinement</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-stone-400">
                                            <X className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span>Building a repeatable posting habit</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Muted line */}
                                <p className="text-xs text-stone-400 italic">
                                    Best for experimentation, not momentum.
                                </p>
                            </div>

                            {/* CTA */}
                            <div className="mt-auto pt-6">
                                <Button variant="outline" className="w-full border-stone-300 hover:bg-stone-50 text-stone-700 hover:text-stone-900" asChild>
                                    <Link href="/signup">Get started free</Link>
                                </Button>
                                <p className="text-xs text-stone-400 text-center mt-3">
                                    No credit card required
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* CREATOR Plan */}
                    <div className="relative rounded-xl p-[2px] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                        <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#059669_0%,#6ee7b7_50%,#059669_100%)]" />
                        <Card className="relative flex flex-col border-0 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50 shadow-lg rounded-xl">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center justify-between">
                                    <span className="text-2xl font-semibold text-stone-900">Creator</span>
                                    <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white">
                                        Recommended
                                    </span>
                                </CardTitle>
                                <p className="text-sm text-emerald-700 font-medium mt-1">For people who take LinkedIn seriously</p>
                            </CardHeader>
                            <CardContent className="flex flex-col flex-1 space-y-6">
                                <div>
                                    <span className="text-4xl font-bold text-stone-900">$9.99</span>
                                    <span className="text-stone-500 ml-1">/ month</span>
                                </div>

                                {/* Positioning paragraph */}
                                <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                                    <p className="text-sm text-stone-700 leading-relaxed">
                                        If you post regularly on LinkedIn, the hardest part isn&apos;t writing.
                                        It&apos;s deciding <em>how</em> to say something — the angle, the hook, the structure — and trusting that it will land.
                                    </p>
                                    <p className="text-sm text-emerald-700 font-medium mt-2">
                                        The Creator plan exists to remove that hesitation.
                                    </p>
                                </div>

                                {/* What this unlocks */}
                                <div>
                                    <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-3">What this unlocks</p>
                                    <ul className="space-y-2.5">
                                        <li className="flex items-start gap-2 text-sm text-stone-700">
                                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                            <span>Turn long content into focused LinkedIn posts</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-stone-700">
                                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                            <span>Choose strong angles instead of summarizing everything</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-stone-700">
                                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                            <span>Swap hooks without rewriting the post</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-stone-700">
                                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                            <span>Iterate quickly without second-guessing</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-stone-700">
                                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                            <span>Maintain a consistent voice across posts</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Who this is for */}
                                <div>
                                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">Built for</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2.5 py-1 bg-stone-100 rounded-full text-xs text-stone-600">Founders building authority</span>
                                        <span className="px-2.5 py-1 bg-stone-100 rounded-full text-xs text-stone-600">Freelancers attracting leads</span>
                                        <span className="px-2.5 py-1 bg-stone-100 rounded-full text-xs text-stone-600">Consultants & coaches</span>
                                        <span className="px-2.5 py-1 bg-stone-100 rounded-full text-xs text-stone-600">Weekly+ creators</span>
                                    </div>
                                </div>

                                {/* Muted line */}
                                <p className="text-xs text-emerald-600 italic">
                                    Designed for momentum, not one-off posts.
                                </p>

                                {/* CTA */}
                                <div className="mt-auto pt-4">
                                    <Link href="/signup" className="w-full inline-flex h-12 items-center justify-center rounded-full bg-emerald-600 px-8 text-base font-semibold text-white shadow-lg hover:bg-emerald-700 hover:scale-[1.02] transition-all duration-200">
                                        Upgrade my LinkedIn presence <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                    <p className="text-xs text-stone-400 text-center mt-3">
                                        Cancel anytime · No long-term commitment
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div >

                {/* Anchor line below pricing */}
                < div className="mt-14 text-center" >
                    <p className="text-stone-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                        You&apos;re not paying for AI access.<br />
                        <span className="text-stone-800 font-medium">You&apos;re paying to stop wondering whether your post will work.</span>
                    </p>
                </div >
            </div >
        </section >
    )
}
