import { generateLinkedInFormat, type LinkedInFormat } from "@/lib/ai"
import { getUserFromRequest } from "@/lib/auth-server"
import { computeCacheKey, getCachedOutput, setCachedOutput } from "@/lib/cache"
import { adminDb } from "@/lib/firebase/admin"
import { extractTextFromUrl } from "@/lib/url-extractor"
import { checkAndResetUsage, checkCooldown, incrementUsage } from "@/lib/usage"
import { Timestamp } from "firebase-admin/firestore"
import { NextRequest, NextResponse } from "next/server"

const MAX_INPUT_LENGTH_FREE = 5000
const MAX_INPUT_LENGTH_CREATOR = 10000

interface GenerateBody {
  inputType: "text" | "url"
  inputText?: string
  url?: string
  context?: {
    targetAudience?: string
    goal?: "engagement" | "leads" | "authority"
    style?: "thought-leader" | "storyteller" | "educator"
    emojiOn?: boolean
    tonePreset?: "professional" | "conversational" | "storytelling" | "educational"
  }
  formats: LinkedInFormat[]
  regenerate?: boolean
  saveHistory?: boolean
}

export async function POST(req: NextRequest) {
  const authed = await getUserFromRequest(req)
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { uid, userDoc } = authed

  if (!userDoc.emailVerified) {
    return NextResponse.json(
      { error: "Email not verified. Please verify your email to generate." },
      { status: 403 }
    )
  }

  let body: GenerateBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const {
    inputType,
    inputText: rawInputText,
    url,
    context = {},
    formats,
    regenerate = false,
    saveHistory = false,
  } = body

  if (!formats || !Array.isArray(formats) || formats.length === 0) {
    return NextResponse.json(
      { error: "At least one format must be selected." },
      { status: 400 }
    )
  }

  // Plan restrictions - Read from Firebase (source of truth, updated by webhooks)
  const planFromFirebase = userDoc.plan as "free" | "creator" | undefined
  const planExpiresAt = (userDoc.planExpiresAt as any)?.toDate?.() || userDoc.subscriptionPeriodEnd?.toDate() || null
  
  // Check if plan has expired
  const now = new Date()
  const isExpired = planExpiresAt ? planExpiresAt <= now : false
  
  // Determine if user has paid plan access
  const isPaid = planFromFirebase === "creator" && !isExpired
  const maxInputLength = isPaid ? MAX_INPUT_LENGTH_CREATOR : MAX_INPUT_LENGTH_FREE
  
  if (!isPaid) {
    if (inputType === "url") {
      return NextResponse.json(
        { error: "URL input is available on the Creator plan. Upgrade to unlock." },
        { status: 403 }
      )
    }
    // Allow tone presets for free users - it's just a UI preference
    // if (context.tonePreset) {
    //   return NextResponse.json(
    //     { error: "Tone presets are available on the Creator plan. Upgrade to unlock." },
    //     { status: 403 }
    //   )
    // }
    if (regenerate) {
      return NextResponse.json(
        { error: "Regenerate is available on the Creator plan. Upgrade to unlock." },
        { status: 403 }
      )
    }
  }

  // Cooldown
  const cooldown = await checkCooldown(uid)
  if (!cooldown.allowed) {
    return NextResponse.json(
      {
        error: "Cooldown active",
        secondsRemaining: cooldown.secondsRemaining,
      },
      { status: 429 }
    )
  }

  // Usage limits
  const usage = await checkAndResetUsage(uid)
  if (usage.usageCount >= usage.usageLimitMonthly) {
    return NextResponse.json(
      {
        error: "Monthly limit reached. Upgrade to increase your limit.",
        upgradeRequired: true,
      },
      { status: 402 }
    )
  }

  let finalInputText = ""

  try {
    if (inputType === "url") {
      if (!url) {
        return NextResponse.json({ error: "URL is required." }, { status: 400 })
      }
      try {
        finalInputText = await extractTextFromUrl(url)
      } catch (extractError: any) {
        console.error("URL extraction failed:", extractError)
        return NextResponse.json(
          { error: extractError.message || "Failed to extract content from URL. Please try copying the content directly." },
          { status: 400 }
        )
      }
    } else {
      if (!rawInputText || rawInputText.trim().length === 0) {
        return NextResponse.json({ error: "Input text is required." }, { status: 400 })
      }
      if (rawInputText.length > maxInputLength) {
        return NextResponse.json(
          { error: `Input too long. Maximum ${maxInputLength} characters for ${isPaid ? "Creator" : "Free"} plan. Upgrade to Creator plan for ${MAX_INPUT_LENGTH_CREATOR} characters.` },
          { status: 400 }
        )
      }
      finalInputText = rawInputText
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to process input." },
      { status: 400 }
    )
  }

  // Default targetAudience if empty
  const targetAudience = context.targetAudience?.trim() || "General LinkedIn users"
  
  const emojiOn = !!context.emojiOn
  // Default to professional tone if not provided
  const tonePreset = context.tonePreset || "professional"

  // Create resolved context with defaults for AI
  const resolvedContext = {
    ...context,
    targetAudience,
    tonePreset,
  }

  const outputs: Record<string, string> = {}
  const fromCache: Record<string, boolean> = {}

  for (const format of formats) {
    const cacheKey = computeCacheKey(
      finalInputText,
      resolvedContext,
      format,
      emojiOn,
      tonePreset
    )

    let output = await getCachedOutput(cacheKey)
    if (output) {
      outputs[format] = output
      fromCache[format] = true
      continue
    }

    try {
      output = await generateLinkedInFormat(format, finalInputText, resolvedContext, regenerate)
      outputs[format] = output
      fromCache[format] = false

      await setCachedOutput(
        cacheKey,
        output,
        "gemini"
      )
    } catch (err: any) {
      return NextResponse.json(
        { error: err?.message || "AI generation failed." },
        { status: 500 }
      )
    }
  }

  // Count this as one repurpose action (including regenerates)
  await incrementUsage(uid)

  // Optional history for paid users
  if (isPaid && saveHistory) {
    const jobRef = adminDb.collection("jobs").doc()
    const now = Timestamp.now()
    await jobRef.set({
      userId: uid,
      inputText: finalInputText.length > maxInputLength ? finalInputText.slice(0, maxInputLength) : finalInputText,
      context,
      formatsSelected: formats,
      outputs,
      createdAt: now,
    })
  }

  return NextResponse.json({
    outputs,
    fromCache,
  })
}

