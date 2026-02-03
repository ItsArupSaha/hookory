import { useAppShell } from "@/components/layout/app-shell"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UsageLimitBannerProps {
    isLimitReached: boolean
    usageCount: number | null
    usageLimitMonthly: number | null
}

export function UsageLimitBanner({ isLimitReached, usageCount, usageLimitMonthly }: UsageLimitBannerProps) {
    const { me, handleUpgrade, handleBillingPortal, upgrading, portalLoading } = useAppShell()

    if (!isLimitReached) return null

    const isCreator = me?.plan === "creator"
    const isLoading = upgrading // Always use upgrading state now
    const handler = handleUpgrade // Always use checkout flow

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
                    onClick={() => handler()}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        "Upgrade Now"
                    )}
                </Button>
            </div>
        </div>
    )
}
