import { getUserFromRequest } from "@/lib/auth-server"
import { NextRequest, NextResponse } from "next/server"
import { UserService } from "@/lib/services/user-service"

export async function GET(req: NextRequest) {
  const authed = await getUserFromRequest(req)
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { uid, userDoc } = authed

  // TRIGGER USAGE RESET CHECK
  // Just visiting the dashboard should trigger a rollover if the date has passed.
  // We don't care about the result (limited or not), just the side effect of resetting usage.
  await UserService.checkUsageLimit(uid).catch(err => {
    console.warn("[API /me] Failed to check/reset usage limit:", err)
  })

  // Read from Firebase - this is now the source of truth
  // Webhooks update Firebase immediately when subscription changes
  const planFromFirebase = userDoc.plan as "free" | "creator" | undefined
  const planStartsAt = userDoc.planStartsAt?.toDate() || userDoc.subscriptionPeriodStart?.toDate() || null
  const planExpiresAt = userDoc.planExpiresAt?.toDate() || userDoc.subscriptionPeriodEnd?.toDate() || null
  const lemonSqueezyStatus = userDoc.lemonSqueezyStatus as string | null | undefined

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

  console.log(`[API /me] Firebase data: plan=${planFromFirebase}, expiresAt=${planExpiresAt?.toISOString()}, status=${lemonSqueezyStatus}, effectivePlan=${effectivePlan}`)

  return NextResponse.json({
    plan: effectivePlan,
    emailVerified: userDoc.emailVerified,
    usageCount: userDoc.usageCount || 0,
    usageLimitMonthly,
    usageResetAt: userDoc.usageResetAt?.toDate().toISOString() || new Date().toISOString(),
    lemonSqueezyStatus: lemonSqueezyStatus || null,
    subscriptionPeriodStart: planStartsAt?.toISOString() || null,
    subscriptionPeriodEnd: planExpiresAt?.toISOString() || null,
    welcomeEmailSent: userDoc.welcomeEmailSent || false,
  })
}

