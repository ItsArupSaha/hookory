import { Timestamp } from "firebase-admin/firestore"
import { adminDb } from "./firebase/admin"
import { getNextMonthStart } from "./utils"

export interface UserUsage {
  usageCount: number
  usageLimitMonthly: number
  usageResetAt: Timestamp
  lastGenerateAt?: Timestamp
}

const COOLDOWN_SECONDS = 45

export async function checkAndResetUsage(userId: string): Promise<UserUsage> {
  const userRef = adminDb.collection("users").doc(userId)
  
  return adminDb.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef)
    
    if (!userDoc.exists) {
      throw new Error("User not found")
    }

    const userData = userDoc.data() as any
    const now = new Date()
    const resetAt = userData.usageResetAt?.toDate() || getNextMonthStart()

    let usageCount = userData.usageCount || 0
    let usageResetAt = resetAt

    // Reset if past reset date
    if (now >= resetAt) {
      usageCount = 0
      usageResetAt = getNextMonthStart()
      
      transaction.update(userRef, {
        usageCount: 0,
        usageResetAt: usageResetAt,
      })
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

  const now = new Date()
  const secondsSince = Math.floor((now.getTime() - lastGenerateAt.getTime()) / 1000)
  const secondsRemaining = COOLDOWN_SECONDS - secondsSince

  return {
    allowed: secondsRemaining <= 0,
    secondsRemaining: Math.max(0, secondsRemaining),
  }
}

export async function incrementUsage(userId: string): Promise<void> {
  const userRef = adminDb.collection("users").doc(userId)
  
  await adminDb.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef)
    
    if (!userDoc.exists) {
      throw new Error("User not found")
    }

    const userData = userDoc.data() as any
    const now = new Date()
    const resetAt = userData.usageResetAt?.toDate() || getNextMonthStart()

    let usageCount = (userData.usageCount || 0) + 1
    let usageResetAt = resetAt

    // Reset if past reset date
    if (now >= resetAt) {
      usageCount = 1
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
