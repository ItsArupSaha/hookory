"use client"

import Marquee from "react-fast-marquee"

export function InfiniteMarquee() {
    return (
        <section className="mt-12 mb-8 relative z-20">
            <div className="max-w-4xl mx-auto overflow-hidden rounded-full bg-white/80 backdrop-blur-md border border-stone-200 shadow-lg py-3">
                <Marquee gradient={false} speed={40} autoFill className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                    <div className="flex items-center gap-8 mx-4">
                        {[
                            "Viral Hooks",
                            "Instant Reach",
                            "Smart AI",
                            "No Fluff",
                            "Tone Control",
                            "Growth Engine",
                            "Format Magic",
                            "Scroll Stopping",
                            "LinkedIn First",
                            "10x Faster",
                            "Deep Insights",
                            "Story Arcs",
                            "Creator Ready",
                            "Auto-Emojify",
                            "Authority Builder"
                        ].map((text) => (
                            <div key={text} className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span className="text-sm font-medium text-stone-600 whitespace-nowrap">
                                    {text}
                                </span>
                            </div>
                        ))}
                    </div>
                </Marquee>
            </div>
        </section>
    )
}
