import { getUserFromRequest } from "@/lib/auth-server"
import { stripe } from "@/lib/stripe"
import { checkStripeSubscriptionStatus } from "@/lib/stripe-helpers"
import { NextRequest, NextResponse } from "next/server"

/**
 * Debug endpoint to check Stripe subscription status
 * Returns detailed information about the user's subscription
 */
export async function GET(req: NextRequest) {
  const authed = await getUserFromRequest(req)
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { uid, userDoc } = authed

  if (!userDoc.stripeCustomerId || !stripe) {
    return NextResponse.json({
      customerId: userDoc.stripeCustomerId || null,
      hasStripeCustomer: !!userDoc.stripeCustomerId,
      subscriptionStatus: null,
      message: "No Stripe customer ID found",
    })
  }

  try {
    // Get detailed subscription info from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: userDoc.stripeCustomerId,
      status: "all",
      limit: 10,
    })

    // Check using our helper function
    const subscriptionStatus = await checkStripeSubscriptionStatus(userDoc.stripeCustomerId)

    // Format subscription details
    const subscriptionDetails = subscriptions.data.map((sub) => {
      const periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null
      const canceledAt = sub.canceled_at
        ? new Date(sub.canceled_at * 1000)
        : null
      const endedAt = sub.ended_at
        ? new Date(sub.ended_at * 1000)
        : null
      const now = new Date()

      return {
        id: sub.id,
        status: sub.status,
        created: new Date(sub.created * 1000).toISOString(),
        currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
        currentPeriodEnd: periodEnd?.toISOString() || null,
        canceledAt: canceledAt?.toISOString() || null,
        endedAt: endedAt?.toISOString() || null,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        periodEndIsPast: periodEnd ? periodEnd <= now : null,
        canceledAtIsPast: canceledAt ? canceledAt <= now : null,
        endedAtIsPast: endedAt ? endedAt <= now : null,
      }
    })

    return NextResponse.json({
      customerId: userDoc.stripeCustomerId,
      subscriptionCount: subscriptions.data.length,
      subscriptions: subscriptionDetails,
      subscriptionStatus: {
        hasCreatorAccess: subscriptionStatus.hasCreatorAccess,
        status: subscriptionStatus.status,
        periodEnd: subscriptionStatus.periodEnd?.toISOString() || null,
        subscriptionId: subscriptionStatus.subscriptionId,
      },
      effectivePlan: subscriptionStatus.hasCreatorAccess ? "creator" : "free",
    })
  } catch (err: any) {
    console.error("Error checking subscription status:", err)
    return NextResponse.json(
      { error: err?.message || "Failed to check subscription status" },
      { status: 500 }
    )
  }
}
