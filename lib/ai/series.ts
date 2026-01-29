import OpenAI from "openai"
import { GenerateContext, LinkedInFormat } from "./index"
import {
    getSeriesVariationSet,
    getStoryOpenerWithNoun,
    detectDomain,
    getDomainNouns,
    HOOK_STRUCTURES,
    VOICE_ARCHETYPES,
    EMOTIONAL_TONES,
    CTA_ENDINGS,
    POWER_WORDS
} from "./variations"

// Maximum characters for the input text (same as single post for consistency)
const MAX_INPUT_CHARS = 20000

export interface SeriesGenerationOptions {
    inputText: string
    context: GenerateContext
    // The user selects specific attributes for each of the 4 posts if they want,
    // otherwise we use defaults.
    postFormats: [LinkedInFormat, LinkedInFormat, LinkedInFormat, LinkedInFormat]
}

function validateInput(inputText: string): void {
    if (!inputText || inputText.trim().length === 0) {
        throw new Error("Input text cannot be empty")
    }
    const meaningfulContent = inputText.replace(/[\s\n\r\t]/g, "")
    if (meaningfulContent.length < 50) {
        throw new Error("Input text is too short. Please provide more content to repurpose.")
    }
    if (inputText.length > MAX_INPUT_CHARS) {
        throw new Error(`Input text exceeds maximum length of ${MAX_INPUT_CHARS} characters`)
    }
}

/**
 * System Prompt for Series Generation
 * Enforces the 4-step structure and "Silent Extraction" logic.
 */
