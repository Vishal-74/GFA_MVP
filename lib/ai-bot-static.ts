import type { ModuleGroup } from '@/lib/lecture-modules'

export type CourseChatContext = {
  title: string
  description?: string
  lecturer_name?: string
  estimated_hours?: number | null
  modules: ModuleGroup[]
}

function firstModuleSummary(ctx: CourseChatContext): string {
  const m = ctx.modules[0]
  if (!m) return 'Start with the first lessons in the sidebar when you are ready.'
  const parts = m.lectures
    .map((l) => l.transcript?.trim())
    .filter(Boolean)
    .join('\n\n')
  const clip = parts.slice(0, 900)
  return clip
    ? `${m.title} — summary from the materials:\n\n${clip}${parts.length > 900 ? '…' : ''}`
    : `${m.title} covers: ${m.lectures.map((l) => l.title).join('; ')}. Open the first video and transcript for full detail.`
}

export function tryStaticTutorReply(
  rawQuestion: string,
  ctx: CourseChatContext
): string | null {
  const q = rawQuestion.toLowerCase().trim()
  if (!q) return null

  if (/^(hi|hello|hey|good morning|good afternoon)\b|^hii?$/.test(q)) {
    return `Hi! I am the tutor for “${ctx.title}”. Try the quick prompts below, or ask anything about the readings and lectures.`
  }

  if (/help\b|^what can you do|^how does (this|the tutor)/.test(q)) {
    return `I can outline the course, estimate time, summarise module 1, or answer from the lecture material. Use the suggested questions or type your own.`
  }

  if (
    /what is (this )?course about|tell me about (this )?course|describe (this )?course|overview of (the )?course/.test(
      q
    )
  ) {
    const d = ctx.description?.trim()
    return d
      ? `${ctx.title} — ${d}`
      : `${ctx.title} is structured in ${ctx.modules.length} module(s) with ${ctx.modules.reduce((n, m) => n + m.lectures.length, 0)} video lessons. Open the syllabus on the course page for the full outline.`
  }

  if (/duration|how long|how many hours|time to complete|weeks?\b/.test(q)) {
    const h = ctx.estimated_hours
    const n = ctx.modules.reduce((acc, m) => acc + m.lectures.length, 0)
    if (h && h > 0) {
      return `Faculty estimate about ${h} hours of video and reflection for “${ctx.title}”. It is self-paced — spread it over several weeks if you prefer. There are ${n} lessons across ${ctx.modules.length} modules.`
    }
    return `This course is self-paced. There are ${n} lessons in ${ctx.modules.length} module(s). Budget roughly ${Math.max(1, Math.ceil(n * 0.5))}–${Math.ceil(n * 1.2)} hours including notes and replay, depending on your pace.`
  }

  if (
    /module 1|chapter 1|first module|first chapter|week 1|summar(y|ise) (of )?module 1|summar(y|ise) (of )?chapter 1|help (with |in )?chapter (one|1) summary/.test(
      q
    )
  ) {
    return firstModuleSummary(ctx)
  }

  if (/module 2|chapter 2|second module/.test(q)) {
    const m = ctx.modules[1]
    if (!m) return 'This course only has one module in the catalogue — use the sidebar to see all lessons.'
    const titles = m.lectures.map((l) => `• ${l.title}`).join('\n')
    return `${m.title}\n\nLessons:\n${titles}\n\nOpen each lesson’s transcript for detail, or ask a specific question about this module.`
  }

  if (/lecturer|who teaches|instructor/.test(q)) {
    return ctx.lecturer_name
      ? `Your lead lecturer is ${ctx.lecturer_name}.`
      : 'Faculty information is on the course overview page.'
  }

  return null
}
