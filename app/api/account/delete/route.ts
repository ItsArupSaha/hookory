import { getUserFromRequest } from "@/lib/auth-server"
import { adminAuth, adminDb } from "@/lib/firebase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const authed = await getUserFromRequest(req)
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { uid } = authed

  try {
    const db = adminDb
    const userRef = db.collection("users").doc(uid)
    await userRef.update({
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripeStatus: null,
      plan: "free",
      usageLimitMonthly: 5,
      deletedAt: new Date(),
    })

    // Soft-delete in auth by disabling (optional, but protects misuse)
    try {
      const authAdmin = adminAuth
      await authAdmin.updateUser(uid, { disabled: true })
    } catch {
      // ignore if fails
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Account delete error:", err)
    return NextResponse.json(
      { error: err?.message || "Failed to update account" },
      { status: 500 }
    )
  }
}

