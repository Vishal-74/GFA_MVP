import OpenAI from 'openai'

/** Must match `vector(N)` in Supabase and `match_chunks` RPC. */
export const EMBEDDING_DIM = 768

const OPENAI_EMBED_MODEL = 'text-embedding-3-small'
const OPENAI_CHAT_MODEL = 'gpt-4o'

function isUsableKey(key: string | undefined): boolean {
  const t = key?.trim()
  if (!t) return false
  if (/^your_/i.test(t)) return false
  return true
}

export type AiBackend = 'gemini' | 'openai'

export function resolveAiBackend(): AiBackend | null {
  if (isUsableKey(process.env.GEMINI_API_KEY)) return 'gemini'
  if (isUsableKey(process.env.OPENAI_API_KEY)) return 'openai'
  return null
}

function geminiKey(): string | undefined {
  const k = process.env.GEMINI_API_KEY?.trim()
  return isUsableKey(k) ? k : undefined
}

function openaiClient(): OpenAI | null {
  const k = process.env.OPENAI_API_KEY?.trim()
  return isUsableKey(k) ? new OpenAI({ apiKey: k }) : null
}

/** Single query embedding (RAG search). */
export async function embedQuery(text: string): Promise<number[]> {
  const backend = resolveAiBackend()
  if (!backend) throw new Error('No AI API key configured')

  if (backend === 'gemini') {
    const [v] = await geminiEmbedBatch([text], 'RETRIEVAL_QUERY')
    return v
  }

  const openai = openaiClient()!
  const res = await openai.embeddings.create({
    model: OPENAI_EMBED_MODEL,
    input: text,
    dimensions: EMBEDDING_DIM,
  })
  return res.data[0].embedding as number[]
}

/** Document chunks for indexing (embed script). */
export async function embedDocuments(texts: string[]): Promise<number[][]> {
  const backend = resolveAiBackend()
  if (!backend) throw new Error('No AI API key configured')

  if (backend === 'gemini') {
    const out: number[][] = []
    const batchSize = 100
    for (let i = 0; i < texts.length; i += batchSize) {
      const slice = texts.slice(i, i + batchSize)
      const vecs = await geminiEmbedBatch(slice, 'RETRIEVAL_DOCUMENT')
      out.push(...vecs)
    }
    return out
  }

  const openai = openaiClient()!
  const res = await openai.embeddings.create({
    model: OPENAI_EMBED_MODEL,
    input: texts,
    dimensions: EMBEDDING_DIM,
  })
  return res.data.sort((a, b) => a.index - b.index).map((d) => d.embedding as number[])
}

async function geminiEmbedBatch(
  texts: string[],
  taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'
): Promise<number[][]> {
  const key = geminiKey()
  if (!key) throw new Error('GEMINI_API_KEY missing')

  const raw = process.env.GEMINI_EMBEDDING_MODEL?.trim() || 'gemini-embedding-001'
  const shortName = raw.replace(/^models\//, '')
  const modelId = `models/${shortName}`
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelId}:batchEmbedContents`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key,
    },
    body: JSON.stringify({
      requests: texts.map((text) => ({
        model: modelId,
        content: { parts: [{ text }] },
        taskType,
        outputDimensionality: EMBEDDING_DIM,
      })),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini embed failed (${res.status}): ${err.slice(0, 500)}`)
  }

  const data = (await res.json()) as { embeddings?: { values?: number[] }[] }
  const embeddings = data.embeddings
  if (!embeddings || embeddings.length !== texts.length) {
    throw new Error('Gemini embed: unexpected response shape')
  }
  return embeddings.map((e) => {
    const v = e.values
    if (!v || v.length !== EMBEDDING_DIM) {
      throw new Error(`Gemini embed: expected ${EMBEDDING_DIM} dims, got ${v?.length ?? 0}`)
    }
    return v
  })
}

export async function tutorComplete(systemPrompt: string, userMessage: string): Promise<string> {
  const backend = resolveAiBackend()
  if (!backend) throw new Error('No AI API key configured')

  if (backend === 'gemini') {
    return geminiGenerate(systemPrompt, userMessage)
  }

  const openai = openaiClient()!
  const completion = await openai.chat.completions.create({
    model: OPENAI_CHAT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 500,
  })
  return completion.choices[0].message.content?.trim() || ''
}

async function geminiGenerate(systemPrompt: string, userMessage: string): Promise<string> {
  const key = geminiKey()
  if (!key) throw new Error('GEMINI_API_KEY missing')

  const raw = process.env.GEMINI_CHAT_MODEL?.trim() || 'gemini-2.0-flash'
  const shortName = raw.replace(/^models\//, '')
  const modelId = `models/${shortName}`
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini chat failed (${res.status}): ${err.slice(0, 500)}`)
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? ''
  return text.trim()
}
