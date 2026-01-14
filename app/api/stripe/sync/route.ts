import { getUserFromRequest } from "@/lib/auth-server"
import { adminDb } from "@/lib/firebase/admin"
import { stripe } from "@/lib/stripe"
import { Timestamp } from "firebase-admin/firestore"
import { NextRequest, NextResponse } from "next/server"

/**
 * Manual sync endpoint to update user plan from Stripe subscription status
 * Useful for debugging or when webhooks fail
 */
export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    )
  }

  const authed = await getUserFromRequest(req)
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { uid, userDoc } = authed

  if (!userDoc.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe customer ID found. Please upgrade first." },
      { status: 400 }
    )
  }

  try {
    // Fetch all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: userDoc.stripeCustomerId,
      status: "all",
      limit: 10,
    })

    console.log(`[Sync] Customer ${userDoc.stripeCustomerId}: Found ${subscriptions.data.length} subscription(s)`)

    // Find the most recent valid subscription
    // - Active, trialing, past_due: always valid
    // - Canceled: valid only if period hasn't ended yet (user paid for the period)
    //   This handles both:
    //   1. Cancel at period end (default): current_period_end stays as Feb 13, access continues
    //   2. Cancel immediately: current_period_end set to now/past, access ends immediately
    const now = new Date()
    const validSubscription = subscriptions.data.find((sub) => {
      const periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null
      
      const isValid = (
        sub.status === "active" ||
        sub.status === "trialing" ||
        sub.status === "past_due" ||
        (sub.status === "canceled" && periodEnd && periodEnd > now)
      )
      
      console.log(`[Sync] Subscription ${sub.id}: status=${sub.status}, periodEnd=${periodEnd?.toISOString()}, isValid=${isValid}`)
      
      return isValid
    })

    if (validSubscription) {
      // User has a valid subscription (even if canceled, if period hasn't ended)
      const periodEnd = validSubscription.current_period_end
        ? new Date(validSubscription.current_period_end * 1000)
        : null
      
      console.log(`[Sync] Updating user to Creator plan: subscription=${validSubscription.id}, status=${validSubscription.status}`)
      
      await adminDb.collection("users").doc(uid).update({
        stripeSubscriptionId: validSubscription.id,
        stripeStatus: validSubscription.status,
        plan: "creator",
        usageLimitMonthly: 100,
        subscriptionPeriodEnd: periodEnd ? Timestamp.fromDate(periodEnd) : null,
        updatedAt: new Date(),
      })

      return NextResponse.json({
        success: true,
        message: "Plan synced to Creator",
        subscription: {
          id: validSubscription.id,
          status: validSubscription.status,
          periodEnd: periodEnd?.toISOString() || null,
        },
      })
    } else {
      // No active subscription found - set to free
      console.log(`[Sync] No valid subscription found, updating user to Free plan`)
      console.log(`[Sync] All subscriptions:`, subscriptions.data.map((sub) => ({
        id: sub.id,
        status: sub.status,
        periodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
      })))
      
      await adminDb.collection("users").doc(uid).update({
        stripeStatus: subscriptions.data.length > 0 ? subscriptions.data[0].status : "none",
        plan: "free",
        usageLimitMonthly: 5,
        subscriptionPeriodEnd: null,
        updatedAt: new Date(),
      })

      return NextResponse.json({
        success: true,
        message: "Plan synced to Free (no active subscription found)",
        subscriptions: subscriptions.data.map((sub) => ({
          id: sub.id,
          status: sub.status,
          periodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
        })),
      })
    }
  } catch (err: any) {
    console.error("Stripe sync error:", err)
    return NextResponse.json(
      { error: err?.message || "Failed to sync with Stripe" },
      { status: 500 }
    )
  }
}
