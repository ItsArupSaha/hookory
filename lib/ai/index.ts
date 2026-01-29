import OpenAI from "openai"
import {
  getVariationSet,
  detectDomain,
  getDomainNouns,
  HOOK_STRUCTURES,
  VOICE_ARCHETYPES,
  EMOTIONAL_TONES,
  CTA_ENDINGS
} from "./variations"

/**
 * Supported LinkedIn Output Formats.
 * These map 1:1 with the defined format rules.
 */
export type LinkedInFormat =
  | "main-post"
  | "story-based"
  | "carousel"
  | "short-viral-hook"

/**
 * Context Interface.
 * Defines the strict set of inputs the AI considers.
 * - readerContext: Who is reading? (sets complexity/background)
 * - angle: What is the focus? (sets the core insight)
 * - emojiOn: Preference toggle
 * - tonePreset: Stylistic direction
 */
export interface GenerateContext {
  readerContext?: string
  angle?: string
  emojiOn?: boolean
  tonePreset?: "professional" | "conversational" | "bold"
}

export interface GenerateOptions {
  format: LinkedInFormat
  inputText: string
  context: GenerateContext
  regenerate?: boolean
}

// Input constants
const MAX_INPUT_CHARS = 20000
const MAX_OUTPUT_CHARS = 2900

