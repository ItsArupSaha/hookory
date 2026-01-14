import { createHash } from "crypto"
import { adminDb } from "./firebase/admin"

export interface CacheEntry {
  cacheKey: string
  outputText: string
  provider: string
  createdAt: FirebaseFirestore.Timestamp
}

export function computeCacheKey(
  inputText: string,
  context: any,
  formatType: string,
  emojiOn: boolean,
  tonePreset?: string
): string {
  const data = JSON.stringify({
    input: inputText,
    context,
    format: formatType,
    emoji: emojiOn,
    tone: tonePreset || "",
  })
  return createHash("sha256").update(data).digest("hex")
}

export async function getCachedOutput(cacheKey: string): Promise<string | null> {
  try {
    const cacheDoc = await adminDb.collection("cache").doc(cacheKey).get()
    
    if (!cacheDoc.exists) {
      return null
    }

    const data = cacheDoc.data() as CacheEntry
    const createdAt = data.createdAt.toDate()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Check if cache is still valid (30 days)
    if (createdAt < thirtyDaysAgo) {
      // Delete expired cache
      await adminDb.collection("cache").doc(cacheKey).delete()
      return null
    }

    return data.outputText
  } catch (error) {
    console.error("Cache read error:", error)
    return null
  }
}

export async function setCachedOutput(
  cacheKey: string,
  outputText: string,
  provider: string
): Promise<void> {
  try {
    await adminDb.collection("cache").doc(cacheKey).set({
      cacheKey,
      outputText,
      provider,
      createdAt: new Date(),
    })
  } catch (error) {
    console.error("Cache write error:", error)
    // Don't throw - caching is non-critical
  }
}
