import type { Plan } from '@/components/ui/pricing'

/** Illustrative examples only — canonical copy lives in `gfa-brand.ts` / checkout. */
export const GFA_PRICING_PLANS: Plan[] = [
  {
    name: 'Admission',
    info: 'One-time enrollment — unlocks examinations, digital library, Campus, and office hours.',
    display: {
      unit: '$250',
      example: '$250',
    },
    priceCaption: {
      unit: 'USD · one-time',
      example: 'Same · paid once',
    },
    features: [
      { text: 'Access to all examination procedures' },
      { text: 'Digital library & Campus messenger' },
      { text: 'Instructor office hours (scheduling)' },
      {
        text: 'Separate from lecture purchases',
        tooltip: 'Lecture series are bought per course; admission does not replace series fees.',
      },
    ],
    btn: { text: 'Pay on dashboard', href: '/dashboard' },
  },
  {
    name: 'Lecture series',
    info: 'Per series — typically 8–10 lectures, video + transcripts + AI tutor (roadmap).',
    highlighted: true,
    display: {
      unit: '€200',
      example: '~€800',
    },
    priceCaption: {
      unit: 'EUR · per series',
      example: 'EUR · e.g. 4 series / yr',
    },
    features: [
      { text: 'Purchase each series à la carte' },
      { text: 'Progress at your own pace' },
      { text: 'Human-reviewed examination per series' },
      {
        text: '25% revenue share to instructors',
        tooltip: 'Keeps fixed costs low while aligning instructor compensation with delivery.',
      },
    ],
    btn: { text: 'Browse courses', href: '/courses' },
  },
  {
    name: 'Examinations',
    info: 'Certificate and final exams — fees per programme rules.',
    display: {
      unit: 'From €25',
      example: 'Varies',
    },
    priceCaption: {
      unit: 'EUR · per assessment',
      example: 'Depends on path',
    },
    features: [
      { text: '€25 per lecture-series certificate (Bachelor)' },
      { text: '€35 per lecture-series certificate (Master)' },
      { text: '€100 Bachelor · €200 Master final examination' },
      {
        text: 'Oral & project-based formats',
        tooltip: 'Designed for understanding and transfer — not memorisation drills.',
      },
    ],
    btn: { text: 'Exam fees', href: '/examinations' },
  },
]
