import { getUserFromRequest } from "@/lib/auth-server"
import { adminDb } from "@/lib/firebase/admin"
import { checkStripeSubscriptionStatus, syncStripeToFirestore } from "@/lib/stripe-helpers"
import { NextRequest, NextResponse } from "next/server"

// Force dynamic rendering since we access request headers for authentication
export const dynamic = 'force-dynamic'

interface Params {
  params: {
    id: string
  }
}

export async function GET(req: NextRequest, { params }: Params) {
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
      console.error("[API /jobs/[id]] Stripe check failed:", stripeError)
      // If Stripe check fails, deny access (fail secure)
      return NextResponse.json(
        { error: "History is available on the Creator plan." },
        { status: 403 }
      )
    }
    
    // Sync to Firestore in background (non-blocking)
    syncStripeToFirestore(uid, subscriptionStatus).catch((err) => {
      console.error("[API /jobs/[id]] Background sync failed:", err)
    })

    if (!subscriptionStatus.hasCreatorAccess) {
      return NextResponse.json(
        { error: "History is available on the Creator plan." },
        { status: 403 }
      )
    }

    const db = adminDb
    const jobRef = db.collection("jobs").doc(params.id)
    const snap = await jobRef.get()
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const data = snap.data() as any
    if (data.userId !== uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({
      id: snap.id,
      createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
      formatsSelected: data.formatsSelected ?? [],
      inputText: data.inputText ?? "",
      outputs: data.outputs ?? {},
      context: data.context ?? {},
    })
  } catch (error: any) {
    console.error("[API /jobs/[id]] Error:", error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
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
      console.error("[API /jobs/[id] DELETE] Stripe check failed:", stripeError)
      return NextResponse.json(
        { error: "History is available on the Creator plan." },
        { status: 403 }
      )
    }
    
    // Sync to Firestore in background (non-blocking)
    syncStripeToFirestore(uid, subscriptionStatus).catch((err) => {
      console.error("[API /jobs/[id] DELETE] Background sync failed:", err)
    })

    if (!subscriptionStatus.hasCreatorAccess) {
      return NextResponse.json(
        { error: "History is available on the Creator plan." },
        { status: 403 }
      )
    }

    const db = adminDb
    const jobRef = db.collection("jobs").doc(params.id)
    const snap = await jobRef.get()
    
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const data = snap.data() as any
    if (data.userId !== uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete the job
    await jobRef.delete()

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("[API /jobs/[id] DELETE] Error:", error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
