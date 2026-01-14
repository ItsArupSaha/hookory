"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { auth } from "@/lib/firebase/client"
import { formatDate } from "@/lib/utils"
import { Loader2, Trash2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface JobSummary {
    id: string
    createdAt: string
    formatsSelected: string[]
}

interface JobDetail extends JobSummary {
    inputText: string
    outputs: Record<string, string>
    context: any
}

interface JobsResponse {
    plan: "free" | "creator"
    jobs: JobSummary[]
}

export default function HistoryPage() {
    const router = useRouter()
    const pathname = usePathname()
    const [loading, setLoading] = useState(true)
    const [plan, setPlan] = useState<"free" | "creator" | null>(null)
    const [jobs, setJobs] = useState<JobSummary[]>([])
    const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null)
    const [loadingJobId, setLoadingJobId] = useState<string | null>(null)
    const [deletingJobId, setDeletingJobId] = useState<string | null>(null)
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    async function loadHistory() {
        if (!auth) return
        const user = auth.currentUser
        if (!user) {
            router.push("/login")
            return
        }
        try {
            const token = await user.getIdToken()
            const res = await fetch("/api/jobs", {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!res.ok) {
                // Try to parse error response
                let errorData
                try {
                    errorData = await res.json()
                } catch {
                    errorData = { error: `Server error: ${res.status}` }
                }

                if (res.status === 403 && errorData.plan === "free") {
                    setPlan("free")
                    setJobs([])
                    setLoading(false)
                    return
                }
                throw new Error(errorData.error || "Failed to load history")
            }

            const data = await res.json() as JobsResponse
            setPlan(data.plan)
            setJobs(data.jobs)
        } catch (err: any) {
            console.error("History load error:", err)
            toast({
                title: "Error",
                description: err?.message || "Failed to load history.",
                variant: "destructive",
            })
            setPlan("free")
            setJobs([])
        } finally {
            setLoading(false)
        }
    }

    // Refresh on mount and when pathname changes (navigation)
    useEffect(() => {
        loadHistory()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname])

    // Refresh data when page becomes visible or window gains focus
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                loadHistory()
            }
        }

        const handleFocus = () => {
            loadHistory()
        }

        // Refresh when page becomes visible or window gains focus
        document.addEventListener("visibilitychange", handleVisibilityChange)
        window.addEventListener("focus", handleFocus)

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange)
            window.removeEventListener("focus", handleFocus)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function openJob(id: string) {
        if (!auth) return
        const user = auth.currentUser
        if (!user) return

        // Set loading state immediately for smooth UX
        setLoadingJobId(id)
        setSelectedJob(null) // Clear previous job to show loading
        setLoadingProgress(0) // Reset progress

        // Animate progress bar (simulated, but smooth)
        const progressInterval = setInterval(() => {
            setLoadingProgress((prev) => {
                if (prev >= 90) return prev // Stop at 90% until API completes
                // Slow down as it approaches 90% for realistic feel
                const increment = prev < 50 ? 8 : prev < 80 ? 4 : 2
                return Math.min(prev + increment, 90)
            })
        }, 100)

        try {
            const token = await user.getIdToken()
            const res = await fetch(`/api/jobs/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || "Failed to load job")
            }

            // Complete the progress bar
            setLoadingProgress(100)
            // Small delay to show 100% before switching to content
            setTimeout(() => {
                setSelectedJob(data as JobDetail)
                setLoadingJobId(null)
                setLoadingProgress(0)
            }, 200)
        } catch (err: any) {
            clearInterval(progressInterval)
            setLoadingJobId(null)
            setLoadingProgress(0)
            toast({
                title: "Error",
                description: err?.message || "Failed to open job.",
                variant: "destructive",
            })
        } finally {
            clearInterval(progressInterval)
        }
    }

    function handleDeleteClick(id: string, e: React.MouseEvent) {
        e.stopPropagation() // Prevent opening the job when clicking delete
        setConfirmDeleteId(id) // Show confirmation modal
    }

    function cancelDelete() {
        setConfirmDeleteId(null)
    }

    async function confirmDelete() {
        if (!confirmDeleteId) return
        if (!auth) return
        const user = auth.currentUser
        if (!user) return

        const id = confirmDeleteId
        setConfirmDeleteId(null) // Close modal
        setDeletingJobId(id)
        try {
            const token = await user.getIdToken()
            const res = await fetch(`/api/jobs/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to delete job")
            }

            // Remove from local state
            setJobs((prev) => prev.filter((job) => job.id !== id))

            // Clear selected job if it was the deleted one
            if (selectedJob?.id === id) {
                setSelectedJob(null)
            }

            toast({
                title: "Deleted",
                description: "History item deleted successfully.",
            })
        } catch (err: any) {
            toast({
                title: "Error",
                description: err?.message || "Failed to delete job.",
                variant: "destructive",
            })
        } finally {
            setDeletingJobId(null)
        }
    }


    if (loading) {
        return (
            <div className="text-xs text-slate-400">
                Loading history…
            </div>
        )
    }

    if (plan === "free") {
        return (
            <div className="flex h-full items-center justify-center">
                <Card className="max-w-md border-amber-200 bg-amber-50">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-slate-900">
                            History is a Creator feature
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs text-slate-700">
                        <p>
                            Save every repurpose, revisit past outputs, and quickly remix your
                            best-performing posts.
                        </p>
                        <ul className="list-disc space-y-1 pl-4 text-slate-500">
                            <li>Full history of your last 100 repurposes</li>
                            <li>Open and tweak any past LinkedIn format</li>
                            <li>Perfect for weekly content batching</li>
                        </ul>
                        <Button
                            className="mt-2 w-full"
                            onClick={() => router.push("/usage")}
                        >
                            Upgrade to Creator
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="grid gap-4 text-slate-900 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
            <div className="space-y-3">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    History
                </h1>
                <p className="text-xs text-slate-500">
                    Recent repurposes. Click to open and review outputs.
                </p>

                {jobs.length === 0 ? (
                    <p className="mt-4 text-xs text-slate-500">
                        No history yet. Generate a repurpose with &quot;Save to
                        history&quot; enabled.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                className="group relative flex w-full items-center gap-2 rounded-md border border-slate-200 bg-white shadow-sm hover:border-orange-300 hover:bg-orange-50/60"
                            >
                                <button
                                    type="button"
                                    onClick={() => openJob(job.id)}
                                    className="flex flex-1 flex-col items-start px-3 py-2 text-left text-xs"
                                >
                                    <span className="font-medium text-slate-900">
                                        {formatDate(job.createdAt)}
                                    </span>
                                    <span className="mt-0.5 text-[11px] text-slate-500">
                                        {job.formatsSelected.join(", ")}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => handleDeleteClick(job.id, e)}
                                    disabled={deletingJobId === job.id}
                                    className="mr-2 rounded p-1.5 text-slate-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100 disabled:opacity-50"
                                    title="Delete this history item"
                                >
                                    {deletingJobId === job.id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-900">
                    Details
                </h2>
                {loadingJobId ? (
                    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-700">
                                    Loading history details...
                                </span>
                                <span className="text-slate-500">
                                    {loadingProgress}%
                                </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-300 ease-out"
                                    style={{ width: `${loadingProgress}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Fetching your content...</span>
                        </div>
                    </div>
                ) : !selectedJob ? (
                    <p className="text-xs text-slate-500">
                        Select a repurpose from the left to view inputs and outputs.
                    </p>
                ) : (
                    <div className="space-y-4">
                        <Card className="border-slate-200 bg-white">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-slate-900">
                                    Input
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    rows={6}
                                    value={selectedJob.inputText}
                                    readOnly
                                    className="text-xs"
                                />
                            </CardContent>
                        </Card>

                        <div className="space-y-3">
                            {Object.entries(selectedJob.outputs).map(([format, text]) => (
                                <Card
                                    key={format}
                                    className="border-slate-200 bg-white text-xs"
                                >
                                    <CardHeader>
                                        <CardTitle className="text-xs font-semibold capitalize text-slate-900">
                                            {format.replace(/-/g, " ")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            rows={Math.max(6, Math.ceil(text.length / 80))}
                                            value={text}
                                            readOnly
                                            className="min-h-[120px] resize-y"
                                            style={{ overflowY: 'auto' }}
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md border-slate-200 bg-white shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold text-slate-900">
                                Delete History Item
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-slate-600">
                                Are you sure you want to delete this history item? This action cannot be undone.
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={cancelDelete}
                                    className="flex-1 text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={confirmDelete}
                                    className="flex-1 text-xs"
                                >
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

