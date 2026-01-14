import { getUserFromRequest } from "@/lib/auth-server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const authed = await getUserFromRequest(req)
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { uid, userDoc } = authed

  // Read from Firebase - this is now the source of truth
  // Webhooks update Firebase immediately when subscription changes
  const planFromFirebase = userDoc.plan as "free" | "creator" | undefined
  const planStartsAt = userDoc.planStartsAt?.toDate() || userDoc.subscriptionPeriodStart?.toDate() || null
  const planExpiresAt = userDoc.planExpiresAt?.toDate() || userDoc.subscriptionPeriodEnd?.toDate() || null
  const stripeStatus = userDoc.stripeStatus as string | null | undefined
  
  // Determine effective plan
  // Trust the plan field in Firebase - webhooks keep it updated
  // Only check expiration if expiration date exists
  let effectivePlan: "free" | "creator" = planFromFirebase === "creator" ? "creator" : "free"
  
  // If plan is creator and expiration date exists, check if expired
  if (effectivePlan === "creator" && planExpiresAt) {
    const now = new Date()
    if (planExpiresAt <= now) {
      // Plan has expired, downgrade to free
      effectivePlan = "free"
    }
  }
  
  const usageLimitMonthly = effectivePlan === "creator" ? 100 : 5
  
  console.log(`[API /me] Firebase data: plan=${planFromFirebase}, expiresAt=${planExpiresAt?.toISOString()}, stripeStatus=${stripeStatus}, effectivePlan=${effectivePlan}`)

  return NextResponse.json({
    plan: effectivePlan,
    emailVerified: userDoc.emailVerified,
    usageCount: userDoc.usageCount || 0,
    usageLimitMonthly,
    usageResetAt: userDoc.usageResetAt?.toDate().toISOString() || new Date().toISOString(),
    stripeStatus: stripeStatus || null,
    subscriptionPeriodStart: planStartsAt?.toISOString() || null,
    subscriptionPeriodEnd: planExpiresAt?.toISOString() || null,
  })
}

