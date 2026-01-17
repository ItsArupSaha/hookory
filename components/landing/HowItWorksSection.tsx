"use client"

import { useEffect, useRef, useState } from "react"

export function HowItWorksSection() {
    const [animationState, setAnimationState] = useState<'idle' | 'step1' | 'step2' | 'step3' | 'complete'>('idle')
    const [typingText, setTypingText] = useState('')
    const [processingProgress, setProcessingProgress] = useState(0)
    const stepsRef = useRef<HTMLDivElement>(null)
    const isVisibleRef = useRef(false)
    const animationTimeoutRef = useRef<NodeJS.Timeout[]>([])
    const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const processingIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Realistic simulation animation - loops continuously
    useEffect(() => {
        const runAnimation = () => {
            // Clear any existing intervals before starting new animation
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current)
                typingIntervalRef.current = null
            }
            if (processingIntervalRef.current) {
                clearInterval(processingIntervalRef.current)
                processingIntervalRef.current = null
            }

            // Reset state
            setAnimationState('step1')
            setTypingText('')
            setProcessingProgress(0)

            // Step 1: Show URL typing animation
            const urlToType = 'https://example.com/blog-post'
            let charIndex = 0

            typingIntervalRef.current = setInterval(() => {
                if (charIndex < urlToType.length) {
                    setTypingText(urlToType.slice(0, charIndex + 1))
                    charIndex++
                } else {
                    if (typingIntervalRef.current) {
                        clearInterval(typingIntervalRef.current)
                        typingIntervalRef.current = null
                    }
                    // Move to step 2 after typing completes
                    const timeout1 = setTimeout(() => {
                        setAnimationState('step2')
                        setTypingText('')

                        // Simulate AI processing with progress
                        let progress = 0
                        processingIntervalRef.current = setInterval(() => {
                            progress += 2
                            setProcessingProgress(progress)
                            if (progress >= 100) {
                                if (processingIntervalRef.current) {
                                    clearInterval(processingIntervalRef.current)
                                    processingIntervalRef.current = null
                                }
                                // Move to step 3
                                const timeout2 = setTimeout(() => {
                                    setAnimationState('step3')
                                    setProcessingProgress(0)
                                    // Step 3 completes quickly
                                    const timeout3 = setTimeout(() => {
                                        setAnimationState('complete')
                                        // Wait 5 seconds then restart if still visible
                                        const timeout4 = setTimeout(() => {
                                            if (isVisibleRef.current) {
                                                runAnimation()
                                            }
                                        }, 5000)
                                        animationTimeoutRef.current.push(timeout4)
                                    }, 800)
                                    animationTimeoutRef.current.push(timeout3)
                                }, 300)
                                animationTimeoutRef.current.push(timeout2)
                            }
                        }, 50)
                    }, 500)
                    animationTimeoutRef.current.push(timeout1)
                }
            }, 80)
        }

        let hasStarted = false

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        isVisibleRef.current = true
                        if (!hasStarted) {
                            hasStarted = true
                            runAnimation()
                        }
                    } else {
                        isVisibleRef.current = false
                        // Reset when leaving viewport so it can restart when coming back
                        hasStarted = false
                        // Clear intervals when leaving viewport
                        if (typingIntervalRef.current) {
                            clearInterval(typingIntervalRef.current)
                            typingIntervalRef.current = null
                        }
                        if (processingIntervalRef.current) {
                            clearInterval(processingIntervalRef.current)
                            processingIntervalRef.current = null
                        }
                    }
                })
            },
            { threshold: 0.2 }
        )

        const currentElement = stepsRef.current
        if (currentElement) {
            observer.observe(currentElement)
        }

        return () => {
            // Cleanup: clear all intervals and timeouts
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current)
                typingIntervalRef.current = null
            }
            if (processingIntervalRef.current) {
                clearInterval(processingIntervalRef.current)
                processingIntervalRef.current = null
            }
            animationTimeoutRef.current.forEach(timeout => clearTimeout(timeout))
            animationTimeoutRef.current = []
            // Keep observer active during component lifetime - only disconnect on unmount
            // This allows animation to restart when scrolling back into view
            observer.disconnect()
        }
    }, [])

    return (
        <section className="py-20 px-4 md:px-6 lg:px-8 bg-white" ref={stepsRef}>
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900">How Hookory Works</h2>
                    <p className="text-slate-600 mt-2">From long-form to LinkedIn-ready in 30 seconds</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop only) - Progressive drawing */}
                    <div className="hidden md:block absolute top-12 left-[20%] h-0.5 -z-10 overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-200 transition-all duration-1000 ease-out ${animationState === 'step2' || animationState === 'step3' || animationState === 'complete'
                                ? 'w-[60%]'
                                : 'w-0'
                                }`}
                        />
                    </div>

                    {/* Step 1 - URL Input Simulation */}
                    <div
                        className={`relative flex flex-col items-center text-center bg-white p-6 rounded-2xl border transition-all duration-500 ${animationState !== 'idle'
                            ? 'opacity-100 translate-y-0 scale-100 border-emerald-200 shadow-lg shadow-emerald-50'
                            : 'opacity-0 translate-y-8 scale-95 border-stone-100 shadow-sm'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 font-bold text-xl border-4 border-white shadow-sm transition-all duration-500 ${animationState !== 'idle'
                            ? 'bg-emerald-100 text-emerald-600 scale-100 ring-4 ring-emerald-50'
                            : 'bg-stone-100 text-stone-400 scale-0'
                            }`}>
                            1
                        </div>
                        <h3 className="font-semibold text-lg mb-2 text-slate-900">Paste URL</h3>
                        {/* URL Input Simulation */}
                        <div className="w-full mt-3 mb-2 px-3 py-2 bg-stone-50 rounded-md border border-stone-200 text-left min-h-[2.5rem]">
                            {animationState === 'step1' && (
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-stone-600 font-mono">{typingText}</span>
                                    <span className="animate-pulse text-emerald-500">|</span>
                                </div>
                            )}
                            {animationState === 'step2' || animationState === 'step3' || animationState === 'complete' ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs text-stone-500">URL processed</span>
                                </div>
                            ) : animationState === 'idle' ? (
                                <span className="text-xs text-stone-400">Waiting...</span>
                            ) : null}
                        </div>
                        <p className="text-sm text-stone-500">Drop in a link to your blog, newsletter, or YouTube video transcript.</p>
                    </div>

                    {/* Step 2 - AI Processing Simulation */}
                    <div
                        className={`relative flex flex-col items-center text-center bg-white p-6 rounded-2xl border transition-all duration-500 ${animationState === 'step2' || animationState === 'step3' || animationState === 'complete'
                            ? 'opacity-100 translate-y-0 scale-100 border-teal-200 shadow-lg shadow-teal-50'
                            : 'opacity-0 translate-y-8 scale-95 border-stone-100 shadow-sm'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 font-bold text-xl border-4 border-white shadow-sm transition-all duration-500 relative ${animationState === 'step2' || animationState === 'step3' || animationState === 'complete'
                            ? 'bg-teal-100 text-teal-600 scale-100 ring-4 ring-teal-50'
                            : 'bg-stone-100 text-stone-400 scale-0'
                            }`}>
                            2
                            {/* Pulsing ring during processing */}
                            {animationState === 'step2' && (
                                <span className="absolute inset-0 rounded-full bg-teal-200 animate-ping opacity-75" />
                            )}
                        </div>
                        <h3 className="font-semibold text-lg mb-2 text-slate-900">AI Analyzes</h3>
                        {/* Processing Animation */}
                        {animationState === 'step2' && (
                            <div className="w-full mt-3 mb-2 space-y-2">
                                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-100 ease-linear"
                                        style={{ width: `${processingProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-teal-600 font-medium animate-pulse">
                                    Analyzing content... {processingProgress}%
                                </p>
                            </div>
                        )}
                        {animationState === 'step3' || animationState === 'complete' ? (
                            <div className="w-full mt-3 mb-2">
                                <div className="flex items-center justify-center gap-2 text-emerald-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-xs font-medium">Analysis complete</span>
                                </div>
                            </div>
                        ) : null}
                        <p className="text-sm text-stone-500">AI extracts the &quot;Golden Nuggets&quot; and removes the fluff.</p>
                    </div>

                    {/* Step 3 - Results Generation */}
                    <div
                        className={`relative flex flex-col items-center text-center bg-white p-6 rounded-2xl border transition-all duration-500 ${animationState === 'step3' || animationState === 'complete'
                            ? 'opacity-100 translate-y-0 scale-100 border-sky-200 shadow-lg shadow-sky-50'
                            : 'opacity-0 translate-y-8 scale-95 border-stone-100 shadow-sm'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 font-bold text-xl border-4 border-white shadow-sm transition-all duration-500 ${animationState === 'step3' || animationState === 'complete'
                            ? 'bg-sky-100 text-sky-600 scale-100 ring-4 ring-sky-50'
                            : 'bg-stone-100 text-stone-400 scale-0'
                            }`}>
                            3
                        </div>
                        <h3 className="font-semibold text-lg mb-2 text-slate-900">You Publish</h3>
                        {/* Results Preview */}
                        {animationState === 'step3' && (
                            <div className="w-full mt-3 mb-2 space-y-1.5 animate-pulse">
                                <div className="h-2 bg-sky-100 rounded w-full" />
                                <div className="h-2 bg-sky-100 rounded w-5/6 mx-auto" />
                                <div className="h-2 bg-sky-100 rounded w-4/6 mx-auto" />
                            </div>
                        )}
                        {animationState === 'complete' && (
                            <div className="w-full mt-3 mb-2 space-y-1.5">
                                <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-xs font-medium">4 formats ready</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-[10px] text-stone-600">
                                    <div className="px-2 py-1 bg-sky-50 rounded">Carousel</div>
                                    <div className="px-2 py-1 bg-sky-50 rounded">Story</div>
                                    <div className="px-2 py-1 bg-sky-50 rounded">Hook</div>
                                    <div className="px-2 py-1 bg-sky-50 rounded">Thought Leader</div>
                                </div>
                            </div>
                        )}
                        <p className="text-sm text-stone-500">Get 4 viral-ready formats (Carousel, Story, Hook, Thought Leader).</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
