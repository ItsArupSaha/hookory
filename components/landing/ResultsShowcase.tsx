"use client"

import { useState } from "react"
import { ArrowRight, Layers, LayoutList, Zap, Quote, Image as ImageIcon, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { BLOG_TEXT, GENERATED_POSTS, SERIES_POSTS } from "@/lib/data/landing-examples"
import { LinkedInPostPreview } from "@/components/features/linkedin-post-preview"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "firebase/auth"

// Mock user
const DEMO_USER = {
    uid: "demo-user",
    email: "demo@hookory.com",
    displayName: "Your Name",
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: "",
    tenantId: null,
    delete: async () => { },
    getIdToken: async () => "",
    getIdTokenResult: async () => ({} as any),
    reload: async () => { },
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null,
} as unknown as User

const POST_VARIANTS = [
    {
        id: "main-post",
        label: "Main Post",
        icon: LayoutList,
        content: GENERATED_POSTS["main-post"].content,
        colorStyles: {
            text: "text-emerald-700",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            active: "bg-emerald-600 text-white shadow-emerald-200"
        }
    },
    {
        id: "story-based",
        label: "Story",
        icon: Zap,
        content: GENERATED_POSTS["story-based"].content,
        colorStyles: {
            text: "text-amber-700",
            bg: "bg-amber-50",
            border: "border-amber-200",
            active: "bg-amber-500 text-white shadow-amber-200"
        }
    },
    {
        id: "carousel",
        label: "Carousel",
        icon: ImageIcon,
        content: GENERATED_POSTS["carousel"].content,
        colorStyles: {
            text: "text-sky-700",
            bg: "bg-sky-50",
            border: "border-sky-200",
            active: "bg-sky-500 text-white shadow-sky-200"
        }
    },
    {
        id: "short-viral-hook",
        label: "Hook",
        icon: Quote,
        content: GENERATED_POSTS["short-viral-hook"].content,
        colorStyles: {
            text: "text-rose-700",
            bg: "bg-rose-50",
            border: "border-rose-200",
            active: "bg-rose-500 text-white shadow-rose-200"
        }
    }
]

export function ResultsShowcase() {
    const [mode, setMode] = useState<'single' | 'series'>('single')
    const [activeVariantIndex, setActiveVariantIndex] = useState(0)

    const activeVariant = POST_VARIANTS[activeVariantIndex]

    return (
        <section className="py-20 md:py-24 px-4 md:px-6 lg:px-8 bg-stone-50 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                {/* Section header */}
                <div className="text-center mb-12">
                    <p className="text-emerald-600 font-semibold tracking-wide uppercase text-xs md:text-sm mb-3">
                        See the Magic
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-4">
                        One Input. <span className="text-emerald-600">Infinite Angles.</span>
                    </h2>
                    <p className="text-base md:text-lg text-stone-600 max-w-2xl mx-auto">
                        Paste your rough notes once. Get a week's worth of polished content instantly.
                    </p>
                </div>

                {/* Main Two-Column Layout */}
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

                    {/* LEFT COLUMN: The Input */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-1 h-9">
                            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wide">
                                1. Text Input
                            </h3>
                        </div>

                        <div className="relative group">
                            <Card className="border-stone-200 bg-white shadow-sm h-[380px] flex flex-col transition-all duration-300 hover:shadow-md hover:border-emerald-100">
                                <CardHeader className="py-4 px-5 border-b border-stone-100 bg-stone-50/50">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                                        </div>
                                        <div className="ml-3 h-5 w-40 bg-stone-200/50 rounded-md" />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 flex-grow overflow-hidden relative">
                                    <div className="absolute inset-0 p-5 overflow-y-auto custom-scrollbar">
                                        <div className="prose prose-sm prose-stone max-w-none">
                                            <p className="whitespace-pre-wrap text-stone-600 text-[13px] leading-relaxed font-mono">
                                                {BLOG_TEXT}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Fade at bottom */}
                                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                                </CardContent>
                            </Card>

                            {/* Connector Arrow (Desktop Only) */}
                            <div className="hidden lg:flex absolute -right-10 top-1/2 -translate-y-1/2 z-10 text-stone-400">
                                <ArrowRight className="w-8 h-8" />
                            </div>
                        </div>
                    </div>


                    {/* RIGHT COLUMN: The Output */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-1 h-9">
                            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wide">
                                2. The Result
                            </h3>
                            {/* Series/Single Toggle */}
                            <div className="flex p-0.5 bg-stone-200 rounded-lg">
                                <button
                                    onClick={() => setMode('single')}
                                    className={cn(
                                        "px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all",
                                        mode === 'single' ? "bg-white text-emerald-700 shadow-sm" : "text-stone-500 hover:text-stone-700"
                                    )}
                                >
                                    Single Post
                                </button>
                                <button
                                    onClick={() => setMode('series')}
                                    className={cn(
                                        "px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all",
                                        mode === 'series' ? "bg-white text-violet-700 shadow-sm" : "text-stone-500 hover:text-stone-700"
                                    )}
                                >
                                    Series (4x)
                                </button>
                            </div>
                        </div>

                        <Card className={cn(
                            "border-stone-200 bg-white shadow-lg h-[380px] flex flex-col transition-all duration-300 relative overflow-hidden",
                            mode === 'single' ? "shadow-emerald-100/50" : "shadow-violet-100/50"
                        )}>
                            {/* Mode: SINGLE POST VIEW */}
                            {mode === 'single' && (
                                <>
                                    {/* Tabs */}
                                    <div className="flex items-center gap-2 p-3 border-b border-stone-100 bg-stone-50/30 overflow-x-auto no-scrollbar">
                                        {POST_VARIANTS.map((variant, idx) => {
                                            const isActive = idx === activeVariantIndex
                                            return (
                                                <button
                                                    key={variant.id}
                                                    onClick={() => setActiveVariantIndex(idx)}
                                                    className={cn(
                                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border",
                                                        isActive
                                                            ? `${variant.colorStyles.active} border-transparent shadow-md`
                                                            : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"
                                                    )}
                                                >
                                                    <variant.icon className="w-3 h-3" />
                                                    {variant.label}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* Preview Area */}
                                    <CardContent className="flex-grow p-0 bg-stone-50/30 overflow-hidden relative flex flex-col">
                                        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 flex justify-center items-start">
                                            {/* We wrap the preview to apply a slight scale if needed for small screens, usually fitting is handled by width */}
                                            <div className="w-full max-w-[480px]">
                                                <LinkedInPostPreview
                                                    content={activeVariant.content}
                                                    user={DEMO_USER}
                                                    onEdit={() => { }}
                                                    onCopy={() => { }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </>
                            )}

                            {/* Mode: SERIES VIEW */}
                            {mode === 'series' && (
                                <div className="flex-grow flex flex-col h-full bg-stone-50/30">
                                    <div className="p-4 border-b border-violet-100 bg-violet-50/30 text-center flex-shrink-0">
                                        <div className="flex items-center justify-center gap-2 mb-0.5">
                                            <Layers className="w-4 h-4 text-violet-600" />
                                            <h4 className="text-violet-900 font-bold text-sm">4-Day Content Arc</h4>
                                        </div>
                                        <p className="text-violet-600 text-xs">Automated narrative structure</p>
                                    </div>

                                    <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-8">
                                        {SERIES_POSTS.map((post, i) => (
                                            <div key={i} className="relative">
                                                {/* Connecting Line */}
                                                {i !== SERIES_POSTS.length - 1 && (
                                                    <div className="absolute left-[1.65rem] top-12 bottom-[-2rem] w-0.5 bg-gradient-to-b from-violet-200 to-transparent z-0" />
                                                )}

                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-3 mb-3 pl-1">
                                                        <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white">
                                                            {i + 1}
                                                        </div>
                                                        <span className="text-xs font-bold text-violet-700 uppercase tracking-wide bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                                                            {post.day} • {post.title}
                                                        </span>
                                                    </div>

                                                    <div className="pl-9">
                                                        <div className="shadow-sm hover:shadow-md transition-shadow duration-300">
                                                            <LinkedInPostPreview
                                                                content={post.content}
                                                                user={DEMO_USER}
                                                                onEdit={() => { }}
                                                                onCopy={() => { }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Endcap */}
                                        <div className="flex justify-center pt-2">
                                            <div className="flex items-center gap-2 text-violet-400 bg-violet-50/50 px-3 py-1.5 rounded-full text-[10px] font-medium border border-violet-100/50">
                                                <Check className="w-3 h-3" />
                                                Series Complete
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </Card>
                    </div>

                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-track:hover {
                    background: #f5f5f4;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #d6d3d1;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #a8a29e;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    )
}
