"use client"

export function WhoItsForSection() {
    return (
        <section className="pt-10 pb-20 md:pt-14 md:pb-28 px-4 md:px-6 lg:px-8 bg-white">
            <div className="max-w-6xl mx-auto">
                {/* Section intro */}
                <div className="text-center mb-14 md:mb-20">
                    <h2 className="text-2xl md:text-3xl font-semibold text-stone-900">
                        Not for everyone. <span className="text-emerald-600">On purpose.</span>
                    </h2>
                    <p className="mt-5 text-base md:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
                        This is for people who already create real value — blogs, case studies, insights — and need LinkedIn to finally reflect that work without starting from scratch every time.
                    </p>
                </div>

                {/* Three cards */}
                <div className="grid gap-6 md:gap-8 md:grid-cols-3">
                    {/* Card 1: Creators & Educators */}
                    <div className="group relative flex flex-col bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 md:p-8 shadow-lg border border-emerald-100 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/50 rounded-full blur-2xl -z-10 group-hover:bg-emerald-200/50 transition-colors" />

                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-3">
                            Creators & Educators
                        </p>

                        <h3 className="text-lg font-semibold text-stone-900 mb-4">
                            You already publish. LinkedIn should reflect that.
                        </h3>

                        <p className="text-stone-600 text-[15px] leading-relaxed mb-6">
                            Your blogs, newsletters, and videos are doing the hard work of building ideas. The missing piece is translating that depth into something LinkedIn readers actually stop for. You want trust and authority — not noise.
                        </p>

                        <div className="mt-auto pt-4 border-t border-emerald-100">
                            <p className="text-emerald-700 font-medium text-sm">
                                → Turn depth into daily presence
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Freelancers & Consultants */}
                    <div className="group relative flex flex-col bg-gradient-to-br from-amber-50 to-white rounded-2xl p-6 md:p-8 shadow-lg border border-amber-100 hover:shadow-xl hover:border-amber-200 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-full blur-2xl -z-10 group-hover:bg-amber-200/50 transition-colors" />

                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-3">
                            Freelancers & Consultants
                        </p>

                        <h3 className="text-lg font-semibold text-stone-900 mb-4">
                            LinkedIn is your lead channel. Treat it like one.
                        </h3>

                        <p className="text-stone-600 text-[15px] leading-relaxed mb-6">
                            You have client work, frameworks, and insights worth sharing — but sporadic posting doesn&apos;t drive pipeline. Consistency builds inbound. The goal isn&apos;t viral moments; it&apos;s conversations that start in the DMs.
                        </p>

                        <div className="mt-auto pt-4 border-t border-amber-100">
                            <p className="text-amber-700 font-medium text-sm">
                                → Consistency over virality
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Founders & Small Teams */}
                    <div className="group relative flex flex-col bg-gradient-to-br from-sky-50 to-white rounded-2xl p-6 md:p-8 shadow-lg border border-sky-100 hover:shadow-xl hover:border-sky-200 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-100/50 rounded-full blur-2xl -z-10 group-hover:bg-sky-200/50 transition-colors" />

                        <p className="text-xs font-semibold uppercase tracking-wide text-sky-600 mb-3">
                            Founders & Small Teams
                        </p>

                        <h3 className="text-lg font-semibold text-stone-900 mb-4">
                            You&apos;re building. Let the market see that.
                        </h3>

                        <p className="text-stone-600 text-[15px] leading-relaxed mb-6">
                            Your progress already exists — in docs, changelogs, and internal notes. The problem is nobody outside sees it. LinkedIn is where visibility compounds. You don&apos;t need more content; you need what you&apos;re already doing to show up.
                        </p>

                        <div className="mt-auto pt-4 border-t border-sky-100">
                            <p className="text-sky-700 font-medium text-sm">
                                → Make progress visible
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
