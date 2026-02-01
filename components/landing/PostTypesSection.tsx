"use client"

import { Zap, Layers, ArrowRight, BarChart3, Repeat } from "lucide-react"

export function PostTypesSection() {
    return (
        <section className="py-20 md:py-32 px-4 md:px-6 lg:px-8 bg-stone-50">
            <div className="max-w-6xl mx-auto">
                {/* Section intro */}
                <div className="text-center mb-16 md:mb-24">
                    <h2 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight">
                        Two Ways to <span className="text-emerald-600">Dominate</span> the Feed
                    </h2>
                    <p className="mt-6 text-lg md:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
                        Most creators fail because they only have one gear. Hookory gives you two: speed for daily consistency, and depth for building authority.
                    </p>
                </div>

                <div className="grid gap-8 lg:gap-12 lg:grid-cols-2">
                    {/* Single Post Card */}
                    <div className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        {/* Gradient Header */}
                        <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />

                        <div className="p-8 md:p-10 flex flex-col flex-grow">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600">
                                    <Zap className="h-7 w-7" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-stone-900">
                                        The Single Post
                                    </h3>
                                    <p className="text-emerald-600 font-medium text-sm mt-0.5">
                                        Your Daily Growth Engine
                                    </p>
                                </div>
                            </div>

                            <p className="text-lg text-stone-600 leading-relaxed mb-8">
                                Consistency is the only "hack" that works. Use Single Posts to stay top-of-mind every single day without burning out.
                            </p>

                            <div className="space-y-6 flex-grow">
                                <div className="flex gap-4">
                                    <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-emerald-600">
                                        <Repeat className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-stone-900">Never miss a day</h4>
                                        <p className="text-stone-500 text-sm mt-1">
                                            Turn a random thought or quick link into a polished post in seconds. No more "I don't know what to post."
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-emerald-600">
                                        <BarChart3 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-stone-900">Maximize Reach</h4>
                                        <p className="text-stone-500 text-sm mt-1">
                                            Short, punchy, and algorithm-friendly. Designed to stop the scroll and trigger immediate engagement.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-stone-100">
                                <span className="inline-flex items-center text-emerald-700 font-semibold group-hover:gap-2 transition-all">
                                    Create a Single Post <ArrowRight className="ml-1 w-4 h-4" />
                                </span>
                            </div>
                        </div>

                        {/* Decorational background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 opacity-50 translate-x-1/3 -translate-y-1/3" />
                    </div>

                    {/* Series Post Card */}
                    <div className="group relative flex flex-col bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        {/* Gradient Header */}
                        <div className="h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500" />

                        <div className="p-8 md:p-10 flex flex-col flex-grow relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-2xl bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40">
                                    <Layers className="h-7 w-7" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">
                                        The Series Post
                                    </h3>
                                    <p className="text-violet-300 font-medium text-sm mt-0.5">
                                        Your Authority Builder
                                    </p>
                                </div>
                            </div>

                            <p className="text-lg text-stone-300 leading-relaxed mb-8">
                                Experts don't just post; they teach. Turn one deep topic into a 4-day narrative arc that builds true followers, not just likes.
                            </p>

                            <div className="space-y-6 flex-grow">
                                <div className="flex gap-4">
                                    <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-violet-300">
                                        <span className="font-mono font-bold text-xs">4x</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">The "Netflix Effect"</h4>
                                        <p className="text-stone-400 text-sm mt-1">
                                            We take one URL and generate 4 connected posts. Open loops, cliffhangers, and payoffs that keep people coming back.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-violet-300">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">Prove Competence</h4>
                                        <p className="text-stone-400 text-sm mt-1">
                                            Single posts show you're active. A well-structured series proves you actually know what you're talking about.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-white/10">
                                <span className="inline-flex items-center text-violet-300 font-semibold group-hover:gap-2 transition-all">
                                    Start a Series <ArrowRight className="ml-1 w-4 h-4" />
                                </span>
                            </div>
                        </div>

                        {/* Decorational background element */}
                        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-violet-900/20 to-transparent pointer-events-none" />
                        <div className="absolute top-10 right-10 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -z-10" />
                    </div>
                </div>
            </div>
        </section>
    )
}
