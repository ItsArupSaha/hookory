import { adminDb } from "@/lib/firebase/admin"
import { stripe } from "@/lib/stripe"
import { Timestamp } from "firebase-admin/firestore"

export interface SubscriptionStatus {
  hasCreatorAccess: boolean
  status: string | null
  periodEnd: Date | null
  subscriptionId: string | null
}

/**
 * Check Stripe directly to determine if user has active Creator subscription
 * This is the source of truth - always query Stripe, not Firestore
 */
export async function checkStripeSubscriptionStatus(
  stripeCustomerId: string | undefined
): Promise<SubscriptionStatus> {
  // Default: no access
  const defaultStatus: SubscriptionStatus = {
    hasCreatorAccess: false,
    status: null,
    periodEnd: null,
    subscriptionId: null,
  }

  if (!stripeCustomerId || !stripe) {
    return defaultStatus
  }

  try {
    // Query Stripe directly - this is the source of truth
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 10,
    })

    console.log(`[Stripe Check] Customer ${stripeCustomerId}: Found ${subscriptions.data.length} subscription(s)`)

    // Find the most recent valid subscription
    const now = new Date()
    const validSubscription = subscriptions.data.find((sub) => {
      const periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null
      const canceledAt = sub.canceled_at
        ? new Date(sub.canceled_at * 1000)
        : null
      const endedAt = sub.ended_at
        ? new Date(sub.ended_at * 1000)
        : null
      
      // Active, trialing, or past_due subscriptions are always valid
      if (sub.status === "active" || sub.status === "trialing" || sub.status === "past_due") {
        console.log(`[Stripe Check] Subscription ${sub.id}: status=${sub.status}, isValid=true (active status)`)
        return true
      }
      
      // For canceled subscriptions, check if it was immediately canceled or ended
      if (sub.status === "canceled") {
        // If ended_at exists and is in the past, subscription has ended
        if (endedAt && endedAt <= now) {
          console.log(`[Stripe Check] Subscription ${sub.id}: status=canceled, ended_at=${endedAt.toISOString()}, isValid=false (ended)`)
          return false
        }
        
        // If canceled_at exists and is in the past, and NOT cancel_at_period_end, it was immediately canceled
        if (canceledAt && canceledAt <= now && !sub.cancel_at_period_end) {
          console.log(`[Stripe Check] Subscription ${sub.id}: status=canceled, canceled_at=${canceledAt.toISOString()}, cancel_at_period_end=false, isValid=false (immediately canceled)`)
          return false
        }
        
        // If period has ended, subscription is not valid
        if (periodEnd && periodEnd <= now) {
          console.log(`[Stripe Check] Subscription ${sub.id}: status=canceled, periodEnd=${periodEnd.toISOString()}, isValid=false (period ended)`)
          return false
        }
        
        // Canceled but period hasn't ended yet (cancel at period end scenario)
        if (periodEnd && periodEnd > now) {
          console.log(`[Stripe Check] Subscription ${sub.id}: status=canceled, periodEnd=${periodEnd.toISOString()}, isValid=true (cancel at period end, period not ended)`)
          return true
        }
        
        // Fallback: canceled but no period end info
        console.log(`[Stripe Check] Subscription ${sub.id}: status=canceled, no valid period info, isValid=false`)
        return false
      }
      
      // Any other status is not valid
      console.log(`[Stripe Check] Subscription ${sub.id}: status=${sub.status}, isValid=false (unknown status)`)
      return false
    })

    if (validSubscription) {
      const periodEnd = validSubscription.current_period_end
        ? new Date(validSubscription.current_period_end * 1000)
        : null

      console.log(`[Stripe Check] Valid subscription found: ${validSubscription.id}, status=${validSubscription.status}, hasCreatorAccess=true`)
      
      return {
        hasCreatorAccess: true,
        status: validSubscription.status,
        periodEnd,
        subscriptionId: validSubscription.id,
      }
    }

    console.log(`[Stripe Check] No valid subscription found, hasCreatorAccess=false`)
    return defaultStatus
  } catch (err) {
    console.error("[Stripe Check] Failed to check Stripe subscription:", err)
    // If Stripe query fails, assume no access (fail secure)
    return defaultStatus
  }
}

/**
 * Update Firestore with latest Stripe subscription data (async, non-blocking)
 */
export async function syncStripeToFirestore(
  uid: string,
  subscriptionStatus: SubscriptionStatus
): Promise<void> {
  try {
    const updateData: any = {
      stripeStatus: subscriptionStatus.status,
      plan: subscriptionStatus.hasCreatorAccess ? "creator" : "free",
      usageLimitMonthly: subscriptionStatus.hasCreatorAccess ? 100 : 5,
      updatedAt: new Date(),
    }

    if (subscriptionStatus.subscriptionId) {
      updateData.stripeSubscriptionId = subscriptionStatus.subscriptionId
    }

    if (subscriptionStatus.periodEnd) {
      updateData.subscriptionPeriodEnd = Timestamp.fromDate(subscriptionStatus.periodEnd)
    } else {
      updateData.subscriptionPeriodEnd = null
    }

    await adminDb.collection("users").doc(uid).update(updateData)
  } catch (err) {
    console.error("Failed to sync Stripe data to Firestore:", err)
    // Don't throw - this is a background sync
  }
}
