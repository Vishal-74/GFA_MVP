/**
 * Prints SQL: DELETE old lectures for courses 101–103 + INSERT expanded chapters (videos + MCQ).
 * Run: cd gfa && npx tsx scripts/generate-core-courses-seed.ts
 */

const MUX = 'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe'

const C101 = '11111111-1111-4111-8111-111111111101'
const C102 = '11111111-1111-4111-8111-111111111102'
const C103 = '11111111-1111-4111-8111-111111111103'

let seq = 0
function lid(): string {
  seq += 1
  const h = seq.toString(16).padStart(12, '0')
  return `f0000001-0001-4001-8001-${h}`
}

function esc(s: string): string {
  return s.replace(/'/g, "''")
}

function mcq5(theme: string, courseKey: 'liberty' | 'systems' | 'examined'): object {
  const mk = (prompt: string, options: string[], correctIndex: number) => ({
    prompt,
    options,
    correctIndex,
  })
  const bad2 =
    courseKey === 'systems'
      ? 'Drawing loops without stocks and flows'
      : courseKey === 'examined'
        ? 'Treating every feeling as morally decisive'
        : 'Treating liberty as mere whim'
  return {
    questions: [
      mk(`${theme}: which best captures a central claim of this chapter?`, ['A precise distinction from the lectures', 'A random fact', 'A joke only', 'Undefined jargon'], 0),
      mk(`${theme}: a mistake to avoid is`, [bad2, 'Reading slowly', 'Taking notes', 'Asking questions'], 0),
      mk(`${theme}: the best follow-up is`, ['Apply one idea to a real case', 'Stop practicing', 'Memorize buzzwords only', 'Ignore feedback'], 0),
      mk(`${theme}: which supports real understanding?`, ['Explaining the idea without slides', 'Only underlining', 'Skipping discussion', 'Avoiding the transcript'], 0),
      mk(`${theme}: exams reward answers that`, ['Use clear reasoning tied to themes', 'List names only', 'Copy without understanding', 'Stay vague'], 0),
    ],
  }
}

type Mod = { title: string; videos: string[] }

function rowsForCourse(courseId: string, modules: Mod[], courseKey: 'liberty' | 'systems' | 'examined'): string[] {
  const lines: string[] = []
  let order = 0
  for (let m = 0; m < modules.length; m++) {
    const mod = modules[m]
    const ms = m + 1
    for (const vt of mod.videos) {
      order += 1
      const id = lid()
      lines.push(
        `  ('${id}', '${courseId}', '${esc(vt)}', '${MUX}', '${esc(vt + '. Summary: connect to readings and discussion prompts.')}', ${order}, ${ms}, '${esc(mod.title)}', 'video', NULL)`
      )
    }
    order += 1
    const exId = lid()
    const mj = esc(JSON.stringify(mcq5(mod.title, courseKey)))
    lines.push(
      `  ('${exId}', '${courseId}', '${esc('Exercise — ' + mod.title)}', NULL, NULL, ${order}, ${ms}, '${esc(mod.title)}', 'mcq_quiz', '${mj}'::jsonb)`
    )
  }
  return lines
}

const m101: Mod[] = [
  { title: 'Chapter 1 — What liberty means', videos: ['Liberty vs license', 'Negative and positive liberty', 'Rights as side-constraints'] },
  { title: 'Chapter 2 — Rule of law', videos: ['Generality and predictability', 'Arbitrary rule and its costs', 'Spontaneous order preview'] },
  { title: 'Chapter 3 — Constitutions and power', videos: ['Separation of powers', 'Bills of rights in context', 'Federalism as a device'] },
  { title: 'Chapter 4 — Property and exchange', videos: ['Why property rights scale cooperation', 'Voluntary exchange and information', 'Common objections'] },
  { title: 'Chapter 5 — Dissent and civic life', videos: ['Why dissent signals health', 'Speech and offence', 'Applying the toolkit'] },
]

const m102: Mod[] = [
  { title: 'Chapter 1 — Loops and behaviour', videos: ['Reinforcing loops', 'Balancing loops', 'Drawing your first map'] },
  { title: 'Chapter 2 — Stocks and flows', videos: ['Bathtub intuition', 'Delays and oscillation', 'Policy half-lives'] },
  { title: 'Chapter 3 — Incentives', videos: ['Targets and Goodhart', 'Hidden rewards', 'Designing better metrics'] },
  { title: 'Chapter 4 — Leverage', videos: ['Meadows hierarchy', 'Cheap vs effective moves', 'Ethics of intervention'] },
  { title: 'Chapter 5 — Scenarios', videos: ['Axes of uncertainty', 'Three futures exercise', 'Stress-testing a policy'] },
]

const m103: Mod[] = [
  { title: 'Chapter 1 — Stoic foundations', videos: ['Dichotomy of control', 'Premeditatio malorum', 'Journaling practice'] },
  { title: 'Chapter 2 — Cognitive pitfalls', videos: ['Confirmation bias', 'Motivated reasoning', 'Steel-manning'] },
  { title: 'Chapter 3 — Habits and attention', videos: ['Environment design', 'Attention as resource', 'Boundaries that stick'] },
  { title: 'Chapter 4 — Dialogue under pressure', videos: ['Person vs position', 'De-escalation moves', 'When to exit'] },
]

const allLines = [
  ...rowsForCourse(C101, m101, 'liberty'),
  ...rowsForCourse(C102, m102, 'systems'),
  ...rowsForCourse(C103, m103, 'examined'),
]

console.log(`-- Expanded core courses (101–103): chapters with 3 videos + 5-question MCQ each.
-- Run AFTER migration-lectures-mcq.sql on existing databases.

DELETE FROM lecture_chunks WHERE lecture_id IN (SELECT id FROM lectures WHERE course_id IN ('${C101}','${C102}','${C103}'));
DELETE FROM progress WHERE lecture_id IN (SELECT id FROM lectures WHERE course_id IN ('${C101}','${C102}','${C103}'));
DELETE FROM lectures WHERE course_id IN ('${C101}','${C102}','${C103}');

INSERT INTO lectures (id, course_id, title, mux_asset_id, transcript, order_index, module_sequence, module_title, content_kind, mcq)
VALUES
${allLines.map((l, i) => (i < allLines.length - 1 ? `${l},` : `${l}`)).join('\n')}
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  mux_asset_id = EXCLUDED.mux_asset_id,
  transcript = EXCLUDED.transcript,
  order_index = EXCLUDED.order_index,
  course_id = EXCLUDED.course_id,
  module_sequence = EXCLUDED.module_sequence,
  module_title = EXCLUDED.module_title,
  content_kind = EXCLUDED.content_kind,
  mcq = EXCLUDED.mcq;
`)
