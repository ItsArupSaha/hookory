import { adminDb } from "@/lib/firebase/admin"
import { stripe } from "@/lib/stripe"
import { Timestamp } from "firebase-admin/firestore"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

async function handleSubscriptionChange(subscription: any) {
  const customerId = subscription.customer as string
  const status = subscription.status as string
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null
  const currentPeriodStart = subscription.current_period_start
    ? new Date(subscription.current_period_start * 1000)
    : null

  console.log("Webhook: handleSubscriptionChange", {
    subscriptionId: subscription.id,
    customerId,
    status,
    currentPeriodStart: currentPeriodStart?.toISOString(),
    currentPeriodEnd: currentPeriodEnd?.toISOString(),
  })

  const usersSnap = await adminDb
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get()

  if (usersSnap.empty) {
    console.warn("Webhook: No user found with customerId:", customerId)
    // Try to find by customer metadata (fallback)
    try {
      const customer = await stripe.customers.retrieve(customerId)
      if (customer && typeof customer === "object" && "metadata" in customer) {
        const firebaseUid = (customer as any).metadata?.firebaseUid
        if (firebaseUid) {
          console.log("Webhook: Found user via metadata firebaseUid:", firebaseUid)
          const userRef = adminDb.collection("users").doc(firebaseUid)
          const userDoc = await userRef.get()
          if (userDoc.exists) {
            // Update the user's customer ID if missing
            if (!userDoc.data()?.stripeCustomerId) {
              await userRef.update({ stripeCustomerId: customerId })
            }
            // Check if subscription is still valid
            // - Active, trialing, past_due: always valid
            // - Canceled: valid only if period hasn't ended yet (user paid for the period)
            const now = new Date()
            const isActive =
              status === "active" ||
              status === "trialing" ||
              status === "past_due" ||
              (status === "canceled" && currentPeriodEnd && currentPeriodEnd > now)

            await userRef.update({
              stripeSubscriptionId: subscription.id,
              stripeStatus: status,
              plan: isActive ? "creator" : "free",
              usageLimitMonthly: isActive ? 100 : 5,
              subscriptionPeriodStart: currentPeriodStart ? Timestamp.fromDate(currentPeriodStart) : null,
              subscriptionPeriodEnd: currentPeriodEnd ? Timestamp.fromDate(currentPeriodEnd) : null,
              planStartsAt: currentPeriodStart ? Timestamp.fromDate(currentPeriodStart) : null,
              planExpiresAt: currentPeriodEnd ? Timestamp.fromDate(currentPeriodEnd) : null,
              updatedAt: Timestamp.now(),
            })
            console.log("Webhook: User updated via metadata fallback")
            return
          }
        }
      }
    } catch (err) {
      console.error("Webhook: Error in metadata fallback:", err)
    }
    return
  }

  const userRef = usersSnap.docs[0].ref
  console.log("Webhook: Updating user", usersSnap.docs[0].id, "subscription status:", status)

  // Check if subscription is still valid
  // - Active, trialing, past_due: always valid
  // - Canceled: valid only if period hasn't ended yet (user paid for the period)
  //   This handles both:
  //   1. Cancel at period end (default): current_period_end stays as Feb 13, access continues
  //   2. Cancel immediately: current_period_end set to now/past, access ends immediately
  const now = new Date()
  const isActive =
    status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    (status === "canceled" && currentPeriodEnd && currentPeriodEnd > now)

  await userRef.update({
    stripeSubscriptionId: subscription.id,
    stripeStatus: status,
    plan: isActive ? "creator" : "free",
    usageLimitMonthly: isActive ? 100 : 5,
    subscriptionPeriodStart: currentPeriodStart ? Timestamp.fromDate(currentPeriodStart) : null,
    subscriptionPeriodEnd: currentPeriodEnd ? Timestamp.fromDate(currentPeriodEnd) : null,
    planStartsAt: currentPeriodStart ? Timestamp.fromDate(currentPeriodStart) : null,
    planExpiresAt: currentPeriodEnd ? Timestamp.fromDate(currentPeriodEnd) : null,
    updatedAt: Timestamp.now(),
  })
  
  console.log("Webhook: User updated successfully")
}

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
  }

  const sig = req.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook configuration missing" },
      { status: 500 }
    )
  }

  const rawBody = await req.text()

  let event: any
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    console.error("Stripe webhook verification failed:", err?.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        console.log("Webhook: checkout.session.completed", {
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
        })
        
        if (session.customer && session.subscription) {
          const customerId = session.customer as string
          const subscriptionId = session.subscription as string
          
          // Fetch subscription to get period start and end dates
          let subscriptionPeriodStart: Date | null = null
          let subscriptionPeriodEnd: Date | null = null
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            subscriptionPeriodStart = subscription.current_period_start
              ? new Date(subscription.current_period_start * 1000)
              : null
            subscriptionPeriodEnd = subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : null
          } catch (err) {
            console.error("Webhook: Failed to fetch subscription:", err)
          }
          const usersSnap = await adminDb
            .collection("users")
            .where("stripeCustomerId", "==", customerId)
            .limit(1)
            .get()

          if (usersSnap.empty) {
            console.warn("Webhook: No user found with customerId:", customerId)
            // Try to find by customer metadata (fallback)
            try {
              const customer = await stripe.customers.retrieve(customerId)
              if (customer && typeof customer === "object" && "metadata" in customer) {
                const firebaseUid = (customer as any).metadata?.firebaseUid
                if (firebaseUid) {
                  console.log("Webhook: Found user via metadata firebaseUid:", firebaseUid)
                  const userRef = adminDb.collection("users").doc(firebaseUid)
                  const userDoc = await userRef.get()
                  if (userDoc.exists) {
                    // Update the user's customer ID if missing
                    if (!userDoc.data()?.stripeCustomerId) {
                      await userRef.update({ stripeCustomerId: customerId })
                    }
                    await userRef.update({
                      stripeSubscriptionId: subscriptionId,
                      stripeStatus: "active",
                      plan: "creator",
                      usageLimitMonthly: 100,
                      subscriptionPeriodStart: subscriptionPeriodStart ? Timestamp.fromDate(subscriptionPeriodStart) : null,
                      subscriptionPeriodEnd: subscriptionPeriodEnd ? Timestamp.fromDate(subscriptionPeriodEnd) : null,
                      planStartsAt: subscriptionPeriodStart ? Timestamp.fromDate(subscriptionPeriodStart) : null,
                      planExpiresAt: subscriptionPeriodEnd ? Timestamp.fromDate(subscriptionPeriodEnd) : null,
                      updatedAt: Timestamp.now(),
                    })
                    console.log("Webhook: User updated via metadata fallback")
                    break
                  }
                }
              }
            } catch (err) {
              console.error("Webhook: Error in metadata fallback:", err)
            }
          } else {
            const userDoc = usersSnap.docs[0]
            console.log("Webhook: Updating user", userDoc.id, "to creator plan")
            await userDoc.ref.update({
              stripeSubscriptionId: subscriptionId,
              stripeStatus: "active",
              plan: "creator",
              usageLimitMonthly: 100,
              subscriptionPeriodStart: subscriptionPeriodStart ? Timestamp.fromDate(subscriptionPeriodStart) : null,
              subscriptionPeriodEnd: subscriptionPeriodEnd ? Timestamp.fromDate(subscriptionPeriodEnd) : null,
              planStartsAt: subscriptionPeriodStart ? Timestamp.fromDate(subscriptionPeriodStart) : null,
              planExpiresAt: subscriptionPeriodEnd ? Timestamp.fromDate(subscriptionPeriodEnd) : null,
              updatedAt: Timestamp.now(),
            })
            console.log("Webhook: User updated successfully")
          }
        }
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object
        await handleSubscriptionChange(subscription)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object
        const customerId = invoice.customer as string
        const usersSnap = await adminDb
          .collection("users")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get()
        if (!usersSnap.empty) {
          const userRef = usersSnap.docs[0].ref
          const userDoc = await userRef.get()
          const userData = userDoc.data()
          const now = new Date()
          
          // If subscription period has ended, downgrade to free
          const subscriptionPeriodEnd = userData?.subscriptionPeriodEnd?.toDate()
          const shouldDowngrade = !subscriptionPeriodEnd || subscriptionPeriodEnd <= now
          
          await userRef.update({
            stripeStatus: "past_due",
            plan: shouldDowngrade ? "free" : userData?.plan || "free",
            usageLimitMonthly: shouldDowngrade ? 5 : (userData?.usageLimitMonthly || 5),
            updatedAt: Timestamp.now(),
          })
        }
        break
      }

      case "invoice.paid": {
        const invoice = event.data.object
        const subscriptionId = invoice.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        await handleSubscriptionChange(subscription)
        break
      }

      default:
        // Ignore other events
        break
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err)
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

