import { Timestamp } from "firebase-admin/firestore"
import { adminDb } from "./firebase/admin"
import { getNextMonthStart } from "./utils"

export interface UserUsage {
  usageCount: number
  usageLimitMonthly: number
  usageResetAt: Timestamp
  lastGenerateAt?: Timestamp
}

// Plan-based cooldowns
const COOLDOWN_CREATOR = 30
const COOLDOWN_FREE = 45

export async function checkAndResetUsage(userId: string): Promise<UserUsage> {
  const userRef = adminDb.collection("users").doc(userId)

  return adminDb.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef)

    if (!userDoc.exists) {
      throw new Error("User not found")
    }

    const userData = userDoc.data() as any
    const now = new Date()

    // Determine the correct reset date based on plan
    let resetAt = userData.usageResetAt?.toDate() || getNextMonthStart()

    // For creators, align strictly with subscription billing cycle
    if (userData.plan === "creator" && userData.subscriptionPeriodEnd) {
      const subEnd = userData.subscriptionPeriodEnd.toDate()
      // If subscription end is in the future compared to current stored reset date, use it
      // This fixes the issue where reset was set to 1st of month but subscription ends later (e.g. 24th)
      if (subEnd > now) {
        resetAt = subEnd
      }
    }

    let usageCount = userData.usageCount || 0
    let usageResetAt = resetAt

    // Reset if past reset date
    if (now >= resetAt) {
      usageCount = 0

      // Calculate next reset date
      // If creator, we expect webhook to update subscriptionPeriodEnd. 
      // Fallback to next month start if no future sub date available yet.
      usageResetAt = getNextMonthStart()

      transaction.update(userRef, {
        usageCount: 0,
        usageResetAt: usageResetAt,
      })
    } else {
      // If we corrected the reset date (e.g. alignment fix), ensure DB is updated
      if (resetAt.getTime() !== (userData.usageResetAt?.toDate().getTime())) {
        usageResetAt = resetAt
        transaction.update(userRef, { usageResetAt })
      }
    }

    return {
      usageCount,
      usageLimitMonthly: userData.usageLimitMonthly || 5,
      usageResetAt: Timestamp.fromDate(usageResetAt),
      lastGenerateAt: userData.lastGenerateAt,
    }
  })
}

export async function checkCooldown(userId: string): Promise<{ allowed: boolean; secondsRemaining: number }> {
  const userDoc = await adminDb.collection("users").doc(userId).get()

  if (!userDoc.exists) {
    return { allowed: true, secondsRemaining: 0 }
  }

  const userData = userDoc.data() as any
  const lastGenerateAt = userData.lastGenerateAt?.toDate()

  if (!lastGenerateAt) {
    return { allowed: true, secondsRemaining: 0 }
  }

  // Use plan-based cooldown
  const plan = userData.plan || "free"
  const cooldownSeconds = plan === "creator" ? COOLDOWN_CREATOR : COOLDOWN_FREE

  const now = new Date()
  const secondsSince = Math.floor((now.getTime() - lastGenerateAt.getTime()) / 1000)
  const secondsRemaining = cooldownSeconds - secondsSince

  return {
    allowed: secondsRemaining <= 0,
    secondsRemaining: Math.max(0, secondsRemaining),
  }
}

import { getUsageLimitEmailTemplate, getUsageWarningEmailTemplate } from "./emails/usage-alerts"
import { sendEmail } from "./email"

export async function incrementUsage(userId: string, amount: number = 1): Promise<void> {
  const userRef = adminDb.collection("users").doc(userId)

  // Track if we need to send an email after transaction commits
  let emailTask: (() => Promise<void>) | null = null

  await adminDb.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef)

    if (!userDoc.exists) {
      throw new Error("User not found")
    }

    const userData = userDoc.data() as any
    const now = new Date()

    // Determine the correct reset date based on plan
    let resetAt = userData.usageResetAt?.toDate() || getNextMonthStart()

    // For creators, align strictly with subscription billing cycle
    if (userData.plan === "creator" && userData.subscriptionPeriodEnd) {
      const subEnd = userData.subscriptionPeriodEnd.toDate()
      if (subEnd > now) {
        resetAt = subEnd
      }
    }

    let usageCount = (userData.usageCount || 0) + amount
    let usageResetAt = resetAt

    // Check for resets
    if (now >= resetAt) {
      usageCount = amount
      usageResetAt = getNextMonthStart()

      // Reset email flags on monthly reset
      transaction.update(userRef, {
        usageCount,
        usageResetAt: usageResetAt,
        lastGenerateAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        usageWarningEmailSent: false, // Reset flag
        usageLimitEmailSent: false,   // Reset flag
      })
      return
    }

    const usageLimit = userData.usageLimitMonthly || 5 // Default free limit
    const warningThreshold = Math.floor(usageLimit * 0.8)

    let updateData: any = {
      usageCount,
      usageResetAt: usageResetAt,
      lastGenerateAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.now(),
    }

    // Alert Logic
    const email = userData.email
    const displayName = userData.displayName || "Creator"

    // 80% Warning
    if (usageCount >= warningThreshold && usageCount < usageLimit) {
      if (!userData.usageWarningEmailSent) {
        updateData.usageWarningEmailSent = true
        // Queue email task
        emailTask = async () => {
          console.log(`[Usage] Sending 80% warning to ${email}`)
          await sendEmail({
            to: email,
            subject: "Heads Up: You've used 80% of your limit",
            html: getUsageWarningEmailTemplate(displayName, usageLimit)
          })
        }
      }
    }

    // 100% Limit
    if (usageCount >= usageLimit) {
      if (!userData.usageLimitEmailSent) {
        updateData.usageLimitEmailSent = true
        // Queue email task
        emailTask = async () => {
          console.log(`[Usage] Sending 100% limit alert to ${email}`)
          await sendEmail({
            to: email,
            subject: "Action Required: Monthly Limit Reached",
            html: getUsageLimitEmailTemplate(displayName)
          })
        }
      }
    }

    transaction.update(userRef, updateData)
  })

  // Execute side effect after successful commit
  if (emailTask) {
    try {
      await (emailTask as any)()
    } catch (err) {
      console.error("Failed to send usage alert email:", err)
      // Process continues - email failure shouldn't block user flow
    }
  }
}
