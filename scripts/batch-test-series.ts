import { extractTextFromUrl } from "@/lib/url-extractor"
import { generateSeries, SeriesGenerationOptions } from "@/lib/ai/series"
import { GenerateContext, LinkedInFormat } from "@/lib/ai/index"
import * as fs from "fs"
import * as path from "path"
import dotenv from "dotenv"

// Load environment variables locally
dotenv.config({ path: ".env.local" })

// Test URLs
const URLS = [
    "https://medium.com/@karancodes0207/the-blockchains-blind-spot-what-is-the-oracle-problem-bdc76febfbe5",
    "https://blog.n8n.io/agentic-rag/",
    "https://ahrefs.com/blog/seo-content-strategy/",
]

// Pools for random context generation
const ANGLE_POOL = [
    "Key Insight",
    "Strategies",
    "Mistakes",
    "Future Trends",
    "Case Study"
]

const READER_POOL = [
    "Founders",
    "Engineers",
    "Marketers",
    "Investors",
    "Creators"
]

const TONE_POOL: Array<"professional" | "conversational" | "bold"> = [
    "professional",
    "conversational",
    "bold"
]

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomContext(): GenerateContext {
    return {
        angle: pickRandom(ANGLE_POOL),
        readerContext: pickRandom(READER_POOL),
        tonePreset: pickRandom(TONE_POOL),
        emojiOn: Math.random() > 0.5
    }
}

async function runSeriesBatch() {
    console.log(`🧪 Running SERIES VERIFICATION TEST (${URLS.length} URLs)...`)
    console.log("=".repeat(60))

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < URLS.length; i++) {
        const url = URLS[i]
        console.log(`\n${"=".repeat(60)}`)
        console.log(`Processing Series for: ${url}`)
        console.log("=".repeat(60))

        // Custom format assignments per user request
        let postFormats: [LinkedInFormat, LinkedInFormat, LinkedInFormat, LinkedInFormat];

        if (i === 0) {
            console.log("  👉 MODE: ALL MAIN-POST (Testing Argument Flow)")
            postFormats = ["main-post", "main-post", "main-post", "main-post"]
        } else if (i === 1) {
            console.log("  👉 MODE: ALL STORY-BASED (Testing Narrative Arc)")
            postFormats = ["story-based", "story-based", "story-based", "story-based"]
        } else {
            console.log("  👉 MODE: ALL SHORT-HOOKS (Testing Punchiness Continuity)")
            postFormats = ["short-viral-hook", "short-viral-hook", "short-viral-hook", "short-viral-hook"]
        }

        try {
            console.log("  ↳ Extracting content...")
            const inputText = await extractTextFromUrl(url)
            const context = getRandomContext()

            console.log(`  ↳ Context: ${context.angle} | ${context.readerContext} | ${context.tonePreset}`)

            const options: SeriesGenerationOptions = {
                inputText,
                context,
                postFormats
            }

            console.log(`  ↳ Generating 4x ${postFormats[0]} series...`)
            const posts = await generateSeries(options)

            if (posts.length !== 4) {
                console.warn(`  ⚠️ Warning: Expected 4 posts, got ${posts.length}`)
            }

            console.log("<<<SERIES_START>>>")
            console.log(`SOURCE: ${url}`)
            posts.forEach((post, index) => {
                console.log(`\n--- POST ${index + 1} (${postFormats[index].toUpperCase()}) ---`)
                console.log(post)
            })
            console.log("<<<SERIES_END>>>")

            successCount++
            console.log(`      ✅ Series Generated Successfully`)

        } catch (err: any) {
            failCount++
            console.error(`      ❌ Failed: ${err.message}`)
        }
    }

    console.log(`\n${"=".repeat(60)}`)
    console.log(`✅ Series Verification Complete`)
    console.log(`   Successful Series: ${successCount} | Failed: ${failCount}`)
    console.log("=".repeat(60))
}

runSeriesBatch().catch(console.error)