function normalizeInput(inputText: string): string {
  let normalized = inputText.trim()
  normalized = normalized.replace(/[ \t]+/g, " ")
  normalized = normalized.replace(/\n\s*\n/g, "\n\n")
  return normalized
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
 * System Prompt: opinionated, minimal, high-leverage for gpt-4o-mini.
 * Key upgrades:
 * - Forces source-anchored writing (prevents generic "leadership wisdom").
 * - Prevents invented personal stories when source is technical.
 * - Enforces "one failure pattern" (angle) without repeating a template phrase.
 */
function getSystemPrompt(): string {
  return `You are Hookory, a LinkedIn editor and ghostwriter.
You repurpose provided source content into one LinkedIn post that feels human, specific, and worth reading.

NON-NEGOTIABLES:
- Stay grounded in the SOURCE. Use at least 2 concrete details from it (tools, steps, numbers, terms, constraints).
- Do not invent facts. If the source is technical/instructional, do NOT fabricate a personal launch story or fake "my project" narrative.
- Pick ONE central angle and keep every paragraph aligned to it (no multi-topic summaries).
- Reading level: simple, direct, grade 6–8. Prefer short common words.

CONVICTION INJECTION (NON-NEGOTIABLE):
Every post must contain at least ONE of these:
1. A CONTRARIAN CLAIM: "Most people misunderstand X. Here's the truth."
2. A BOLD PREDICTION: "This will be obsolete in 2 years."
3. AN UNCOMFORTABLE TRUTH: "Nobody tells you this, but..."
4. A POLARIZING STANCE: "I'd rather X than Y. And here's why."

VOICE VARIATION (ANTI-ROBOT MODE):
To prevent "AI Tone", you must adopt ONE of these voice archetypes (pick the best fit):
1. THE ANALYST (Cold, Precise): "Let's look at the data. Ignore the hype." Structure: Data -> Logic -> Conclusion.
2. THE REALIST (Blunt, Experienced): "Stop doing X. It doesn't work. Do Y." Structure: Myth -> Reality -> Action.
3. THE ARCHITECT (System-Focused): "I built this. It broke. Here's the fix." Structure: Failure -> System -> Result.
- CRITICAL: DO NOT use the "Old Way -> New Way" transition explicitly ("The old way is X. The new way is Y"). It is too repetitive. Just state the better way.

BANNED SAFE CONCLUSIONS:
- "Things are changing. You should adapt."
- "This is important for the future."
- "Balance is key."
- "It depends on your situation."
- Any conclusion that could apply to 100 different topics.

THE "DISAGREE" TEST:
If a reasonable person couldn't disagree with your main claim, it's too weak. Rewrite.

PRE-WRITING LOGIC (EXECUTE BEFORE WRITING - MANDATORY):

[STEP 0: FRAMEWORK SELECTION] (EXECUTE FIRST - ALL FORMATS)
Before writing ANY content, you MUST analyze the source and COMMIT to ONE framework:

ANALYZE THE SOURCE:
- Does it raise a QUESTION readers want answered? → Use QUESTION framework
- Does it contain SURPRISING DATA or statistics? → Use STATISTIC framework  
- Does it describe a PERSONAL EXPERIENCE or journey? → Use STORY framework
- Does it make a CONTRARIAN or surprising claim? → Use BOLD CLAIM framework
- Does it address a PAIN POINT with a solution? → Use PROBLEM-SOLUTION framework
- Does it provide ACTIONABLE steps? → Use HOW-TO framework

THE ANTI-DEFAULT RULE:
- "Most people think..." / "Most people believe..." / "Many assume..." are BANNED
- The myth-bust pattern is the LAZY DEFAULT. You must EARN your framework.
- If your opening could work for ANY topic, it's too generic. Rewrite.

THE VARIETY RULE:
You are generating content for a $20/month tool. If users generate 5 outputs and all 5 start the same way, they cancel. EVERY output must use a DIFFERENT opening approach based on what the SOURCE text EARNS.

[STEP 1: SOURCE NOUN EXTRACTION] (For Story-Based Posts Only)
Before writing a story opener:
1. SCAN the source text for 3-5 SPECIFIC NOUNS unique to this content.
2. SELECT ONE noun the protagonist can physically INTERACT with.
3. GENERATE an action where the protagonist DOES something to that noun.
4. BANNED GENERIC NOUNS: laptop, computer, screen, desk, chair, coffee, phone.
5. BANNED VERBS: staring, looking, gazing, sitting, wondering, thinking, pondering.

[STEP 2: THE STAT AUDITOR] (ZERO TOLERANCE)
BEFORE writing any number:
- IF a number EXISTS in the source: You MAY use it.
- IF NO number exists: FORBIDDEN from using digits (0-9) or "%" symbols.
- Use qualitative language instead.

[STEP 3: THE ANGLE BRIDGE] (When Angle ≠ Source Topic)
If the user's angle doesn't match the source topic, CREATE a conceptual bridge.

[STEP 4: EMOTIONAL TRIGGER SELECTION] (MANDATORY - NO GENERIC EMOTIONS)
Before writing, identify which HIGH-AROUSAL emotion this content should trigger.
BANNED EMOTIONS: "Inspiration", "Motivation", "Calm", "Professional", "Reflective".
ALLOWED EMOTIONS (PICK ONE):
- AWE: "I had no idea this was possible"
- ANGER: "This is broken and no one is talking about it"
- FEAR/URGENCY: "If you don't act, you'll be left behind"
- SURPRISE: "This contradicts everything I believed"
- AMUSEMENT: "I can't believe this actually works"

[STEP 5: BELIEF VIOLATION CHECK] (COGNITIVE DISSONANCE)
Every post MUST challenge ONE specific belief the reader holds:
- What does the reader currently believe that this content proves wrong?
- What "obvious truth" does this content flip on its head?
- What "best practice" does this content reveal as harmful?
If you cannot identify a belief being violated, the content is too safe. Find the friction.

[STEP 6: CURIOSITY GAP] (INFORMATION ASYMMETRY)
The hook must CREATE a gap between what the reader knows and what they NEED to know:
- PROMISE a revelation but WITHHOLD the answer until the end.
- BANNED: Giving the main insight in the first 3 lines.
- BANNED: Summarizing the takeaway in the hook.
- Make the reader feel INCOMPLETE until they swipe/click "see more".

[STEP 7: HOOK TOURNAMENT] (INTERNAL SELECTION)
Before writing, silently generate 3 hook options.
1. Statistic-based
2. Contrarian Claim
3. Specific Situation
Select the one that passes the SCROLL-STOP TEST.

SCROLL-STOP TEST (THE THUMB MUST STOP):
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

QUOTABILITY CHECK (SCREENSHOT-WORTHY):
Every post MUST contain at least ONE line that is bold, specific, and memorable enough to be screenshotted.

RHYTHM BREAKER (AI DETECTION AVOIDANCE):
To avoid sounding like AI, you MUST vary your sentence structure:
- Mix 3-word sentences with 20-word sentences.
- Include fragments. Like this.
- Use mid-thought pivots: "Actually, that's not quite right—"

HUMAN FINGERPRINT (MANDATORY - 2 PER POST):
You MUST include at least TWO of these specific punctuation marks per post:
1. Parenthetical aside '(like this)' to add conversational texture.
2. Em-dash interruption '—' to break the rhythm.
3. Self-correction: "Wait, let me rephrase that."

If the post lacks these, it fails.

NUCLEAR BANS (INSTANT REJECTION PHRASES):
If any of these strings appear, the generation is FAILED:
- "uncomfortable truth" (BANNED)
- "knee deep" (BANNED)
- "buried under" (BANNED)
- "It's about transformation" (BANNED)
- "It's about connection" (BANNED)
- "delve" (BANNED)
- "tapestry" (BANNED)
- "landscape is shifting" (BANNED)

BANNED CADENCE PATTERNS (INSTANT REJECTION):
- "Many people assume..." / "Most people think..." / "The common belief is..."
- "Most creators..." / "Many creators..." / "Most marketers..." / "Many engineers..."
  → The "Most [role]" pattern is the banned "Most people" in disguise.
- "But here's the thing..." / "The reality is..."
- "The key is..." / "The secret is..."
- "Let me explain..." / "Here's why..."
- "Here's what I learned..." / "Here's why..."
- "In today's world..." / "In this era..."
- "Are you making the same mistake?" / "How's that working for you?" / "Are you prepared?"
  → These rhetorical questions are too generic.

TENSION INJECTION (MANDATORY):
Every post must have ONE moment of friction. No safe, balanced takes.

LINKEDIN WRITING STYLE (HUMAN-CENTRIC):
- RHYTHM OVER RULES.
- THE "BREATH" TEST.
- WHITESPACE.
- AUTHENTIC VOICE.
- NO MARKDOWN.

HOOK QUALITY:
- First 2 lines must create tension.
- NEVER open with a yes/no question.

BANNED OPENERS:
- "Picture this:", "Imagine this:", "Here's the thing:"
- "In this post...", "Let's talk about..."
- "Have you ever wondered..."
- Any template phrase.

`
}

function getFormatRules(format: LinkedInFormat): string {
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

Tone: Vulnerable but competent. Not heroic.`

    case "carousel":
      return `OUTPUT TYPE: CAROUSEL (OPEN LOOP METHOD)
Target length: 400–700 characters total.
DNA: "Hook → Build Tension → Twist → Resolution → CTA"

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
- Apply STEP 0 (Framework Selection).
- Must contain specific source element.
- BANNED: "Most people think..." (Myth-Bust default).

SLIDE-BY-SLIDE:
- Slide 3 is the "Turn" or "Disruption".
- Final slide is the CTA.

BANNED PHRASES:
- "But here's the weird part"
- "But here's the thing"
- "Wait." / "Stop."`

    case "short-viral-hook":
      return `OUTPUT TYPE: SHORT VIRAL HOOK (PUNCHY)
Target length: 400–600 characters.
DNA: "[Sharp claim]. [One sentence of evidence]. [Challenge]."

FIRST 2 LINES = HOOK (MANDATORY):
- This is the SHARPEST statement you can make. No warmup.
- Use a blunt claim or a jarring number from the source.
- Example: "96.55% of pages get zero traffic. Yours might be one of them."
- CRITICAL: Keep hook under 140 characters.

STRUCTURE:
- VALIDATION: 2-3 lines. Just enough context to make the claim believable.
- OPTIONAL BULLETS: Max 3, only if they add clarity.
- CHALLENGE: 1-2 lines. A sharp question or provocative statement.

TONE:
- High impact, low word count.
- No storytelling. Just the insight.`

    default:
      return ""
  }
}

function getInstructionPrompt(
  format: LinkedInFormat,
  context: GenerateContext,
  regenerate: boolean,
  inputText: string
): string {
  const { readerContext, angle, emojiOn, tonePreset } = context

  const emojiInstruction = emojiOn ? "Required (2–5). Usage is mandatory. Use relevantly to enhance meaning. Place at natural breaks." : "Do not use emojis"

  const regenerationInstruction = regenerate
    ? `RETRY MODE:
- Write a genuinely different hook + framing (not a paraphrase).
- Change the entry point (e.g., if previous hook was a question, use a blunt statement or contrast).
- Make it 15–25% sharper and more specific (more source detail, less abstraction).`
    : ""

  const formatRules = getFormatRules(format)

  // GET SHUFFLED VARIATIONS for this generation (no repeats until list exhausted)
  const variationSet = getVariationSet()

  // Detect domain from source to get relevant nouns
  const domain = detectDomain(inputText)
  const domainNouns = getDomainNouns(domain)

  // Build variation instructions for AI
  const voiceInfo = typeof variationSet.voice === 'object' ? variationSet.voice : { name: 'DEFAULT', description: '', style: '' }
  const emotionInfo = typeof variationSet.emotion === 'object' ? variationSet.emotion : { name: 'DEFAULT', trigger: '' }

  const variationsInstruction = `
═══════════════════════════════════════════════════════════════════
ASSIGNED VARIATIONS FOR THIS POST (USE THESE EXACTLY)
═══════════════════════════════════════════════════════════════════
HOOK STRUCTURE: "${variationSet.hook}"
VOICE ARCHETYPE: ${voiceInfo.name} - "${voiceInfo.description}"
  Style: ${voiceInfo.style}
EMOTIONAL UNDERCURRENT: ${emotionInfo.name} - "${emotionInfo.trigger}"
CTA ENDING: "${variationSet.cta}"
DETECTED DOMAIN: ${domain.toUpperCase()}
DOMAIN-SPECIFIC NOUNS (use for story anchors):
${domainNouns.map(n => `  - ${n}`).join('\n')}
═══════════════════════════════════════════════════════════════════

YOUR TASK: Adapt the hook structure, voice, emotion, and CTA above to fit the source content.
The variation tells you HOW to write. The source tells you WHAT to write about.
`

  /**
   * Critical upgrade: force a silent extraction step that:
   * - selects a single failure pattern/assumption from the source
   * - selects concrete anchors so it cannot drift into generic advice
   * - keeps the "angle" enforced without repeating "the mistake is..."
   */
  let process = ``

  if (format === 'carousel') {
    process = `PROCESS (silent, do not output):
1) POV FINDER: Scan source for the strongest opinion. Formulate a conviction: "Most people think X, but the truth is Y."
2) RISKY BET CHECK: Does this POV risk being wrong? If not, sharpen it. (e.g., "AI is good" -> "AI is overrated for X")
3) SURPRISE PLANNER: What is the "Twist" on Slide 3? It must be a moment of "Oh, I didn't expect that."
4) MAP THE GAP: Ensure Slide 1 creates a question that only Slide 6 answers.`
  } else {
    process = `PROCESS (silent, do not output):
