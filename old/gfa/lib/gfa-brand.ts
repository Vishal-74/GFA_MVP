/** Canonical product copy aligned with Global Freedom Academy – Master College business plan & documentation. */

export const GFA_INSTITUTION = 'Global Freedom Academy'
export const GFA_SUBTITLE = 'Master College'

export const GFA_MISES_QUOTE =
  'The goal of liberalism is the peaceful cooperation of all men. It aims to peace among nations too'

export const GFA_MISES_ATTRIBUTION = 'Ludwig von Mises'

/** Executive summary (condensed for UI). */
export const GFA_TAGLINE =
  'An international, fully digital institution offering structured Bachelor’s and Master’s programmes grounded in the Austrian School of Economics — with explicit integration of AI and blockchain — at fees far below traditional universities.'

export const GFA_WELCOME_STATEMENT =
  'Here you can study freely and according to your own interests; school diploma not necessary; our outstanding staff and rigorous examination procedures guarantee highest quality standards and excellent career prospects'

export const GFA_ENROLLMENT_PITCH_TITLE = 'Do you want to study?'
export const GFA_ENROLLMENT_PITCH_BODY =
  'Do you want to open up all possibilities for excellent education and career prospects? Education is a valuable asset. To attract the best instructors to our academy, we pay appropriate remuneration. This increases motivation and ensures the highest quality.'

/** User journey step titles + short hints (Ch. 14). */
export const GFA_USER_JOURNEY = [
  {
    step: 1,
    title: 'Homepage / portal',
    body: 'Language selection, welcome, and how the journey works.',
    href: '/',
  },
  {
    step: 2,
    title: 'Program selection',
    body: 'What do you want to study? Degree programmes and progression Bachelor → Master.',
    href: '/programs',
  },
  {
    step: 3,
    title: 'Faculties & instructor offices',
    body: 'Lecture lists by each office, welcome videos, and purchase of lecture blocks (open to everyone).',
    href: '/faculties',
  },
  {
    step: 4,
    title: 'Enrollment',
    body: 'One-time admission fee unlocks all platform features and examination procedures (separate from lecture purchases).',
    href: '/dashboard',
  },
  {
    step: 5,
    title: 'Active participation',
    body: 'Lectures, Campus messenger, digital library, and examinations.',
    href: '/platform',
  },
] as const

export const GFA_BACHELOR_STRUCTURE =
  'Four semesters (flexible, self-paced), two lecture series per semester, eight series in total. Each lecture series has its own examination. Focus: theoretical foundations, methodological clarity, institutional context, and intercultural communication.'

export const GFA_MASTER_STRUCTURE =
  'About three semesters (flexible, self-paced), two lecture series per semester, six series in total. Emphasis on application, analysis, and transfer — including entrepreneurship, media, institutions, and technology.'

export const GFA_EXAM_PHILOSOPHY =
  'Assessments emphasise understanding, analysis, and independent judgment. Oral and project-based formats are central; pure memorisation and standardised multiple-choice are not the focus of degree examinations.'

export const GFA_PLATFORM_FEATURES = [
  'Digital library',
  'Campus messenger (graduates and peers)',
  'Office hours with instructors',
  'Lecture videos with AI-powered translations',
  'Lecture desk setting for instructors',
  'Training bots (instructor-aligned support; avatar languages — roadmap)',
  'AI- and plagiarism-resilient examination procedures',
] as const

/** Ch. 14 — examination types (binding programme logic; formats roll out over time). */
export const GFA_EXAMINATION_FORMATS_DOC = [
  'Oral examinations and interview formats',
  'Presentations with subsequent online discussion',
  'Project and case-based performance assessments',
  'Presentation and discussion formats',
  'Video-documentary community assessments (field studies)',
] as const

/** Documented fee schedule (display; checkout may simulate subset in v1). */
export const GFA_FEE_SCHEDULE = {
  admissionUsd: { amount: '$250', label: 'One-time admission (enrollment) fee' },
  lectureSeriesEur: { amount: '€200', detail: 'Per lecture series (typically 8–10 lectures)' },
  examCertBachelorEur: '€25 per lecture-series certificate (Bachelor)',
  examCertMasterEur: '€35 per lecture-series certificate (Master)',
  finalExamBachelorEur: '€100 final examination (Bachelor)',
  finalExamMasterEur: '€200 final examination (Master)',
  instructorShare: '25% of lecture-series revenue to instructors (performance-based)',
} as const
