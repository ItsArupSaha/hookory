import { useAppShell } from "@/components/layout/app-shell"
import { toast } from "@/components/ui/use-toast"
import { auth } from "@/lib/firebase/client"
import { User } from "firebase/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FormatKey, ToneType } from "@/components/dashboard/types"
import { useSharedCooldown } from "./use-shared-cooldown"

export function useSeries() {
    const { refreshUserData } = useAppShell()
    const router = useRouter()

    // Auth & User
    const [user, setUser] = useState<User | null>(null)
    const [plan, setPlan] = useState<"free" | "creator" | null>(null)
    const [usageCount, setUsageCount] = useState<number | null>(null)
    const [usageLimitMonthly, setUsageLimitMonthly] = useState<number | null>(null)

    // Input State
    const [tab, setTab] = useState<"text" | "url">("text")
    const [inputText, setInputText] = useState("")
    const [url, setUrl] = useState("")

    // Context State
    const [readerContext, setReaderContext] = useState("")
    const [emojiOn, setEmojiOn] = useState(false)
    const [tonePreset, setTonePreset] = useState<ToneType>("professional")

    // Series Configuration
    // We enforce 4 posts. We allow user to pick the format for each step.
    // Defaults: Post 1 (Main), Post 2 (Story), Post 3 (Carousel), Post 4 (Short)
    const [postFormats, setPostFormats] = useState<[FormatKey, FormatKey, FormatKey, FormatKey]>([
        "main-post",
        "story-based",
        "carousel",
        "short-viral-hook"
    ])

    // Results State
    const [results, setResults] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    // Shared cooldown (syncs across single post and series)
    const { cooldown, startCooldown } = useSharedCooldown()

    useEffect(() => {
        async function loadMe() {
            if (!auth) return
            const currentUser = auth.currentUser
            if (!currentUser) return
            setUser(currentUser)
            try {
                const token = await currentUser.getIdToken()
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

    // Series is Creator only. If free user tries to access, they see upgrade prompt in UI.
    const isLimitReached = usageCount !== null && usageLimitMonthly !== null && usageCount >= usageLimitMonthly
    const canGenerate =
        (tab === "text" ? inputText.trim().length > 0 : url.trim().length > 0) &&
        !loading &&
        !isLimitReached &&
        plan === "creator" // Strict client-side check

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

    const updatePostFormat = (index: 0 | 1 | 2 | 3, format: FormatKey) => {
        setPostFormats(prev => {
            const next = [...prev] as [FormatKey, FormatKey, FormatKey, FormatKey]
            next[index] = format
            return next
        })
    }

    async function handleGenerateSeries() {
        if (!canGenerate) {
            if (plan !== "creator") {
                toast({
                    title: "Upgrade Required",
                    description: "Series generation is a Creator plan feature.",
                    variant: "destructive"
                })
                router.push("/usage")
            }
            return
        }

        setLoading(true)
        setResults([]) // Clear previous results

        try {
            const userInfo = await getUserAndToken()
            if (!userInfo) return
            setUser(userInfo.user)

            const res = await fetch("/api/series", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify({
                    inputType: tab === "text" ? "text" : "url",
                    inputText: inputText || undefined,
                    url: url || undefined, // Send undefined if empty to avoid Zod URL errors
                    context: {
                        readerContext: readerContext.trim() || undefined,
                        emojiOn,
                        tonePreset,
                    },
                    postFormats,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                if (res.status === 402) {
                    // Limit reached
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
                if (res.status === 429) {
                    toast({
                        title: "Please wait",
                        description: data.error || "Cooldown active.",
                        variant: "destructive",
                    })
                    if (typeof data.secondsRemaining === "number") {
                        startCooldown(data.secondsRemaining)
                    }
                    return
                }
                throw new Error(data.error || "Failed to generate series")
            }

            // Success
            setResults(data.posts) // Expecting string[]

            refreshUserData()
            toast({
                title: "Series Generated",
                description: "Your 4-post narrative series is ready.",
            })

            // Update limits
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

            // Set cooldown (30s for creator)
            startCooldown(30)

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



    const updatePost = (index: number, newContent: string) => {
        setResults(prev => {
            const next = [...prev]
            if (index >= 0 && index < next.length) {
                next[index] = newContent
            }
            return next
        })
    }

    function handleCopy(text: string) {
        if (!text) return
        navigator.clipboard.writeText(text)
        toast({
            title: "Copied",
            description: "Post copied to clipboard.",
        })
    }

    return {
        user,
        plan,
        usageCount,
        usageLimitMonthly,
        // Input
        tab, setTab,
        inputText, setInputText,
        url, setUrl,
        // Context
        readerContext, setReaderContext,
        emojiOn, setEmojiOn,
        tonePreset, setTonePreset,
        // Config
        postFormats, updatePostFormat,
        // Actions
        handleGenerateSeries,
        canGenerate,
        loading,
        cooldown,
        results,
        updatePost,
        handleCopy
    }
}