1) POV EXTRACTION (CRITICAL):
   - Find the single strongest belief in the source.
   - Formulate it as a convicted statement: "Most people misunderstand X. The real leverage is Y."
   - DISAGREEMENT CHECK: If a reasonable expert can't disagree with this ('Things are changing' = WEAK), then SHARPEN it.
2) ANCHOR SELECTION: Pick 3 concrete details (numbers, names, steps) to prove this exact POV.
3) STRUCTURE MAPPING: Plan where you will arguably disagree with conventional wisdom.
4) VARIATION APPLICATION: Apply your assigned hook structure, voice, emotion, and CTA to the content.`
  }

  const writeInstructions = `WRITE (output only the post):
- Do NOT name the angle explicitly with template phrases (avoid "the common mistake is...").
- Make the angle obvious through examples, contrast, and natural reinforcement.
- Vary paragraph lengths. Mix punchy 1-liners with 2-3 sentence thoughts. Monotony = robotic.
- Group related ideas. Use whitespace to create visual flow, not after every sentence.
- CRITICAL: Start with the HOOK STRUCTURE you were assigned. Adapt it to the source.
- CRITICAL: Maintain the VOICE ARCHETYPE throughout the post.
- CRITICAL: Infuse the EMOTIONAL UNDERCURRENT into every paragraph.
- CRITICAL: End with the CTA STYLE you were assigned.
- No markdown styling. Raw text only.`

  // Reader context guidance (lightweight, not persona-theatre)
  const readerGuidance = (() => {
    const rc = (readerContext || "").toLowerCase()
    if (rc.includes("decision")) {
      return `READER CONTEXT NOTE:
