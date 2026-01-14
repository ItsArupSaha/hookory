"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { auth } from "@/lib/firebase/client"
import { sendEmailVerification } from "firebase/auth"
import { useEffect, useState } from "react"

export default function SettingsPage() {
    const [email, setEmail] = useState<string | null>(null)
    const [emailVerified, setEmailVerified] = useState<boolean | null>(null)
    const [loading, setLoading] = useState(true)
    const [sendingVerify, setSendingVerify] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (!auth) return
        const user = auth.currentUser
        if (!user) {
            setLoading(false)
            return
        }
        setEmail(user.email)
        setEmailVerified(user.emailVerified)
        setLoading(false)
    }, [])

    async function handleResendVerification() {
        if (!auth) return
        const user = auth.currentUser
        if (!user) return
        setSendingVerify(true)
        try {
            await sendEmailVerification(user)
            toast({
                title: "Verification email sent",
                description: "Check your inbox and spam folder.",
            })
        } catch (err: any) {
            toast({
                title: "Failed to send verification",
                description: err?.message || "Please try again later.",
                variant: "destructive",
            })
        } finally {
            setSendingVerify(false)
        }
    }

    async function handleDeleteAccount() {
        if (!auth) return
        const user = auth.currentUser
        if (!user) return

        if (
            !window.confirm(
                "This will disconnect your subscription metadata and mark your account as deleted. You can always sign up again. Continue?"
            )
        ) {
            return
        }

        setDeleting(true)
        try {
            const token = await user.getIdToken()
            const res = await fetch("/api/account/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || "Failed to delete account")
            }
            toast({
                title: "Account updated",
                description:
                    "Your subscription metadata has been cleared. You can sign up again anytime.",
            })
        } catch (err: any) {
            toast({
                title: "Delete failed",
                description: err?.message || "Please try again later.",
                variant: "destructive",
            })
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="text-xs text-slate-400">
                Loading settings…
            </div>
        )
    }

    return (
        <div className="space-y-4 text-slate-900">
            <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Settings
                </h1>
                <p className="text-xs text-slate-500">
                    Manage your account information.
                </p>
            </div>

            <Card className="border-slate-200 bg-white">
                <CardHeader>
                    <CardTitle className="text-sm font-semibold text-slate-900">
                        Account
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] text-slate-500">Email</p>
                            <p className="text-sm text-slate-900">
                                {email ?? "Unknown"}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] text-slate-500">Verification</p>
                            <p className="text-xs">
                                {emailVerified ? (
                                    <span className="text-emerald-600">Verified</span>
                                ) : (
                                    <span className="text-amber-600">Not verified</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {!emailVerified && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-200 text-xs text-slate-900"
                            onClick={handleResendVerification}
                            disabled={sendingVerify}
                        >
                            {sendingVerify ? "Sending…" : "Resend verification email"}
                        </Button>
                    )}
                </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
                <CardHeader>
                    <CardTitle className="text-sm font-semibold text-red-600">
                        Danger zone
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-700">
                    <p className="text-slate-500">
                        Soft-delete will keep your past jobs for now, but clears subscription
                        metadata and marks your account as deleted. You can create a new
                        account later with the same email.
                    </p>
                    <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs"
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                    >
                        {deleting ? "Processing…" : "Soft-delete account"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

