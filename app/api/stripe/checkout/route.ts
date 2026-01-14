import { getUserFromRequest } from "@/lib/auth-server"
import { adminDb } from "@/lib/firebase/admin"
import { stripe } from "@/lib/stripe"
import { NextRequest, NextResponse } from "next/server"

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
  const priceId = process.env.STRIPE_PRICE_ID_CREATOR
  if (!priceId) {
    return NextResponse.json(
      { error: "STRIPE_PRICE_ID_CREATOR is not set" },
      { status: 500 }
    )
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || ""

  try {
    let customerId = userDoc.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userDoc.email || undefined,
        metadata: {
          firebaseUid: uid,
        },
      })
      customerId = customer.id
      await adminDb.collection("users").doc(uid).update({
        stripeCustomerId: customerId,
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/usage?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/usage`,
      allow_promotion_codes: true,
      // Professional branding
      custom_text: {
        submit: {
          message: "You'll be redirected back to Hookory after payment.",
        },
      },
      metadata: {
        firebaseUid: uid,
        appName: "Hookory",
      },
      // Use custom domain if configured (set STRIPE_CUSTOM_DOMAIN env var)
      ...(process.env.STRIPE_CUSTOM_DOMAIN && {
        custom_domain: process.env.STRIPE_CUSTOM_DOMAIN,
      }),
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("Stripe checkout error:", err)
    return NextResponse.json(
      { error: err?.message || "Failed to create checkout session" },
      { status: 500 }
    )
  }
}