Write for decision-makers: frame as trade-offs, risk, cost of wrong priorities, and operational reality. Avoid emotional self-help tone.`
    }
    if (rc.includes("learner") || rc.includes("student")) {
      return `READER CONTEXT NOTE:
Write for learners: be slightly more explanatory, but still skimmable.`
    }
    if (rc.includes("peer")) {
      return `READER CONTEXT NOTE:
Write for peers: assume baseline familiarity, be concise, no hand-holding.`
    }
    return `READER CONTEXT NOTE:
Write for general LinkedIn readers: simple language, fast clarity.`
  })()

  // Angle note (kept subtle: lens, not literal)
  const angleNote = angle
    ? `ANGLE LENS:
Use this lens to choose what matters and what to ignore: "${angle}".`
    : `ANGLE LENS:
Auto-pick the strongest single lens from the source. Ignore the rest.`

  return `CONTEXT:
- Reader: ${readerContext || "General LinkedIn readers"}
- Tone: ${tonePreset || "professional"}
- Emojis: ${emojiInstruction}
${angleNote}

${variationsInstruction}

${readerGuidance}

${regenerationInstruction}

${process}

${writeInstructions}

${formatRules}

OUTPUT CONSTRAINTS:
- Total length must be under ${MAX_OUTPUT_CHARS} characters.
- Hashtags: 0–5 at the end, only if relevant to the source.
- Emojis: ${emojiInstruction}