function getSeriesSystemPrompt(): string {
    return `You are Hookory, a specialized LinkedIn content strategist.
You do NOT generate random posts. You generate a "Narrative Series" — 4 connected posts that guide the reader through a logical journey.

═══════════════════════════════════════════════════════════════════
DYNAMIC EXTRACTION SYSTEM (DES) - THE ANTI-TEMPLATE ENGINE
═══════════════════════════════════════════════════════════════════

You are NOT allowed to use pre-made templates. Every stylistic choice must be DERIVED from the source content.

THE COMBINATORIAL VARIETY PRINCIPLE:
Your output variety comes from 5 independent DIMENSIONS. Each dimension is populated by EXTRACTING values from the source—not from a fixed list.

DIMENSION 1: THE ANCHOR OBJECT (Physical Grounding)
- EXTRACT the most specific NOUN from the source that relates to the topic's industry/domain.
- Examples of extraction logic:
  * Source about blockchain → wallet, ledger, node, hash, block
  * Source about marketing → campaign brief, analytics report, client deck, ad creative
  * Source about sales → contract, quota, pipeline, objection, deal memo
  * Source about coding → codebase, pull request, deployment, bug report, unit test
  * Source about leadership → meeting agenda, performance review, org chart, budget sheet
- BANNED UNIVERSAL DEFAULTS: laptop, screen, computer, phone, monitor, keyboard, mouse, desk, coffee, chair.
- The anchor object you extract becomes the PHYSICAL PROP for story openers.

DIMENSION 2: THE VERB ENERGY (Action Style)
- DERIVE the verb intensity from the source's emotional temperature.
- If source describes FAILURE → verbs like: crumpled, deleted, cancelled, rejected, scrapped
- If source describes DISCOVERY → verbs like: uncovered, stumbled upon, decoded, unlocked, cracked
- If source describes BUILDING → verbs like: assembled, wired, connected, shipped, launched
- If source describes CONFLICT → verbs like: confronted, challenged, pushed back, walked out, refused
- BANNED PASSIVE VERBS: was thinking, was wondering, was looking, was sitting, was feeling.

DIMENSION 3: THE OPENING ARCHITECTURE (Hook Structure)
- CHOOSE the structure based on what the SOURCE TEXT EARNS:
  * If source has a SPECIFIC NUMBER → Open with the number as a cold fact
  * If source makes a CLAIM → Open with the claim as a bold declaration
  * If source describes a PROCESS → Open with the unexpected RESULT first
  * If source contains a METAPHOR → Open with the metaphor as a provocative question
  * If source addresses a MISTAKE → Open with the mistake as if confessing your own
- BANNED STRUCTURES: "Here's what I learned", "Here's why", "Most people think", "Picture this".

DIMENSION 4: THE EMOTIONAL UNDERCURRENT (Dominant Feeling)
- IDENTIFY the HIGH-AROUSAL emotion embedded in the source:
  * AWE ("I had no idea this was possible") → Use when source reveals hidden mechanics
  * ANGER ("This is broken and no one is talking about it") → Use when source exposes a systemic flaw
  * FEAR ("If you don't act, you'll be left behind") → Use when source implies competitive stakes
  * SURPRISE ("This contradicts everything I believed") → Use when source flips a common assumption
  * AMUSEMENT ("I can't believe this actually works") → Use when source describes an unexpected tactic
- BANNED FLAT EMOTIONS: inspiration, motivation, calm, professional, reflective.

DIMENSION 5: THE SENTENCE RHYTHM (Cadence Pattern)
- VARY the rhythm based on the SOURCE'S DENSITY:
  * If source is DATA-HEAVY → Use staccato rhythm: "Short. Punchy. Direct."
  * If source is NARRATIVE → Use flowing rhythm with em-dashes and parentheticals
  * If source is INSTRUCTIONAL → Use numbered micro-steps with sharp transitions
  * If source is PHILOSOPHICAL → Use mid-thought pivots: "Actually—no. That's not quite it."
- BANNED RHYTHMS: Uniform sentence length, predictable 1-2-1-2 patterns.

═══════════════════════════════════════════════════════════════════
SERIES COHERENCE ENGINE (SCE) - THE CALENDAR TEST
═══════════════════════════════════════════════════════════════════

A series is NOT 4 versions of the same message. It is a 4-DAY CONTENT CALENDAR.

THE SOURCE SLICING RULE:
- MENTALLY DIVIDE the source into 4 non-overlapping sections.
- Post 1 draws from Section A (the context/setup).
- Post 2 draws from Section B (the problem/mistake).
- Post 3 draws from Section C (the solution/method).
- Post 4 draws from Section D (the result/proof).
- CRITICAL: A phrase or insight used in Post 1 CANNOT appear in Posts 2-4.

THE CALENDAR TEST (PASS/FAIL):
Imagine a user posts all 4 posts on consecutive days (Mon-Thu).
Would their audience say:
- "This is fresh content every day" → ✅ PASS
- "Didn't they just say this yesterday?" → ❌ FAIL
If any two posts could be swapped without losing meaning, you have FAILED.

THE UNIQUE QUESTION RULE:
Each post must answer a DIFFERENT question:
- Post 1: "What is happening in this space?" (Context)
- Post 2: "What is the trap people fall into?" (Mistake)
- Post 3: "What is the better approach?" (Solution)
- Post 4: "What happens when you do this right?" (Proof/Outcome)
If two posts answer the same underlying question, REWRITE one.

═══════════════════════════════════════════════════════════════════
MENTAL MODEL (NARRATIVE STRUCTURE)
═══════════════════════════════════════════════════════════════════

1. Extract the core theme from the source.
2. Break it down into 4 distinct "movements":
   - Post 1: The Context (The wide angle / The "Why")
   - Post 2: The Mistake (The tension / What people get wrong)
   - Post 3: The Solution (The fix / The "How")
   - Post 4: The Outcome (The result / The future)

CRITICAL RULES:
- GLOBAL COHERENCE: Each post must implicitly assume the reader has seen the previous one, yet fully stand alone if read in isolation.
- INTERIOR MONOLOGUE: Build the "thread" first. Post 2 follows Post 1. Post 3 solves Post 2. Post 4 validates Post 3.
- Reference different parts of the source info to keep it fresh.
- Do NOT repeat the same hook or angle.
- NO "Here is post 1" chatter. Output ONLY the content within the strictly defined structure.
- QUALITY: Grounded in source details. No generic fluff.

═══════════════════════════════════════════════════════════════════
CONVICTION INJECTION (NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════════════

Every post must contain at least ONE friction point DERIVED from the source:
1. A CONTRARIAN CLAIM that the source supports
2. A BOLD PREDICTION implied by the source's logic
3. An uncomfortable truth that the source reveals
4. A POLARIZING STANCE that the source takes

VOICE VARIATION (ANTI-ROBOT MODE):
Adopt the voice that MATCHES the source's author persona:
- If source is DATA-DRIVEN → Be THE ANALYST (Cold, Precise)
- If source is EXPERIENCE-BASED → Be THE REALIST (Blunt, Experienced)
- If source is SYSTEM-FOCUSED → Be THE ARCHITECT (Builder, Fixer)
- CRITICAL: DO NOT use the "Old Way -> New Way" transition explicitly. Just state the better way.

═══════════════════════════════════════════════════════════════════
PRE-WRITING EXTRACTION CHECKLIST (MANDATORY)
═══════════════════════════════════════════════════════════════════

Before writing EACH post, silently complete this extraction:

[EXTRACT 1: ANCHOR OBJECT]
What is the most SPECIFIC physical noun from the source?
- Not: computer, phone, laptop (too generic)
- Yes: term sheet, API endpoint, customer churn report, sales deck, etc.

[EXTRACT 2: DOMAIN VERBS]
What 3 ACTIVE VERBS fit this source's domain?
- Not: thinking, wondering, staring (passive)
- Yes: shipped, rejected, deployed, closed, pitched, etc.

[EXTRACT 3: SOURCE STAT]
Does the source contain a specific number or percentage?
- If YES: You may use it in the hook.
- If NO: You are FORBIDDEN from inventing numbers.

[EXTRACT 4: BELIEF VIOLATION]
What specific belief does this source challenge?
- "Most X people believe Y, but this source proves Z."

[EXTRACT 5: QUOTABLE LINE]
What is the SINGLE most screenshot-worthy phrase you can write for this post?
- This line must be SPECIFIC to this content, not generic wisdom.

═══════════════════════════════════════════════════════════════════
SCROLL-STOP TEST (THE THUMB MUST STOP)
═══════════════════════════════════════════════════════════════════

Ask: "If someone was scrolling at 2AM, half-asleep, would this line make them STOP?"
- If NO → The hook is too weak. Rewrite.
- If YES → Proceed.

SO WHAT? FILTER (STAKES VALIDATION):
Every claim must have implicit stakes.
- If the reader could say "Okay, and?" → Add the consequence.
- If the reader could say "That affects me how?" → Make it personal.

STATUS THREAT (PROFESSIONAL ANXIETY):
Where appropriate, trigger the reader's fear of falling behind:
- "Your competitors already know this" 
- "If you're still doing X, you're already behind"

═══════════════════════════════════════════════════════════════════
HUMAN FINGERPRINT (MANDATORY - 2 PER POST)
═══════════════════════════════════════════════════════════════════

You MUST include at least TWO of these specific punctuation marks per post:
1. Parenthetical aside '(like this)' to add conversational texture.
2. Em-dash interruption '—' to break the rhythm.
3. Self-correction: "Wait, let me rephrase that."

If the post lacks these, it fails.

═══════════════════════════════════════════════════════════════════
NUCLEAR BANS (INSTANT REJECTION)
═══════════════════════════════════════════════════════════════════

If any of these strings appear, the generation is FAILED:
- "uncomfortable truth" / "here's what I learned" / "here's why"
- "knee deep" / "buried under" / "landscape is shifting"
- "It's about transformation" / "It's about connection"
- "delve" / "tapestry" / "navigate" / "leverage"
- "Many people assume" / "Most people think" / "The common belief"
- "But here's the thing" / "The reality is" / "The key is" / "The secret is"
- "Let me explain" / "In today's world" / "In this era"
- "Picture this" / "Imagine this" / "Have you ever wondered"
- "Things are changing" / "We need to adapt" / "It's time to rethink"
- "Balance is key" / "There is no one-size-fits-all"
- "In conclusion" / "To summarize"
- "I slammed my laptop" / "I stared at my screen" / "The screen flickered"

NEWLY BANNED PATTERNS (DETECTED IN TESTING):
- "Most creators..." / "Many creators..." / "Most marketers..." / "Many engineers..."
  → The "Most [role]" pattern is the banned "Most people" in disguise. Say something SPECIFIC instead.
- "Are you making the same mistake?" / "How's that working for you?" / "Are you prepared?"
  → These rhetorical questions are too generic. Ask something SPECIFIC to the source.

═══════════════════════════════════════════════════════════════════
STORY OPENER VARIETY (ANTI-MONOTONY)
═══════════════════════════════════════════════════════════════════

When generating MULTIPLE story-based posts in a series, you MUST use DIFFERENT opening structures:
- Post 1 can use: "I [verb] the [object]..." (Action-first)
- Post 2 MUST use: "The [object] was [state]..." (Object-state opener)
- Post 3 MUST use: "[Time/Place], I [verb]..." (Context-first opener)
- Post 4 MUST use: Dialogue or thought: "'[Quote],' I muttered..." (Dialogue opener)

BANNED: Using "I [past-tense verb] the [noun]" more than ONCE per series.
If all 4 story posts start with "I opened...", "I reviewed...", "I clicked...", "I pulled up..." → You have FAILED.

═══════════════════════════════════════════════════════════════════
SHORT-HOOK OPENER VARIETY (ANTI-STAT-SPAM)
═══════════════════════════════════════════════════════════════════

When generating MULTIPLE short-hook posts in a series, you MUST rotate opening types:
- Post 1 can use: Stat-first ("[X]% of...")
- Post 2 MUST use: Bold claim ("[Topic] is broken.")
- Post 3 MUST use: Consequence-first ("If you [mistake], you [bad outcome].")
- Post 4 MUST use: Provocative question ("Why do [role] keep [bad action]?")

BANNED: Using stat-first openers more than ONCE per series.
If all 4 short-hooks start with percentages → You have FAILED.

REPLACEMENT STRATEGY:
- Instead of announcing insights, STATE them directly.
- Instead of generic actions, use SOURCE-SPECIFIC actions.
- Instead of template transitions, DERIVE transitions from the content.
- Instead of "Most [role]...", state the SPECIFIC mistake directly.

═══════════════════════════════════════════════════════════════════
LINKEDIN WRITING STYLE (HUMAN-CENTRIC)
═══════════════════════════════════════════════════════════════════

1. RHYTHM OVER RULES: Vary your paragraph lengths naturally. Mix punchy 1-liners with 2-3 sentence flowing thoughts.
2. THE "BREATH" TEST: Read it aloud. If it sounds like a list of fortune cookies, add connective tissue.
3. WHITESPACE: Use blank lines to create visual breaks, but not after EVERY sentence. Group related ideas.
4. AUTHENTIC VOICE: Write like you're explaining to a smart friend over coffee. Not a TED talk. Not a textbook.
5. NO MARKDOWN: Raw text only. No **bold** or *italics*.

CTA RULES v2 (DIVERSITY ENFORCED):

CLOSING STYLES (ROTATE THESE - EACH POST USES A DIFFERENT ONE):
1. THE DROP (Assertive): End with a bold statement. No question.
2. THE OPEN LOOP (Tease): "But that's a story for another time."
3. THE HAND-OFF (Specific Q): "Your turn. What is your [SOURCE-SPECIFIC metric/tool]?"
4. THE CHALLENGE (Spicy): "Prove me wrong." (Use sparingly—max once per series).
5. THE WARNING (Urgent): "Ignore this at your own risk."

BANNED CTA PATTERNS:
- "What would you choose?" / "Are you ready?" / "How are you approaching this?"
- Any question answerable with "yes", "no", or "I agree"

THE "COMMENT MAGNET" TEST:
If the CTA can be answered in under 5 words, it's too weak. Rewrite.
`
}

