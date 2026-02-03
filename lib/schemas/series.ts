import { z } from "zod"

// Reusing types/values where possible but defining strictly for Series
const ToneEnum = z.enum(["professional", "conversational", "bold"])
const FormatEnum = z.enum(["main-post", "story-based", "carousel", "short-viral-hook"])

// Matches the SeriesGenerationOptions logic
export const SeriesBodySchema = z.object({
    inputType: z.enum(["text", "url"]),
    inputText: z.string().optional(),
    // Allow valid URL OR empty string (which we treat as undefined later)
    url: z.string().url().or(z.literal("")).optional(),

    context: z.object({
        readerContext: z.string().optional(),
        emojiOn: z.boolean().default(false),
        tonePreset: ToneEnum.optional(),
    }),

    // Must be exactly 4 formats
    postFormats: z.array(FormatEnum).length(4),
})

export type SeriesBody = z.infer<typeof SeriesBodySchema>