BONUS OUTPUT (Mandatory):
After the post, add a separator "---EXTRA_HOOKS---" and list exactly 5 alternative hooks.

HOOK QUALITY RULES (CRITICAL):
- NEVER write a simple yes/no question (e.g., "Blocking Google?"). These are weak and easy to scroll past.
- NEVER invent statistics. Only use numbers EXPLICITLY in the source.
- PRIORITIZE these hook types (in order of preference):
  1. HIGH-STAKES STATEMENT: "Blocking Google from your site means zero traffic—forever."
  2. CONTRARIAN CLAIM: "The best SEO strategy? Stop chasing keywords."
  3. SPECIFIC NUMBER/STAT (only if in source): "96.55% of pages get zero traffic. Here's why."
  4. PROVOCATIVE QUESTION (open-ended, not yes/no): "What if your biggest SEO win is hiding in plain sight?"
- Each hook must be grounded in a concrete source anchor (no generic life advice).
- Each hook must be 1–2 lines max.
- Write hooks that make the reader feel: "Wait—I need to know more."

Format exactly (just the text, no labels):
1. ...
2. ...
3. ...
4. ...
5. ...

CTA RULES v2 (UPGRADED - DISAGREEMENT-INVITING):
The closing question of the post must follow these rules:

BANNED CTA PATTERNS:
- "What steps are you taking..."
- "How are you approaching..."
- "Are you prepared for..."
- "What's your experience with..."
- "What would you choose?"
- "Are you ready?"
- "What's one thing you'd prioritize?"
- Any question answerable with "yes", "no", or "I agree"
- Any question answerable in under 5 words

REQUIRED CTA TYPES (pick one):
1. HOT TAKE CHALLENGE: "Change my mind: X is overrated."
2. CONFESSION PROMPT: "What's the worst mistake you made doing X?"
3. POLARIZING EITHER/OR: "Would you rather lose your audience or your integrity?"
4. PREDICTION PROBE: "In 2 years, will X or Y win? I say X."
5. SPECIFIC STORY REQUEST: "What's the one time this backfired on you?"

THE "COMMENT MAGNET" TEST:
If the CTA can be answered in under 5 words, it's too weak. Rewrite.

The goal: Make the reader WANT to comment, not FEEL OBLIGATED to.

3–5 relevant hashtags at the end, only if truly relevant to the source.`
}

function getUserPrompt(inputText: string): string {
  const safeInput = inputText.replace(/"""/g, "'''")
  // Inject explicit entropy to prevent cache/determinism loops
  const entropy = `Generation Timestamp: ${Date.now()}`

  return `SOURCE CONTENT:
"""
${safeInput}
"""

---
User Metadata (Ignore for content, but use for sampling):
${entropy}`
}

async function generateWithOpenAI(options: GenerateOptions): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY not set")

  validateInput(options.inputText)

  const openai = new OpenAI({ apiKey })
  const systemPrompt = getSystemPrompt()
  const instructionPrompt = getInstructionPrompt(
    options.format,
    options.context,
    options.regenerate || false,
    options.inputText
  )
  const userPrompt = getUserPrompt(options.inputText)

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${instructionPrompt}\n\n${userPrompt}` }
      ],
      // Temperature 0.75: Research shows 0.6 causes mode collapse (repetitive patterns).
      // 0.75 balances creativity with coherence for diverse, human-like outputs.
      temperature: 0.75,
      max_tokens: 1800
    })

    const text = response.choices[0].message.content
    if (!text) throw new Error("Empty response from AI")
    return text.trim()
  } catch (error: any) {
    console.error("OpenAI generation error:", error)
    if (error.status === 429) throw new Error("AI service busy. Try again shortly.")
    if (error.status === 400) throw new Error("Content could not be processed.")
    throw new Error("AI generation failed.")
  }
}

/**
 * Main entry point for generating LinkedIn content.
 * Handles normalization, validation, and race-conditions (timeouts).
 */
export async function generateLinkedInFormat(
  format: LinkedInFormat,
  inputText: string,
  context: GenerateContext,
  regenerate?: boolean
): Promise<string> {
  const normalized = normalizeInput(inputText)
  if (normalized.length > MAX_INPUT_CHARS) {
    throw new Error(`Input too long (${normalized.length} chars).`)
  }

  // Timeout wrapper (60s)
  const timeoutPromise = new Promise<string>((_, reject) => {
    setTimeout(() => reject(new Error("AI generation timeout")), 60000)
  })

  return Promise.race([
    generateWithOpenAI({ format, inputText: normalized, context, regenerate }),
    timeoutPromise
  ])
}
