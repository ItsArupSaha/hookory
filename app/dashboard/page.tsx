"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { auth } from "@/lib/firebase/client"
import { User } from "firebase/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type FormatKey =
    | "thought-leadership"
    | "story-based"
    | "educational-carousel"
    | "short-viral-hook"

const MAX_INPUT_LENGTH_FREE = 5000
const MAX_INPUT_LENGTH_CREATOR = 10000

export default function NewRepurposePage() {
    const router = useRouter()
    const [tab, setTab] = useState<"text" | "url">("text")
    const [inputText, setInputText] = useState("")
    const [url, setUrl] = useState("")
    const [targetAudience, setTargetAudience] = useState("")
    const [goal, setGoal] = useState<"engagement" | "leads" | "authority" | "">("engagement") // Default: "Start conversations"
    const [style, setStyle] = useState<"thought-leader" | "storyteller" | "educator" | "">("thought-leader") // Default: "Opinion & insight"
    const [emojiOn, setEmojiOn] = useState(false)
    const [tonePreset, setTonePreset] = useState<
        "professional" | "conversational" | "storytelling" | "educational" | ""
    >("professional")
    const [formats, setFormats] = useState<Record<FormatKey, boolean>>({
        "thought-leadership": true,
        "story-based": false,
        "educational-carousel": false,
        "short-viral-hook": false,
    })
    const [loading, setLoading] = useState(false)
    const [cooldown, setCooldown] = useState(0)
    const [results, setResults] = useState<Record<FormatKey, string>>({
        "thought-leadership": "",
        "story-based": "",
        "educational-carousel": "",
        "short-viral-hook": "",
    })
    const [plan, setPlan] = useState<"free" | "creator" | null>(null)
    const [usageCount, setUsageCount] = useState<number | null>(null)
    const [usageLimitMonthly, setUsageLimitMonthly] = useState<number | null>(null)

    useEffect(() => {
        async function loadMe() {
            if (!auth) return
            const user = auth.currentUser
            if (!user) return
            try {
                const token = await user.getIdToken()
                const res = await fetch("/api/me", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await res.json()
                if (res.ok) {
                    setPlan(data.plan as "free" | "creator")
                    setUsageCount(data.usageCount ?? 0)
                    setUsageLimitMonthly(data.usageLimitMonthly ?? 5)
                }
            } catch {
                // non-critical
            }
        }
        loadMe()
    }, [])

    // If free user is on URL tab, switch to text tab
    useEffect(() => {
        if (plan === "free" && tab === "url") {
            setTab("text")
        }
    }, [plan, tab])

    const selectedFormats = (Object.keys(formats) as FormatKey[]).filter(
        (k) => formats[k]
    )

    const isLimitReached = usageCount !== null && usageLimitMonthly !== null && usageCount >= usageLimitMonthly

    const canGenerate =
        selectedFormats.length > 0 &&
        (tab === "text"
            ? inputText.trim().length > 0
            : url.trim().length > 0) &&
        !loading &&
        !isLimitReached

    async function getUserAndToken(): Promise<{ user: User; token: string } | null> {
        if (!auth) return null
        const user = auth.currentUser
        if (!user) {
            router.push("/login")
            return null
        }
        const token = await user.getIdToken()
        return { user, token }
    }

    async function handleGenerate() {
        if (!canGenerate) return
        setLoading(true)
        try {
            const userInfo = await getUserAndToken()
            if (!userInfo) return

            const res = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify({
                    inputType: tab === "text" ? "text" : "url",
                    inputText,
                    url,
                    context: {
                        targetAudience: targetAudience.trim() || undefined,
                        goal: (goal || undefined) as any,
                        style: (style || undefined) as any,
                        emojiOn,
                        tonePreset: (tonePreset || undefined) as any,
                    },
                    formats: selectedFormats,
                    regenerate: false,
                    saveHistory: true,
                }),
            })

            const data = await res.json()
            if (!res.ok) {
                if (res.status === 402) {
                    // Limit reached - button is already disabled and message is shown at top
                    // Refresh usage data to update the UI
                    const userInfo = await getUserAndToken()
                    if (userInfo) {
                        const meRes = await fetch("/api/me", {
                            headers: { Authorization: `Bearer ${userInfo.token}` },
                        })
                        if (meRes.ok) {
                            const meData = await meRes.json()
                            setUsageCount(meData.usageCount ?? 0)
                            setUsageLimitMonthly(meData.usageLimitMonthly ?? 5)
                        }
                    }
                    return
                }
                if (res.status === 403 || res.status === 429) {
                    toast({
                        title: "Please wait",
                        description: data.error || "Try again in a bit.",
                        variant: "destructive",
                    })
                    if (typeof data.secondsRemaining === "number") {
                        setCooldown(data.secondsRemaining)
                    }
                    return
                }
                throw new Error(data.error || "Failed to generate")
            }

            const outputs = data.outputs as Record<string, string>
            setResults((prev) => ({
                ...prev,
                ...outputs,
            }))
            toast({
                title: "Generated",
                description: "Your LinkedIn formats are ready.",
            })
            // Refresh usage data after successful generation
            if (userInfo) {
                const meRes = await fetch("/api/me", {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                })
                if (meRes.ok) {
                    const meData = await meRes.json()
                    setUsageCount(meData.usageCount ?? 0)
                    setUsageLimitMonthly(meData.usageLimitMonthly ?? 5)
                }
            }
            setCooldown(45)
            const interval = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } catch (err: any) {
            toast({
                title: "Error",
                description: err?.message || "Something went wrong.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleRegenerate(format: FormatKey) {
        if (!auth) return
        const userInfo = await getUserAndToken()
        if (!userInfo) return
        setLoading(true)
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify({
                    inputType: tab === "text" ? "text" : "url",
                    inputText,
                    url,
                    context: {
                        targetAudience: targetAudience.trim() || undefined,
                        goal: (goal || undefined) as any,
                        style: (style || undefined) as any,
                        emojiOn,
                        tonePreset: (tonePreset || undefined) as any,
                    },
                    formats: [format],
                    regenerate: true,
                    saveHistory: true,
                }),
            })

            const data = await res.json()
            if (!res.ok) {
                if (res.status === 402) {
                    // Limit reached - button is already disabled and message is shown at top
                    // Refresh usage data to update the UI
                    if (userInfo) {
                        const meRes = await fetch("/api/me", {
                            headers: { Authorization: `Bearer ${userInfo.token}` },
                        })
                        if (meRes.ok) {
                            const meData = await meRes.json()
                            setUsageCount(meData.usageCount ?? 0)
                            setUsageLimitMonthly(meData.usageLimitMonthly ?? 5)
                        }
                    }
                    return
                }
                if (res.status === 403 || res.status === 429) {
                    toast({
                        title: "Please wait",
                        description: data.error || "Try again in a bit.",
                        variant: "destructive",
                    })
                    if (typeof data.secondsRemaining === "number") {
                        setCooldown(data.secondsRemaining)
                    }
                    return
                }
                throw new Error(data.error || "Failed to regenerate")
            }

            const outputs = data.outputs as Record<string, string>
            setResults((prev) => ({
                ...prev,
                ...(outputs as any),
            }))
            toast({
                title: "Regenerated",
                description: "Updated LinkedIn format is ready.",
            })
            // Refresh usage data after successful regeneration
            if (userInfo) {
                const meRes = await fetch("/api/me", {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                })
                if (meRes.ok) {
                    const meData = await meRes.json()
                    setUsageCount(meData.usageCount ?? 0)
                    setUsageLimitMonthly(meData.usageLimitMonthly ?? 5)
                }
            }
            setCooldown(45)
            const interval = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } catch (err: any) {
            toast({
                title: "Error",
                description: err?.message || "Something went wrong.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    function toggleFormat(key: FormatKey) {
        setFormats((prev) => {
            const willSelect = !prev[key]
            const base: Record<FormatKey, boolean> = {
                "thought-leadership": false,
                "story-based": false,
                "educational-carousel": false,
                "short-viral-hook": false,
            }
            if (willSelect) {
                base[key] = true
            }
            return base
        })
    }

    function handleCopy(text: string) {
        if (!text) return
        navigator.clipboard.writeText(text)
        toast({
            title: "Copied",
            description: "Content copied to clipboard.",
        })
    }

    return (
        <div className="space-y-6 text-slate-900">
            {isLimitReached && (
                <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-orange-900">
                                Monthly limit reached
                            </p>
                            <p className="text-xs text-orange-700">
                                You&apos;ve used {usageCount} of {usageLimitMonthly} generations this month. Upgrade to increase your limit and keep generating.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            className="text-xs"
                            onClick={() => router.push("/usage")}
                        >
                            Upgrade Now
                        </Button>
                    </div>
                </div>
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        New Repurpose
                    </h1>
                    <p className="text-xs text-slate-500">
                        Paste your content and choose a LinkedIn format.
                    </p>
                </div>
                {cooldown > 0 && (
                    <p className="text-xs text-slate-400">
                        Cooldown: {cooldown}s before next generation
                    </p>
                )}
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <div className="space-y-4">
                    {/* Input card */}
                    <Card className="border-slate-200 bg-white">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold text-slate-900">
                                Input
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2 text-xs">
                                <button
                                    className={`rounded-full px-3 py-1 text-[11px] ${tab === "text"
                                        ? "bg-orange-500 text-white"
                                        : "bg-slate-100 text-slate-700"
                                        } border border-slate-200`}
                                    onClick={() => setTab("text")}
                                >
                                    Paste Text
                                </button>
                                <button
                                    className={`rounded-full px-3 py-1 text-[11px] ${tab === "url"
                                        ? "bg-orange-500 text-white"
                                        : plan === "free"
                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                                            : "bg-slate-100 text-slate-700"
                                        } border border-slate-200`}
                                    onClick={() => {
                                        if (plan === "free") {
                                            toast({
                                                title: "Upgrade required",
                                                description: "URL input is available on the Creator plan. Upgrade to unlock.",
                                                variant: "destructive",
                                            })
                                            return
                                        }
                                        setTab("url")
                                    }}
                                    disabled={plan === "free"}
                                >
                                    Paste URL
                                    {plan === "free" && (
                                        <span className="ml-1 text-[10px]">(Creator only)</span>
                                    )}
                                </button>
                            </div>

                            {tab === "text" ? (
                                <div className="space-y-2">
                                    <Label htmlFor="inputText" className="text-xs text-slate-700">
                                        Content to repurpose
                                    </Label>
                                    <Textarea
                                        id="inputText"
                                        value={inputText}
                                        onChange={(e) => {
                                            const maxLength = plan === "creator" ? MAX_INPUT_LENGTH_CREATOR : MAX_INPUT_LENGTH_FREE
                                            setInputText(e.target.value.slice(0, maxLength))
                                        }}
                                        rows={8}
                                        maxLength={plan === "creator" ? MAX_INPUT_LENGTH_CREATOR : MAX_INPUT_LENGTH_FREE}
                                        placeholder="Paste your article, newsletter, or long-form content here…"
                                    />
                                    <p className="text-[11px] text-slate-500">
                                        {inputText.length}/{plan === "creator" ? MAX_INPUT_LENGTH_CREATOR : MAX_INPUT_LENGTH_FREE} characters
                                    </p>
                                </div>
                            ) : plan === "free" ? (
                                <div className="space-y-3 rounded-lg border-2 border-red-200 bg-red-50 p-4 text-center">
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-red-900">
                                            URL input is available on the Creator plan
                                        </p>
                                        <p className="text-xs text-red-700">
                                            Upgrade to unlock URL extraction and other premium features.
                                        </p>
                                        <Button
                                            size="sm"
                                            className="mt-2 text-xs"
                                            onClick={() => router.push("/usage")}
                                        >
                                            Upgrade to Creator
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="url" className="text-xs text-slate-700">
                                        Public URL (Medium, Notion, Google Doc)
                                    </Label>
                                    <Input
                                        id="url"
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://"
                                    />
                                    <p className="text-[11px] text-slate-500">
                                        Paste a publicly viewable article or doc. We&apos;ll extract
                                        the readable content for you.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Context card */}
                    <Card className="border-slate-200 bg-white">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold text-slate-900">
                                Context
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2 sm:col-span-2">
                                <Label
                                    htmlFor="targetAudience"
                                    className="text-xs text-slate-700"
                                >
                                    Who is this post for?
                                </Label>
                                <Input
                                    id="targetAudience"
                                    value={targetAudience}
                                    onChange={(e) => setTargetAudience(e.target.value)}
                                    placeholder="e.g. Founders, HR leaders, Recruiters, Developers"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-slate-700">What&apos;s your goal?</Label>
                                <Select
                                    value={goal}
                                    onValueChange={(v) => setGoal(v as any)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="What's your goal?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="engagement">
                                            Start conversations (likes, comments, saves)
                                        </SelectItem>
                                        <SelectItem value="authority">
                                            Build credibility (show expertise & insight)
                                        </SelectItem>
                                        <SelectItem value="leads">
                                            Attract opportunities (clients, roles, inbound leads)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-slate-700">Post style</Label>
                                <Select
                                    value={style}
                                    onValueChange={(v) => setStyle(v as any)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Post style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="thought-leader">
                                            Opinion & insight (strong point of view)
                                        </SelectItem>
                                        <SelectItem value="storyteller">
                                            Personal story (experience → lesson)
                                        </SelectItem>
                                        <SelectItem value="educator">
                                            Teach something useful (tips, steps, frameworks)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-slate-700">Emojis</Label>
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <button
                                        type="button"
                                        onClick={() => setEmojiOn(!emojiOn)}
                                        className={`flex h-6 w-10 items-center rounded-full border px-0.5 ${emojiOn ? "border-orange-400 bg-orange-500/90" : "border-slate-300 bg-slate-100"
                                            }`}
                                    >
                                        <span
                                            className={`h-5 w-5 rounded-full bg-white transition-transform ${emojiOn ? "translate-x-4" : "translate-x-0"
                                                }`}
                                        />
                                    </button>
                                    <span>{emojiOn ? "On" : "Off"}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-slate-700">
                                    Writing tone
                                </Label>
                                <Select
                                    value={tonePreset}
                                    onValueChange={(v) => setTonePreset(v as any)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Writing tone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="professional">
                                            Professional (clear, confident, neutral)
                                        </SelectItem>
                                        <SelectItem value="conversational">
                                            Friendly (conversational, approachable)
                                        </SelectItem>
                                        <SelectItem value="storytelling">
                                            Story-driven (personal, reflective)
                                        </SelectItem>
                                        <SelectItem value="educational">
                                            Instructional (clear, structured, practical)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Formats */}
                    <Card className="border-slate-200 bg-white">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold text-slate-900">
                                What should we generate?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 sm:grid-cols-2">
                            {(
                                [
                                    ["thought-leadership", "Main LinkedIn post"],
                                    ["story-based", "Story-style post"],
                                    ["educational-carousel", "Educational / carousel text"],
                                    ["short-viral-hook", "Short hook post (scroll-stopping)"],
                                ] as [FormatKey, string][]
                            ).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => toggleFormat(key)}
                                    className={`flex flex-col items-start rounded-md border px-3 py-2 text-left text-xs ${formats[key]
                                        ? "border-orange-400 bg-orange-50 text-slate-900"
                                        : "border-slate-200 bg-white text-slate-600"
                                        }`}
                                >
                                    <span className="font-medium">{label}</span>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleGenerate}
                            disabled={!canGenerate || cooldown > 0}
                            className="min-w-[160px]"
                        >
                            {loading
                                ? "Generating…"
                                : isLimitReached
                                    ? "Limit Reached"
                                    : cooldown > 0
                                        ? `Cooldown (${cooldown}s)`
                                        : "Generate"}
                        </Button>
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-slate-900">
                        Outputs
                    </h2>
                    {selectedFormats.length === 0 ? (
                        <p className="text-xs text-slate-500">
                            Select at least one format to generate LinkedIn content.
                        </p>
                    ) : (
                        selectedFormats.map((key) => {
                            const titleMap: Record<FormatKey, string> = {
                                "thought-leadership": "Main LinkedIn post",
                                "story-based": "Story-style post",
                                "educational-carousel": "Educational / carousel text",
                                "short-viral-hook": "Short hook post",
                            }
                            const value = results[key] || ""
                            const charCount = value.length
                            return (
                                <Card
                                    key={key}
                                    className="border-slate-200 bg-white text-xs shadow-sm"
                                >
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                        <CardTitle className="text-xs font-semibold text-slate-900">
                                            {titleMap[key]}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                            <span>{charCount} chars</span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(value)}
                                                disabled={!value || value.trim().length === 0}
                                                className="rounded-md border border-slate-200 px-2 py-1 text-[11px] hover:border-orange-300 hover:bg-orange-50/70 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:bg-transparent"
                                            >
                                                Copy
                                            </button>
                                            {plan === "creator" && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRegenerate(key)}
                                                    disabled={!value || value.trim().length === 0}
                                                    className="rounded-md border border-slate-200 px-2 py-1 text-[10px] text-slate-700 hover:border-orange-300 hover:bg-orange-50/70 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:bg-transparent"
                                                >
                                                    Regenerate
                                                </button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            rows={Math.max(7, Math.ceil(charCount / 80))}
                                            value={value}
                                            onChange={(e) =>
                                                setResults((prev) => ({
                                                    ...prev,
                                                    [key]: e.target.value,
                                                }))
                                            }
                                            className="min-h-[120px] resize-y"
                                            style={{ overflowY: 'auto' }}
                                        />
                                        <p className="mt-1 text-[10px] text-slate-500">
                                            Regenerate and save to history are Creator features.
                                        </p>
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}

