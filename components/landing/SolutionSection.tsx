"use client"

import { Compass, Zap, LayoutList } from "lucide-react"

export function SolutionSection() {
    return (
        <section className="pt-10 pb-10 md:pt-14 md:pb-14 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-stone-100 to-stone-50">
            <div className="max-w-6xl mx-auto">
                {/* Section intro */}
                <div className="text-center mb-14 md:mb-20">
                    <p className="text-lg md:text-xl text-stone-600 font-medium max-w-2xl mx-auto leading-relaxed">
                        Great LinkedIn posts don&apos;t happen by accident.
                    </p>
                    <p className="text-2xl md:text-3xl font-semibold text-stone-900 mt-4">
                        They follow a <span className="text-sky-600">structure</span>.
                    </p>
                </div>

                {/* Three solution blocks */}
                <div className="grid gap-6 md:gap-8 md:grid-cols-3">
                    {/* Card 1: Angle before words */}
                    <div className="group relative flex flex-col bg-gradient-to-br from-sky-50 to-white rounded-2xl p-6 md:p-8 shadow-lg border border-sky-100 hover:shadow-xl hover:border-sky-200 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-100/50 rounded-full blur-2xl -z-10 group-hover:bg-sky-200/50 transition-colors" />

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600">
                                <Compass className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-stone-900">
                                Angle comes before writing
                            </h3>
                        </div>

                        <ul className="space-y-3 text-stone-600 text-[15px] mb-6">
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 mt-2 shrink-0" />
                                <span>Strong posts start with a clear angle — not a paragraph</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 mt-2 shrink-0" />
                                <span>One idea. One direction. One reason to keep reading</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 mt-2 shrink-0" />
                                <span>Without an angle, even good writing feels scattered</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 mt-2 shrink-0" />
                                <span>Clarity at the start decides everything that follows</span>
                            </li>
                        </ul>

                        <div className="mt-auto pt-4 border-t border-sky-100">
                            <p className="text-sky-700 font-medium text-sm">
                                → The solution begins by choosing the angle first
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Hooks are not optional */}
                    <div className="group relative flex flex-col bg-gradient-to-br from-violet-50 to-white rounded-2xl p-6 md:p-8 shadow-lg border border-violet-100 hover:shadow-xl hover:border-violet-200 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-100/50 rounded-full blur-2xl -z-10 group-hover:bg-violet-200/50 transition-colors" />

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 rounded-xl bg-violet-100 text-violet-600">
                                <Zap className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-stone-900">
                                Hooks are the entry point
                            </h3>
                        </div>

                        <ul className="space-y-3 text-stone-600 text-[15px] mb-6">
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                                <span>LinkedIn readers decide in seconds whether to continue</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                                <span>The first two lines carry more weight than the rest</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                                <span>A weak hook hides even valuable insights</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                                <span>Strong hooks make the body matter</span>
                            </li>
                        </ul>

                        <div className="mt-auto pt-4 border-t border-violet-100">
                            <p className="text-violet-700 font-medium text-sm">
                                → The solution treats hooks as the core, not decoration
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Structure creates credibility */}
                    <div className="group relative flex flex-col bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 md:p-8 shadow-lg border border-indigo-100 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100/50 rounded-full blur-2xl -z-10 group-hover:bg-indigo-200/50 transition-colors" />

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600">
                                <LayoutList className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-stone-900">
                                Structure makes it feel human
                            </h3>
                        </div>

                        <ul className="space-y-3 text-stone-600 text-[15px] mb-6">
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                <span>LinkedIn posts are read fast, not carefully</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                <span>Long paragraphs lose attention immediately</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                <span>Generic AI text feels smooth but forgettable</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                <span>Structure is what makes ideas land clearly</span>
                            </li>
                        </ul>

                        <div className="mt-auto pt-4 border-t border-indigo-100">
                            <p className="text-indigo-700 font-medium text-sm">
                                → The solution enforces a LinkedIn-native structure
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
