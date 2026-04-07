import { embedQuery, resolveAiBackend, tutorComplete } from '@/lib/ai-provider'
import { getSupabaseUrl, isSupabaseConfigured } from '@/lib/supabase-env'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function looksLikeQuotaOrRateLimit(message: string): boolean {
  return /429|quota|rate.?limit|RESOURCE_EXHAUSTED|exceeded your current quota/i.test(message)
}

export async function POST(req: NextRequest) {
  try {
    const { question, courseId } = await req.json()

    if (!question || !courseId) {
      return NextResponse.json(
        { error: 'Missing question or courseId' },
        { status: 400 }
      )
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    if (!isSupabaseConfigured() || !serviceKey) {
      return NextResponse.json(
        { answer: "AI tutor is not configured. Please set up Supabase credentials." },
        { status: 200 }
      )
    }

    if (!resolveAiBackend()) {
      return NextResponse.json(
        {
          answer:
            'AI tutor is not configured. Add GEMINI_API_KEY or OPENAI_API_KEY to your server environment.',
        },
        { status: 200 }
      )
    }

    const supabaseAdmin = createClient(getSupabaseUrl(), serviceKey)

    let embedding: number[]
    try {
      embedding = await embedQuery(question)
    } catch (embedErr: unknown) {
      const msg = embedErr instanceof Error ? embedErr.message : String(embedErr)
      if (looksLikeQuotaOrRateLimit(msg)) {
        return NextResponse.json({
          answer:
            'The AI service has hit its usage quota right now (this often happens on free-tier API keys). Try again later, enable billing on your Google AI / OpenAI project, or use the quick prompts that work without the live model.',
        })
      }
      console.error('AI bot embed error:', embedErr)
      return NextResponse.json({
        answer: "I couldn't search the course material. Please try again in a moment.",
      })
    }

    const { data: chunks, error } = await supabaseAdmin.rpc('match_chunks', {
      query_embedding: embedding,
      match_course_id: courseId,
      match_count: 5
    })

    if (error) {
      console.error('Supabase RPC error:', error)
      return NextResponse.json(
        { answer: "I'm having trouble accessing the course material. Please try again." },
        { status: 200 }
      )
    }

    const context = chunks && chunks.length > 0
      ? (chunks as Array<{ content: string }>).map((c) => c.content).join('\n\n---\n\n')
      : 'No course material available yet.'

    const systemPrompt = `You are a Socratic tutor for Global Freedom Academy. Answer ONLY based on the course material below. If the answer isn't in the material, say so. Be concise, intellectually rigorous, and guide students to think critically.

COURSE MATERIAL:
${context}`

    const answer =
      (await tutorComplete(systemPrompt, question)) ||
      "I couldn't generate a response. Please try again."

    return NextResponse.json({ answer })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('AI bot error:', error)
    if (looksLikeQuotaOrRateLimit(msg)) {
      return NextResponse.json({
        answer:
          'The AI tutor is temporarily unavailable because the API quota is exceeded (see your Gemini/OpenAI dashboard and billing). Quick offline prompts may still work. Try again later.',
      })
    }
    return NextResponse.json(
      { answer: "I encountered an error. Please try again later." },
      { status: 200 }
    )
  }
}