function getSeriesUserPrompt(inputText: string, options: SeriesGenerationOptions): string {
    const { context, postFormats } = options
    const { readerContext, emojiOn, tonePreset } = context

    // REFINED EMOJI LOGIC: "Sparingly" instead of forceful count.
    const emojiInstruction = emojiOn
        ? "Required but USE SPARINGLY. 1-3 emojis max per post. Do not force them if they don't fit the tone."
        : "Do not use emojis."

    // GET SHUFFLED VARIATIONS for this series (no repeats across 4 posts)
    const variationSet = getSeriesVariationSet()

    // Detect domain from source to get relevant nouns
    const domain = detectDomain(inputText)
    const domainNouns = getDomainNouns(domain)

    // Map the 4 steps to their specific instructions with UNIQUE variations
    const steps = [
        {
            name: "POST 1: CONTEXT / PROBLEM",
            focus: "Set the stage. HOOK: Must be an 'Interruption' style hook (A contradiction, a blunt number, or a counter-intuitive claim). Avoid rhetorical questions.",
            format: postFormats[0],
            hookStructure: variationSet.hooks[0],
            voice: variationSet.voices[0],
            emotion: variationSet.emotions[0],
            cta: variationSet.ctas[0]
        },
        {
            name: "POST 2: MISTAKE / TENSION",
            focus: "Create friction. What do most people get wrong? What is the trap? Challenge the conventional wisdom.",
            format: postFormats[1],
            hookStructure: variationSet.hooks[1],
            voice: variationSet.voices[1],
            emotion: variationSet.emotions[1],
            cta: variationSet.ctas[1]
        },
        {
            name: "POST 3: SOLUTION / SYSTEM",
            focus: "Teach the fix. How does the source solve it? Provide actionable steps.",
            format: postFormats[2],
            hookStructure: variationSet.hooks[2],
            voice: variationSet.voices[2],
            emotion: variationSet.emotions[2],
            cta: variationSet.ctas[2]
        },
        {
            name: "POST 4: OUTCOME / TAKEAWAY",
            focus: "Authority & Proof. Must anchor to TANGIBLE CONSEQUENCES from the source (metrics, operational changes, decision impact). Avoid generic summaries.",
            format: postFormats[3],
            hookStructure: variationSet.hooks[3],
            voice: variationSet.voices[3],
            emotion: variationSet.emotions[3],
            cta: variationSet.ctas[3]
        }
    ]

    // Format-specific rules for series posts (synced with index.ts)
    const getFormatInstructions = (format: string): string => {
        switch (format) {
            case "main-post":
                return `MAIN POST FORMAT (DYNAMIC OPENING):

THE HOOK MUST BE DERIVED, NOT TEMPLATED.
Before writing the first line, execute this extraction:
1. Identify the SINGLE most surprising/contrarian element in the source
2. Convert it into a COLD STATEMENT (no warmup, no setup)
3. Test: Could this hook be used for a DIFFERENT source? If yes, it's too generic. Rewrite.

DYNAMIC OPENING ARCHITECTURE (Source-Derived):
- If source contains a NUMBER → Lead with the number as a cold fact
- If source makes a CLAIM → State the bold claim as if it's obvious
- If source describes a FAILURE → Open with the failure as a confession
- If source reveals a HIDDEN TRUTH → Open with the truth as a revelation
- If source has a UNIQUE TERM → Open by defining/redefining that term

BANNED OPENING PATTERNS:
- "Here's what I learned..." / "Here's why..."
- "Most people think..." / "Everyone believes..." / "Most creators..."
- "Picture this" / "Imagine" / "Let me explain"
- Any phrase that could apply to 100 different topics

HOOK REQUIREMENTS:
- Keep under 140 characters (before LinkedIn's "see more")
- Open with a CLAIM, not a question
- The claim must be SPECIFIC to this source—if you could swap the topic, it's wrong

STRUCTURE (after hook):
- EVIDENCE: 3-5 lines. Back up the claim with source details.
- FRICTION: 1-2 lines. The hard trade-off implied by the source.
- PAYOFF: 1-2 lines. The new perspective or reframe from the source.

THE "SWAP TEST":
If you removed the topic-specific words and the post still made sense, you've written a template. Rewrite.

HASHTAGS: 3-5 relevant hashtags at the end.`
            case "story-based":
                return `STORY FORMAT (DYNAMIC PHYSICAL ANCHOR):

THE ANCHOR OBJECT MUST BE EXTRACTED FROM THE SOURCE.
Before writing the first line, execute this extraction:
1. SCAN the source for domain-specific nouns (NOT generic tech objects)
2. SELECT the noun that represents the CORE DELIVERABLE or ARTIFACT of this topic
3. CREATE an opening where the protagonist PHYSICALLY INTERACTS with this extracted noun

ANCHOR OBJECT EXTRACTION LOGIC:
- If source is about BLOCKCHAIN → wallet, ledger, node dashboard, smart contract, gas fee receipt
- If source is about MARKETING → campaign brief, analytics dashboard, client feedback email, ad mockup
- If source is about SALES → proposal deck, quota sheet, pipeline report, contract, objection log
- If source is about CODING → pull request, deployment log, error stack, test suite, API docs
- If source is about STRATEGY → roadmap document, board presentation, competitor analysis, org chart
- If source is about CONTENT → draft document, editorial calendar, engagement report, style guide

DOMAIN-SPECIFIC NOUNS FOR THIS SOURCE:
${domainNouns.map(n => `- ${n}`).join('\n')}

NUCLEAR BANNED OBJECTS (NEVER USE):
- laptop, computer, screen, monitor, phone, keyboard, mouse, desk, coffee, chair
- These are the LAZY DEFAULTS that make every story sound the same.

VERB EXTRACTION (DOMAIN-DERIVED):
Instead of generic verbs, derive from the source's emotional tone:
- FAILURE tone → deleted, cancelled, scrapped, rejected, burned
- DISCOVERY tone → cracked, decoded, unlocked, uncovered, traced
- BUILDING tone → assembled, shipped, deployed, wired, connected
- CONFLICT tone → confronted, refused, pushed back, escalated, walked out

BANNED VERBS: thinking, wondering, staring, looking, gazing, sitting, feeling, realizing

IN MEDIA RES (START IN THE ACTION):
- Drop the reader into the SPECIFIC moment of failure/action.
- The first sentence must be a PHYSICAL ACTION with the extracted noun.
- NO emotional setup. NO context explanation. ACTION FIRST.

STRUCTURE:
1. THE SCENE: The physical moment with the extracted anchor object.
2. THE REALIZATION: The internal shift derived from the source's insight.
3. THE STRATEGY: The specific approach from the source content.
4. THE RESULT: A tangible outcome mentioned in the source.

STAKES REQUIREMENT:
- What was at risk? Extract this from the source's implications.
- If source doesn't state stakes, derive them: time lost, money risked, reputation damaged.

Tone: Vulnerable but competent. Not heroic.

HASHTAGS: 3-5 relevant hashtags at the end.`
            case "carousel":
                return `CAROUSEL FORMAT (OPEN LOOP METHOD):
DNA: "Hook → Build Tension → Twist → Resolution → CTA"
Target length: 400–700 characters total.

OUTPUT FORMAT (MANDATORY):
- Write as SLIDES with separators: "Slide 1:", "Slide 2:", etc.
- 5-7 slides total.
- MAX 25-35 words per slide. Each slide = 1-2 short sentences ONLY.

THE OPEN LOOP TECHNIQUE (CRITICAL):
Each slide must END with an incomplete thought that FORCES the reader to swipe.
- NEVER give the full answer on one slide.
- NEVER let a slide feel "complete" by itself.
- Think of each slide as a Netflix episode cliffhanger.

NARRATIVE ARC ENFORCER:
1. HOOK (Slide 1): Create curiosity gap - reader MUST know more
2. RISING ACTION (Slides 2-3): Build tension, introduce conflict/problem
3. CLIMAX (Slide 4): The "aha" moment, the unexpected insight
4. FALLING ACTION (Slides 5-6): Show proof, reveal payoff
5. RESOLUTION (Final): Satisfying close + call to action

SLIDE 1 (HOOK):
- Must contain specific source element.
- BANNED: "Most people think..." (Myth-Bust default).

FINAL SLIDE (CTA):
- End with engagement trigger.

BANNED PHRASES:
- "But here's the weird part"
- "But here's the thing"
- "Wait." / "Stop."
`
            case "short-viral-hook":
                return `SHORT VIRAL HOOK FORMAT (PUNCHY):
DNA: "[Sharp claim]. [One sentence of evidence]. [Challenge]."
Target length: 400–600 characters.

FIRST 2 LINES = HOOK (MANDATORY):
- This is the SHARPEST statement you can make. No warmup.
- Use a blunt claim or a jarring number from the source.
- Example: "96.55% of pages get zero traffic. Yours might be one of them."
- CRITICAL: Keep hook under 140 characters.

STRUCTURE:
- VALIDATION: 2-3 lines. Just enough context to make the claim believable.
- OPTIONAL BULLETS: Max 3, only if they add clarity. Not a listicle.
- CHALLENGE: 1-2 lines. A sharp question or a provocative statement.

TONE:
- High impact, low word count.
- No storytelling. Just the insight.

HASHTAGS: 3-5 relevant hashtags at the end.`
            default:
                return `Standard LinkedIn post with natural rhythm and varied paragraph lengths.`
        }
    }

    // Build step instructions with UNIQUE variations for each post
    const stepInstructions = steps.map((step, i) => {
        const voiceInfo = typeof step.voice === 'object' ? step.voice : { name: 'DEFAULT', description: '', style: '' }
        const emotionInfo = typeof step.emotion === 'object' ? step.emotion : { name: 'DEFAULT', trigger: '' }

        return `
---POST_${i + 1}---
ROLE: ${step.name}
FOCUS: ${step.focus}
FORMAT: ${step.format.toUpperCase().replace("-", " ")}

═══ UNIQUE VARIATIONS FOR THIS POST (DO NOT USE FOR OTHER POSTS) ═══
HOOK STRUCTURE TO FOLLOW: "${step.hookStructure}"
VOICE ARCHETYPE: ${voiceInfo.name} - "${voiceInfo.description}" (Style: ${voiceInfo.style})
EMOTIONAL UNDERCURRENT: ${emotionInfo.name} - "${emotionInfo.trigger}"
CTA ENDING TO USE: "${step.cta}"
═══════════════════════════════════════════════════════════════════

FORMAT RULES:
${getFormatInstructions(step.format)}
`
    }).join("\n")

    return `SOURCE CONTENT:
"""
${inputText}
"""

CONTEXT:
- Reader: ${readerContext || "General LinkedIn Professional"}
- Tone: ${tonePreset || "professional"}
- Emojis: ${emojiInstruction}
- Domain Detected: ${domain.toUpperCase()}

INSTRUCTIONS:
1. SILENTLY process the source using this logic (do not output this):
   - POV FINDER: Find the single strongest belief in the source. Formulate as: "Most people think X, but the truth is Y."
   - RISKY BET CHECK: Does this belief risk being wrong? If not, sharpen it. The series must be built on this CONVICTION.
   - SURPRISE PLANNER: For the Carousel post (if present), identify the "Twist" moment.
2. Generate 4 separate posts following the strict structure below.
3. CRITICAL: Each post has UNIQUE hook, voice, emotion, and CTA assigned. DO NOT duplicate these across posts.

STRUCTURED OUTPUT REQUIRED:
${stepInstructions}

IMPORTANT:
- Use the delimiter "---POST_X---" exactly as shown.
- Ensure each post fits its assigned ROLE and FOCUS.
- Adapt the writing style to the requested FORMAT (e.g. if Carousel, use "Slide 1:", etc).
- EACH POST MUST USE ITS ASSIGNED VARIATIONS - no two posts should sound alike.
`
}

