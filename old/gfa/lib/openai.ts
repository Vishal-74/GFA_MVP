import OpenAI from 'openai'
import { resolveAiBackend } from '@/lib/ai-provider'

/** @deprecated Prefer `resolveAiBackend()` + `embedQuery` / `tutorComplete` from `@/lib/ai-provider`. */
export const openai =
  resolveAiBackend() === 'openai' && process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null
