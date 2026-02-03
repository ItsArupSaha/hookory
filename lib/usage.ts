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

export async function incrementUsage(userId: string, amount: number = 1): Promise<void> {
  const userRef = adminDb.collection("users").doc(userId)

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

    // Reset if past reset date
    if (now >= resetAt) {
      usageCount = amount // Reset to just the current usage amount
      usageResetAt = getNextMonthStart()
    }

    transaction.update(userRef, {
      usageCount,
      usageResetAt: usageResetAt,
      lastGenerateAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    })
  })
}
