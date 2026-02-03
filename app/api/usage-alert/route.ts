import { getUserFromRequest } from "@/lib/auth-server"
import { sendEmail } from "@/lib/email"
import { getUsageLimitEmailTemplate, getUsageWarningEmailTemplate } from "@/lib/emails/usage-alerts"
import { adminDb } from "@/lib/firebase/admin"
import { Timestamp } from "firebase-admin/firestore"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export const runtime = "nodejs"

const BodySchema = z.object({
    type: z.enum(["warning", "limit"]),
    usageLimit: z.number().default(100)
})

export async function POST(req: NextRequest) {
    try {
        const authed = await getUserFromRequest(req)
        if (!authed) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { uid, userDoc } = authed
        const email = userDoc.email
        const displayName = userDoc.displayName || "Creator"
        const userRef = adminDb.collection("users").doc(uid)

        let body
        try {
            body = await req.json()
        } catch {
            return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
        }

        const result = BodySchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json({ error: "Invalid body" }, { status: 400 })
        }

        const { type, usageLimit } = result.data

        // Check if email already sent to prevent spam
        const freshDoc = await userRef.get()
        const data = freshDoc.data() as any || {}

        if (type === "warning") {
            if (data.usageWarningEmailSent === true) {
                return NextResponse.json({ alreadySent: true })
            }
            console.log(`[UsageAlert] Sending 80% warning to ${email}`)
            const html = getUsageWarningEmailTemplate(displayName, usageLimit)
            await sendEmail({
                to: email!,
                subject: "Heads Up: You've used 80% of your limit",
                html
            })
            await userRef.update({ usageWarningEmailSent: true, updatedAt: Timestamp.now() })
        }

        else if (type === "limit") {
            if (data.usageLimitEmailSent === true) {
                return NextResponse.json({ alreadySent: true })
            }
            console.log(`[UsageAlert] Sending 100% limit alert to ${email}`)
            const html = getUsageLimitEmailTemplate(displayName)
            await sendEmail({
                to: email!,
                subject: "Action Required: Monthly Limit Reached",
                html
            })
            await userRef.update({ usageLimitEmailSent: true, updatedAt: Timestamp.now() })
        }

        return NextResponse.json({ success: true })

    } catch (err: any) {
        console.error("[UsageAlert] Error:", err)
        return NextResponse.json(
            { error: err.message || "Internal server error" },
            { status: 500 }
        )
    }
}
