"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface UsageLimitBannerProps {
    isLimitReached: boolean
    usageCount: number | null
    usageLimitMonthly: number | null
}

export function UsageLimitBanner({ isLimitReached, usageCount, usageLimitMonthly }: UsageLimitBannerProps) {
    const router = useRouter()

    if (!isLimitReached) return null

    return (
        <div className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <p className="flex items-center gap-2 text-sm font-bold text-stone-800">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        Monthly limit reached
                    </p>
                    <p className="text-xs text-stone-500">
                        You&apos;ve used {usageCount} of {usageLimitMonthly} generations this month. Upgrade to increase your limit.
                    </p>
                </div>
                <Button
                    size="sm"
                    className="rounded-full bg-stone-900 px-6 text-xs text-white hover:bg-stone-800 shadow-lg"
                    onClick={() => router.push("/usage")}
                >
                    Upgrade Now
                </Button>
            </div>
        </div>
    )
}
