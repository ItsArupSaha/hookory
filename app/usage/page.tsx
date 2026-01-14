"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { auth } from "@/lib/firebase/client"
import { formatDate, getLocalStoragePaymentStatus, setLocalStoragePaymentStatus } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

interface MeResponse {
    plan: "free" | "creator"
    emailVerified: boolean
    usageCount: number
    usageLimitMonthly: number
    usageResetAt: string
    stripeStatus: string | null
}

export default function UsagePage() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [me, setMe] = useState<MeResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [upgrading, setUpgrading] = useState(false)
    const [portalLoading, setPortalLoading] = useState(false)
    const toastShownRef = useRef<string | null>(null)

    const loadMe = useCallback(async () => {
        if (!auth) return null
        const user = auth.currentUser
        if (!user) return null
        try {
            // Check localStorage first for immediate payment status (within 20 seconds)
            const localStoragePlan = getLocalStoragePaymentStatus()

            const token = await user.getIdToken()
            const res = await fetch("/api/me", {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || "Failed to load usage")
            }

            // If localStorage has creator status and it's within 20 seconds, override the plan
            if (localStoragePlan === "creator") {
                data.plan = "creator"
                data.usageLimitMonthly = 100
                console.log("[Usage Page] Using localStorage payment status (within 1 minute window)")
            }

            console.log("[Usage Page] Received data from /api/me:", {
                plan: data.plan,
                usageLimitMonthly: data.usageLimitMonthly,
                stripeStatus: data.stripeStatus,
                subscriptionPeriodEnd: data.subscriptionPeriodEnd,
            })
            // Ensure plan and usageLimitMonthly are consistent
            if (data.plan === "free" && data.usageLimitMonthly !== 5) {
                console.warn("[Usage Page] Mismatch: plan is free but usageLimitMonthly is", data.usageLimitMonthly)
                data.usageLimitMonthly = 5
            }
            if (data.plan === "creator" && data.usageLimitMonthly !== 100) {
                console.warn("[Usage Page] Mismatch: plan is creator but usageLimitMonthly is", data.usageLimitMonthly)
                data.usageLimitMonthly = 100
            }
            setMe(data as MeResponse)
            return data as MeResponse
        } catch (err: any) {
            console.error(err)
            toast({
                title: "Error",
                description: err?.message || "Failed to load usage.",
                variant: "destructive",
            })
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    // Refresh on mount and when pathname changes (navigation)
    useEffect(() => {
        loadMe()
    }, [pathname, loadMe])

    // Refresh data when page becomes visible or window gains focus
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                loadMe()
            }
        }

        const handleFocus = () => {
            loadMe()
        }

        // Refresh when page becomes visible or window gains focus
        document.addEventListener("visibilitychange", handleVisibilityChange)
        window.addEventListener("focus", handleFocus)

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange)
            window.removeEventListener("focus", handleFocus)
        }
    }, [loadMe])

    // Handle successful Stripe checkout redirect - store in localStorage immediately
    useEffect(() => {
        const sessionId = searchParams.get("session_id")
        if (!sessionId || !auth) return // Only proceed if session_id exists

        // Prevent showing toast multiple times for the same session
        if (toastShownRef.current === sessionId) return

        const user = auth.currentUser
        if (!user) return

        console.log("[Usage Page] Payment successful detected, storing in localStorage:", sessionId)

        // Mark this session as processed
        toastShownRef.current = sessionId

        // Immediately store payment status in localStorage
        setLocalStoragePaymentStatus("creator")

        // Update UI immediately
        if (me) {
            setMe({
                ...me,
                plan: "creator",
                usageLimitMonthly: 100,
            })
        } else {
            // If me is not loaded yet, trigger a load
            loadMe()
        }

        // Remove session_id from URL immediately
        const url = new URL(window.location.href)
        url.searchParams.delete("session_id")
        window.history.replaceState({}, "", url.toString())

        // Show success toast (only once per session)
        toast({
            title: "Upgrade successful! 🎉",
            description: "Your Creator plan is now active. You have 100 repurposes per month.",
        })
    }, [searchParams, me, loadMe])

    const usagePercent = me
        ? Math.min(100, (me.usageCount / Math.max(1, me.usageLimitMonthly)) * 100)
        : 0

    async function handleUpgrade() {
        if (!auth) return
        const user = auth.currentUser
        if (!user || upgrading) return
        setUpgrading(true)
        try {
            const token = await user.getIdToken()
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || "Failed to start checkout")
            }
            if (data.url) {
                // Small delay for smooth transition before redirect
                await new Promise((resolve) => setTimeout(resolve, 300))
                window.location.href = data.url
            }
        } catch (err: any) {
            setUpgrading(false)
            toast({
                title: "Upgrade failed",
                description: err?.message || "Please try again later.",
                variant: "destructive",
            })
        }
    }

    async function handlePortal() {
        if (!auth) return
        const user = auth.currentUser
        if (!user || portalLoading) return
        setPortalLoading(true)
        try {
            const token = await user.getIdToken()
            const res = await fetch("/api/stripe/portal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || "Failed to open billing portal")
            }
            if (data.url) {
                // Small delay for smooth transition before redirect
                await new Promise((resolve) => setTimeout(resolve, 300))
                window.location.href = data.url
            }
        } catch (err: any) {
            setPortalLoading(false)
            toast({
                title: "Billing portal error",
                description: err?.message || "Please try again later.",
                variant: "destructive",
            })
        }
    }

    if (loading || !me) {
        return (
            <div className="text-xs text-slate-400">
                Loading usage…
            </div>
        )
    }

    return (
        <div className="space-y-4 text-slate-900">
            <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Usage & plan
                </h1>
                <p className="text-xs text-slate-500">
                    Track how many repurposes you&apos;ve used this month and manage your plan.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <Card className="border-slate-200 bg-white">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-slate-900">
                            Monthly usage
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs text-slate-700">
                        <div className="flex items-center justify-between text-sm">
                            <span>
                                {me.usageCount}/{me.usageLimitMonthly} repurposes
                            </span>
                            <span className="text-[11px] text-slate-500">
                                Resets {formatDate(me.usageResetAt)}
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-orange-500"
                                style={{ width: `${usagePercent}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-slate-500">
                            One &quot;Generate&quot; click counts as a repurpose, even if you
                            choose multiple formats. Regenerates on Creator also count.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-slate-900">
                            Plan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs text-slate-700">
                        <p>
                            Current plan:{" "}
                            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-orange-700 border border-orange-200">
                                {me.plan === "creator" ? "Creator" : "Free"}
                            </span>
                        </p>
                        {me.plan === "creator" ? (
                            <>
                                <p className="text-slate-500">
                                    You have access to history, regenerate, URL input, and tone presets.
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full border-slate-200 text-xs text-slate-900 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={handlePortal}
                                    disabled={portalLoading}
                                >
                                    {portalLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            <span>Opening...</span>
                                        </span>
                                    ) : (
                                        "Manage billing"
                                    )}
                                </Button>
                            </>
                        ) : (
                            <>
                                <ul className="list-disc space-y-1 pl-4 text-slate-500">
                                    <li>5 repurposes / month</li>
                                    <li>All LinkedIn formats</li>
                                    <li>No history, regenerate, or URL input</li>
                                </ul>
                                <Button
                                    size="sm"
                                    className="w-full text-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={handleUpgrade}
                                    disabled={upgrading}
                                >
                                    {upgrading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            <span>Redirecting...</span>
                                        </span>
                                    ) : (
                                        "Upgrade to Creator – $9.99/mo"
                                    )}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

