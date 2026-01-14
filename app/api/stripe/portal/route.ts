import { getUserFromRequest } from "@/lib/auth-server"
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

  const { userDoc } = authed

  if (!userDoc.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe customer found for this user." },
      { status: 400 }
    )
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || ""

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userDoc.stripeCustomerId,
      return_url: `${origin}/usage`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err: any) {
    console.error("Stripe portal error:", err)
    return NextResponse.json(
      { error: err?.message || "Failed to create billing portal session" },
      { status: 500 }
    )
  }
}

