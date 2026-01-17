"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function WhyDifferentSection() {
    return (
        <section className="mt-0 py-16 px-4 md:px-6 lg:px-8 space-y-8 bg-gradient-to-b from-white via-stone-50 to-stone-100">
            <div className="text-center max-w-3xl mx-auto">
                <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Purpose-built for LinkedIn
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                    Why this is different
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                    Hookory doesn&apos;t try to write everything. It specializes in turning long-form content
                    into posts that actually get read, saved, and replied to on LinkedIn.
                </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
                <Card className="border border-stone-200 bg-white shadow-sm transition-transform duration-150 hover:-translate-y-1 hover:shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-center gap-2 text-sm text-slate-900">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-600">
                                1
                            </span>
                            LinkedIn-first engine
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5 text-xs text-slate-600">
                        <p>
                            Prompts, formatting, and structure are all tuned for LinkedIn&apos;s fast-scrolling feed —
                            not blogs, emails, or generic &quot;social posts.&quot;
                        </p>
                        <p>
                            Hooks, line breaks, and punchy sentences are baked in so your posts don&apos;t read like
                            AI essays.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-stone-200 bg-white shadow-sm transition-transform duration-150 hover:-translate-y-1 hover:shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-center gap-2 text-sm text-slate-900">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-600">
                                2
                            </span>
                            Crafted, not copy-pasted
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5 text-xs text-slate-600">
                        <p>
                            Each format has its own structure (story, carousel, hook-first, thought leadership) so
                            you don&apos;t get one bland template repeated four times.
                        </p>
                        <p>
                            Posts are organized into clear sections with flow, tension, and payoff — ready to tweak,
                            not rewrite.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-stone-200 bg-white shadow-sm transition-transform duration-150 hover:-translate-y-1 hover:shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-center gap-2 text-sm text-slate-900">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-600">
                                3
                            </span>
                            Ready to post in minutes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5 text-xs text-slate-600">
                        <p>
                            You paste a link or blog, Hookory returns 4 LinkedIn-ready drafts — with hooks, body,
                            and CTA already in place.
                        </p>
                        <p>
                            Edit a few lines to add your voice, then paste into LinkedIn. No wrestling with empty
                            text boxes.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}

export function WhoItsForSection() {
    return (
        <section className="mt-12 py-12 px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-xl font-semibold text-slate-900">Who it&apos;s for</h2>
                <p className="mt-2 text-sm text-slate-600">
                    Hookory is for people who already create value — blogs, newsletters, case studies,
                    release notes — and want LinkedIn to finally reflect that work.
                </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3 max-w-5xl mx-auto">
                <div className="rounded-lg bg-white/60 backdrop-blur-sm p-4 shadow-sm border-t-4 border-emerald-300 ring-1 ring-stone-100">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 text-center">
                        1 · Creators &amp; educators
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900 text-center">
                        You publish long-form content already.
                    </p>
                    <p className="mt-1.5 text-xs text-slate-600 text-center">
                        Turn deep-dive blogs, newsletters, or YouTube scripts into daily posts that build trust,
                        not just impressions.
                    </p>
                </div>
                <div className="rounded-lg bg-white/60 backdrop-blur-sm p-4 shadow-sm border-t-4 border-amber-300 ring-1 ring-stone-100">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 text-center">
                        2 · Freelancers &amp; consultants
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900 text-center">
                        You want leads, not just likes.
                    </p>
                    <p className="mt-1.5 text-xs text-slate-600 text-center">
                        Repurpose client work, case studies, and how-to articles into consistent LinkedIn
                        content that brings in inbound DMs.
                    </p>
                </div>
                <div className="rounded-lg bg-white/60 backdrop-blur-sm p-4 shadow-sm border-t-4 border-sky-300 ring-1 ring-stone-100">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 text-center">
                        3 · Founders &amp; small teams
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900 text-center">
                        You&apos;re busy shipping product.
                    </p>
                    <p className="mt-1.5 text-xs text-slate-600 text-center">
                        Turn changelogs, docs, and internal memos into simple LinkedIn updates so your market
                        actually sees what you&apos;re building.
                    </p>
                </div>
            </div>
        </section>
    )
}
