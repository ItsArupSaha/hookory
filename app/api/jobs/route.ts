import { getUserFromRequest } from "@/lib/auth-server"
import { adminDb } from "@/lib/firebase/admin"
import { checkStripeSubscriptionStatus, syncStripeToFirestore } from "@/lib/stripe-helpers"
import { NextRequest, NextResponse } from "next/server"

// Force dynamic rendering since we access request headers for authentication
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const authed = await getUserFromRequest(req)
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { uid, userDoc } = authed

    // ALWAYS check Stripe directly (source of truth)
    let subscriptionStatus
    try {
      subscriptionStatus = await checkStripeSubscriptionStatus(userDoc.stripeCustomerId)
    } catch (stripeError: any) {
      console.error("[API /jobs] Stripe check failed:", stripeError)
      // If Stripe check fails, deny access (fail secure)
      return NextResponse.json(
        { error: "History is available on the Creator plan.", plan: "free" },
        { status: 403 }
      )
    }
    
    // Sync to Firestore in background (non-blocking)
    syncStripeToFirestore(uid, subscriptionStatus).catch((err) => {
      console.error("[API /jobs] Background sync failed:", err)
    })

    if (!subscriptionStatus.hasCreatorAccess) {
      return NextResponse.json(
        { error: "History is available on the Creator plan.", plan: "free" },
        { status: 403 }
      )
    }

    // adminDb is guaranteed to be initialised in lib/firebase/admin
    const db = adminDb

    // Fetch jobs without orderBy to avoid index requirement
    // We'll sort in memory instead
    const snap = await db
      .collection("jobs")
      .where("userId", "==", uid)
      .limit(100) // Fetch more than we need, then sort and limit
      .get()

    // Map and sort by createdAt descending, then limit to 30
    const jobs = snap.docs
      .map((doc) => {
        const data = doc.data() as any
        return {
          id: doc.id,
          createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
          formatsSelected: data.formatsSelected ?? [],
        }
      })
      .sort((a, b) => {
        // Sort by createdAt descending (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      .slice(0, 30) // Limit to 30 most recent

    return NextResponse.json({
      plan: "creator",
      jobs,
    })
  } catch (error: any) {
    console.error("[API /jobs] Error:", error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
