export type McqQuestion = {
  prompt: string
  options: string[]
  correctIndex: number
}

export type McqPayload = {
  questions: McqQuestion[]
}

export function parseMcq(raw: unknown): McqPayload | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as { questions?: unknown }
  if (!Array.isArray(o.questions) || o.questions.length === 0) return null
  const questions: McqQuestion[] = []
  for (const q of o.questions) {
    if (!q || typeof q !== 'object') return null
    const row = q as { prompt?: unknown; options?: unknown; correctIndex?: unknown }
    if (typeof row.prompt !== 'string' || !Array.isArray(row.options)) return null
    const opts = row.options.filter((x): x is string => typeof x === 'string')
    if (opts.length < 2) return null
    const ci = row.correctIndex
    if (typeof ci !== 'number' || ci < 0 || ci >= opts.length) return null
    questions.push({ prompt: row.prompt, options: opts, correctIndex: ci })
  }
  return { questions }
}
