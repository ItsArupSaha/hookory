"use client"

import { Eye, Brain, Sparkles } from "lucide-react"

export function ProblemSection() {
    return (
        <section className="py-20 md:py-28 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-stone-50 to-stone-100">
            <div className="max-w-6xl mx-auto">
                {/* Section intro */}
                <div className="text-center mb-14 md:mb-20">
                    <p className="text-lg md:text-xl text-stone-600 font-medium max-w-2xl mx-auto leading-relaxed">
                        You already have ideas. You already write blogs, notes, or thoughts.
                    </p>
                    <p className="text-2xl md:text-3xl font-semibold text-stone-900 mt-4">
                        But LinkedIn is <span className="text-emerald-600">unforgiving</span>.
                    </p>
                </div>

                {/* Three problem blocks */}
                <div className="grid gap-6 md:gap-8 md:grid-cols-3">
                    {/* Block 1: Attention */}
                    <div className="group relative bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 md:p-8 shadow-lg border border-emerald-100 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/50 rounded-full blur-2xl -z-10 group-hover:bg-emerald-200/50 transition-colors" />

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
                                <Eye className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-stone-900">
                                Attention is earned in two lines
                            </h3>
                        </div>

                        <ul className="space-y-3 text-stone-600 text-[15px] mb-6">
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                                <span>Most posts are never read — not because they lack value</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                                <span>The first two lines carry the entire weight</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                                <span>If the hook doesn&apos;t land, nothing else matters</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                                <span>Good ideas fail before they get a chance</span>
                            </li>
                        </ul>

                        <div className="pt-4 border-t border-emerald-100">
                            <p className="text-emerald-700 font-medium text-sm">
                                → The solution starts with earning attention
                            </p>
                        </div>
                    </div>

                    {/* Block 2: Cognitive Load */}
                    <div className="group relative bg-gradient-to-br from-amber-50 to-white rounded-2xl p-6 md:p-8 shadow-lg border border-amber-100 hover:shadow-xl hover:border-amber-200 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-full blur-2xl -z-10 group-hover:bg-amber-200/50 transition-colors" />

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                                <Brain className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-stone-900">
                                Thinking is the real bottleneck
                            </h3>
                        </div>

                        <ul className="space-y-3 text-stone-600 text-[15px] mb-6">
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                                <span>Turning long content into short posts is exhausting</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                                <span>You second-guess tone, structure, and phrasing</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                                <span>Mental overhead leads to inconsistency</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                                <span>Friction kills posting frequency</span>
                            </li>
                        </ul>

                        <div className="pt-4 border-t border-amber-100">
                            <p className="text-amber-700 font-medium text-sm">
                                → The solution removes thinking friction
                            </p>
                        </div>
                    </div>

                    {/* Block 3: Generic AI Output */}
                    <div className="group relative bg-gradient-to-br from-rose-50 to-white rounded-2xl p-6 md:p-8 shadow-lg border border-rose-100 hover:shadow-xl hover:border-rose-200 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-100/50 rounded-full blur-2xl -z-10 group-hover:bg-rose-200/50 transition-colors" />

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-stone-900">
                                Correct is not credible
                            </h3>
                        </div>

                        <ul className="space-y-3 text-stone-600 text-[15px] mb-6">
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                                <span>Generic AI posts sound like everyone else</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                                <span>Too smooth, too predictable, no edge</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                                <span>Readers can feel when it&apos;s churned out</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                                <span>It doesn&apos;t feel like you — and people notice</span>
                            </li>
                        </ul>

                        <div className="pt-4 border-t border-rose-100">
                            <p className="text-rose-700 font-medium text-sm">
                                → The solution is opinionated and platform-aware
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
