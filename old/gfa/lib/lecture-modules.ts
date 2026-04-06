/** Group flat lecture rows into modules (module_sequence + module_title from DB). */
export type LectureRow = {
  id: string
  order_index: number
  module_sequence?: number | null
  module_title?: string | null
  title: string
  transcript?: string | null
  mux_asset_id?: string | null
  content_kind?: string | null
  mcq?: unknown
  [key: string]: unknown
}

export type ModuleGroup = {
  sequence: number
  title: string
  lectures: LectureRow[]
}

export function groupLecturesIntoModules(lectures: LectureRow[]): ModuleGroup[] {
  const sorted = [...lectures].sort((a, b) => a.order_index - b.order_index)
  const out: ModuleGroup[] = []
  for (const lec of sorted) {
    const seq = typeof lec.module_sequence === 'number' ? lec.module_sequence : 1
    const mTitle = (lec.module_title || 'Lessons').trim() || 'Lessons'
    const last = out[out.length - 1]
    if (!last || last.sequence !== seq) {
      out.push({ sequence: seq, title: mTitle, lectures: [lec] })
    } else {
      last.lectures.push(lec)
    }
  }
  return out
}

/** Flat index in sorted lecture list for sidebar navigation */
export function flatLectureIndex(lectures: LectureRow[], lectureId: string): number {
  const sorted = [...lectures].sort((a, b) => a.order_index - b.order_index)
  return sorted.findIndex((l) => l.id === lectureId)
}