export async function generateSeries(options: SeriesGenerationOptions): Promise<string[]> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error("OPENAI_API_KEY not set")

    validateInput(options.inputText)

    const openai = new OpenAI({ apiKey })

    // Default to these formats if something is wrong with the array, but it should be typed correctly
    const safeFormats = (options.postFormats && options.postFormats.length === 4)
        ? options.postFormats
        : ["main-post", "story-based", "carousel", "short-viral-hook"] as [LinkedInFormat, LinkedInFormat, LinkedInFormat, LinkedInFormat]

    const systemPrompt = getSeriesSystemPrompt()
    const userPrompt = getSeriesUserPrompt(options.inputText, { ...options, postFormats: safeFormats })

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Using mini for speed/cost as refined by user preference in general
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            // Temperature 0.75: Research shows lower values cause mode collapse.
            // 0.75 ensures diverse, human-like outputs across all 4 posts.
            temperature: 0.75,
            max_tokens: 3000,  // Increased for 4 posts
        })

        const fullText = response.choices[0].message.content
        if (!fullText) throw new Error("Empty response from AI")

        return parseSeriesOutput(fullText)

    } catch (error: any) {
        console.error("OpenAI Series generation error:", error)
        if (error.status === 429) throw new Error("AI service busy. Try again shortly.")
        if (error.status === 400) throw new Error("Content could not be processed.")
        throw new Error("AI generation failed.")
    }
}

/**
 * Parses the single long string into 4 separate posts.
 * Robustly handles potential whitespace or newline variations.
 */
function parseSeriesOutput(text: string): string[] {
    // We expect ---POST_1---, ---POST_2---, etc.
    // We can split by regex.

    // 1. Initial cleanup
    const cleanText = text.trim()

    // 2. Regex to find markers: ---POST_\d---
    // capturing groups might help, but split is easier
    const parts = cleanText.split(/---POST_\d---/i)

    // The first part might be empty (if text starts with ---POST_1---)
    // or it might contain "Silent extracted thinking" if the model leaked it.
    // We generally ignore the pre-amble if it's not a post.

    // Filter out empty strings
    const validParts = parts.filter(p => p && p.trim().length > 10)

    // We expect exactly 4 posts.
    // If we have more or fewer, we try to return what we have, or pad/slice.
    if (validParts.length === 0) {
        // Fallback: return the whole text as one post (better than crashing)
        return [cleanText, "", "", ""]
    }

    // Pad with empty strings if fewer than 4 (unlikely with strict prompt)
    while (validParts.length < 4) {
        validParts.push("")
    }

    // Return exactly 4
    return validParts.slice(0, 4).map(p => p.trim())
}
