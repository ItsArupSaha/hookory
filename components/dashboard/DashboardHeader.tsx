"use client"

interface DashboardHeaderProps {
    cooldown: number
}

export function DashboardHeader({ cooldown }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">
                    New Repurpose
                </h1>
                <p className="mt-1 text-sm text-stone-500 font-medium">
                    Paste your content and choose a LinkedIn format.
                </p>
            </div>
            {cooldown > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-pulse" />
                    Cooldown: {cooldown}s
                </span>
            )}
        </div>
    )
}
