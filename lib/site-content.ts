/**
 * Single source of truth for marketing / UI copy. Import here and in pages — change once, updates site-wide.
 * Brand facts & fees stay in `gfa-brand.ts`; this file references them for page-level paragraphs.
 */
import {
  GFA_INSTITUTION,
  GFA_SUBTITLE,
  GFA_EXAM_PHILOSOPHY,
  GFA_FEE_SCHEDULE,
} from '@/lib/gfa-brand'

export const siteCopy = {
  common: {
    institutionLine: `${GFA_INSTITUTION} — ${GFA_SUBTITLE}`,
    platformChapter: 'Platform · Ch. 14',
    masterCollegeChapter: 'Master College · Ch. 14',
    partnersChapter: 'Partners · Ch. 8',
    exploreEyebrow: 'Explore',
    continueCta: 'Continue →',
    openCta: 'Open →',
    openSeriesCta: 'Open series →',
    enterOfficeCta: 'Enter office →',
    viewOfficesCta: 'View offices →',
  },

  home: {
    heroBadge: GFA_INSTITUTION,
    heroTitle: 'Austrian economics, structured degrees, global access',
    howToParticipateEyebrow: 'How to participate',
    journeyHeading: 'From portal to examinations',
    programmeStructureEyebrow: 'Programme structure',
    programmeStructureTitle: 'Bachelor and Master',
    bachelorLabel: 'Bachelor.',
    masterLabel: 'Master.',
    transparentFeesEyebrow: 'Transparent fees',
    platformFeaturesEyebrow: 'Platform (roadmap + live)',
    platformFeaturesTitle: 'Digital campus features',
    enrollmentEyebrow: 'Enrollment',
    chooseProgramme: 'Choose a programme',
    browseLectureSeries: 'Browse lecture series',
    welcomeEyebrow: 'Welcome',
    pillarCards: [
      {
        title: 'Austrian School + future tech',
        body:
          'Coherent economics from individual action and subjective value through money and institutions — supplemented by law, philosophy, and applications in AI and blockchain.',
      },
      {
        title: 'No prior certificates required',
        body:
          'Barrier-free entry worldwide. Modular fees so you invest step by step. Instructors are entrepreneurial partners with performance-based compensation.',
      },
      {
        title: 'Rigorous, AI-resilient exams',
        body: GFA_EXAM_PHILOSOPHY,
      },
    ] as const,
  },

  programs: {
    eyebrow: `${GFA_INSTITUTION} — ${GFA_SUBTITLE}`,
    title: 'Degree programmes',
    description:
      'Clear progression Bachelor → Master: modular digital formats, each lecture series with its own examination. Curricula centre on the Austrian School of Economics, extended with law, philosophy, institutional economics, and future technologies (AI and blockchain). Purchase lecture series individually; the one-time admission fee unlocks examinations, the digital library, Campus messenger, and office hours.',
    empty: 'Run the platform migration and seed to load programs.',
    cardSrOnly: 'View programme details and lecture series',
  },

  programDetail: {
    backToPrograms: '← All programmes',
    pricingSectionTitle: 'How pricing works',
    getPricingBody: () =>
      `Each row is one lecture series (typically 8–10 lectures) you may purchase à la carte. The one-time ${GFA_FEE_SCHEDULE.admissionUsd.amount} admission fee (dashboard) unlocks examinations, library, Campus, and office hours — it does not replace lecture purchases. Examination fees: ${GFA_FEE_SCHEDULE.examCertBachelorEur}; ${GFA_FEE_SCHEDULE.examCertMasterEur}; ${GFA_FEE_SCHEDULE.finalExamBachelorEur}; ${GFA_FEE_SCHEDULE.finalExamMasterEur}.`,
  },

  faculties: {
    eyebrow: 'Explore',
    title: 'Faculties',
    description:
      'Master College maps teaching to faculties and instructor offices — as in the documented user journey: welcome clips as a business card, lecture lists beside each door, and the option for anyone to purchase a lecture block. Programmes are grounded in the Austrian School of Economics with interdisciplinary breadth.',
    empty: 'Run the platform migration and seed to load faculties.',
    cardFallback: 'Explore the instructor offices and lecture series inside this faculty.',
  },

  facultyDetail: {
    back: '← All faculties',
    instructorOffices: 'Instructor offices',
    instructorEmpty: 'No instructors linked yet.',
    instructorCardFallback:
      'Visit the office to see the welcome clip, lecture list, and available office hours.',
  },

  instructorDetail: {
    back: '← Faculties',
    eyebrow: 'Instructor office',
    welcomeTitle: 'Welcome at the door',
    welcomeBody:
      'A short welcome clip introduces this office. Lecture titles below are the series posted next to the door — open any series to purchase or continue learning.',
    lectureListTitle: 'Lecture list',
    emptySeries: 'No lecture series assigned to this instructor yet.',
    openSeriesCta: 'Open series page →',
    footerNote:
      'Office hours booking and the training bot entry point will connect here in a later milestone.',
  },

  courseDetail: {
    backToCatalog: '← Back to courses',
    lockedTitle: 'Purchase required',
    lockedBody:
      'Buy this lecture series (or enroll free if offered) to open the learning area. Admission is separate and unlocks examinations, library, messenger, and office hours.',
    lecturerEyebrow: 'Lecturer',
    lecturerBioFallback: 'Expert educator and practitioner in the field.',
    visitOfficeCta: 'Visit instructor office →',
    syllabusLabel: 'Syllabus',
    lecturesComingSoon: 'Lectures coming soon.',
    asideSeriesEyebrow: 'Lecture series',
    getSeriesPricingBlurb: () =>
      `Lecture series are typically 8–10 videos (${GFA_FEE_SCHEDULE.lectureSeriesEur.amount} per series in the academy fee schedule). Anyone may purchase materials; one payment per series for ongoing access.`,
    admissionEyebrow: 'One-time admission (enrollment) fee',
    getAdmissionUnlockSuffix: () =>
      ` unlocks access to instructor offices, all examination procedures, the digital library, Campus messenger, and office hours — separate from lecture purchases.`,
    admissionDashboardCta: 'Pay admission on dashboard →',
    examFeesEyebrow: 'Examination fees (per academy schedule)',
    aiSupportBullet: 'AI learning support (training bots — roadmap)',
    getVideoCountBullet: (n: number) => `${n} video lectures in this series`,
  },

  courses: {
    catalogEyebrow: 'Catalogue',
    title: 'Lecture series',
    description:
      'Structured programmes with video, transcripts, and an AI tutor grounded in each series — learn at your pace, then prove it in a human-reviewed exam.',
    programsLink: 'Degree programmes',
    seriesSectionTitle: 'Browse series',
    seriesSectionSubtitle:
      'Each row is one purchasable series. Open it for syllabus, pricing, and enrolment.',
    statsSeries: 'Series',
    statsLessons: 'Total lessons',
    statsStatus: 'Status',
    statusSoon: 'Soon',
    statusOpen: 'Open',
    emptySoon: 'We’re preparing new programmes. Check back shortly.',
    emptyOpen: 'Every listing accepts new enrolment — choose a course below.',
    emptyNoCourses: 'No courses yet',
    emptyHint: 'Check back soon — we’re preparing new lecture series.',
    emptyCta: 'Back to programmes',
    lectureSeriesLabel: 'Lecture series',
    cardDescriptionFallback:
      'Video lessons, full transcripts, and a course-aware AI tutor. Human-reviewed exam and certificate when you pass.',
    viewCta: 'View series',
    hoursLabel: (n: number) => `~${n} hrs study`,
  },

  platform: {
    eyebrow: 'Master College · Ch. 14',
    title: 'Digital campus',
    description:
      'Lecture videos, library, training bots, AI-resilient examinations, and Campus — scalable internationally without sacrificing academic standards.',
    coreFeatures: 'Core features',
    examFormats: 'Examination formats (programme)',
    links: [
      { href: '/library', title: 'Digital library', body: 'Texts and references for admitted students.' },
      { href: '/campus', title: 'Campus messenger', body: 'Peer learning and graduate community (rolling out).' },
      { href: '/office-hours', title: 'Office hours', body: 'Instructor Q&A and guidance.' },
      { href: '/examinations', title: 'Examination fees', body: 'Pay per-series certificate and programme final fees.' },
      { href: '/partner-offices', title: 'Partner offices', body: 'Virtual offices for employers and scouts (roadmap).' },
    ] as const,
  },

  about: {
    eyebrow: GFA_INSTITUTION,
    title: 'About the Master College',
    description:
      'A fully digital, international academic institution—structured Bachelor’s and Master’s programmes grounded in the Austrian School of Economics, built for global access and rigorous, AI-resilient assessment.',
    whatIsBuiltTitle: 'What is being built',
    whatIsBuiltP1: `${GFA_SUBTITLE} is designed to function as a complete academic institution—curriculum, examinations, credentialing, and student support—rather than a content marketplace.`,
    whatIsBuiltP2:
      'The platform integrates structured learning paths, instructor-led lecture series, and modular fees that keep entry barriers low while preserving academic seriousness.',
    rigorTitle: 'Academic rigor',
    rigorBullets: [
      'Oral and project-based assessments',
      'Transparent certificate and graduation logic',
      'Scalable delivery without mass-exam shortcuts',
    ] as const,
    audienceCards: [
      { title: 'Students', body: 'Global learners seeking serious programmes in Austrian economics and adjacent disciplines.' },
      { title: 'Instructors', body: 'Independent academic entrepreneurs delivering coherent lecture series and examinations.' },
      { title: 'Partners', body: 'Scouts and companies engaging with talent via virtual offices (roadmap).' },
    ] as const,
    pillarsSectionEyebrow: 'Mission & rigour',
    audienceSectionEyebrow: 'Community',
    audienceSectionTitle: 'Who it’s for',
    ctaHeading: 'Take the next step',
    ctaBody: 'Explore structured programmes or review fees and admissions.',
    ctaProgrammes: 'Programmes',
    ctaPricing: 'Pricing',
  },

  pricing: {
    title: 'Pricing',
    description:
      'A transparent, modular fee structure: one-time admission, per lecture series, per certificate examination, and separate programme final examinations.',
    feeScheduleEyebrow: 'Fee schedule',
    notesEyebrow: 'Notes',
    notes: [
      'Admission unlocks the library, Campus, office hours, and examinations.',
      'Instructor compensation is variable (revenue share), keeping fixed costs low.',
      'Payments are modular: students can progress step-by-step.',
    ] as const,
  },

  faq: {
    title: 'FAQ',
    description: 'Practical answers on admissions, examinations, language support, and how the Master College operates.',
    items: [
      {
        q: 'Do I need a school diploma or prior degree to enroll?',
        a: 'No. The academy is designed to be globally accessible without prior educational certificates.',
      },
      {
        q: 'How do examinations work?',
        a:
          'Examinations are designed to assess understanding, argumentation, and transfer—primarily via oral, project-based, and presentation formats rather than multiple choice.',
      },
      {
        q: 'Is the platform multi-language?',
        a:
          'Yes. The roadmap includes AI translation for lecture content and UI language support; the MVP supports translated lecture experiences and structured international access.',
      },
      {
        q: 'What does the admission fee unlock?',
        a:
          'Admission is a one-time enrollment fee that unlocks platform features such as the digital library, Campus messenger, office hours, and all examination procedures.',
      },
      {
        q: 'Are these state-accredited degrees?',
        a:
          'The platform issues its own academic certificates and proprietary credentials; recognition is driven by quality, rigour, and professional connectivity rather than state accreditation.',
      },
      {
        q: 'Can I study part-time and self-paced?',
        a:
          'Yes. Study is designed to be flexible and international—students progress through lecture series and schedule examinations when ready.',
      },
    ] as const,
  },

  library: {
    eyebrow: 'Platform · Ch. 14',
    title: 'Digital library',
    description:
      'Comprehensive collection of academic resources, texts, and reference materials for enrolled students — as described in the Master College documentation.',
    admittedBody:
      'Curated readings and references will appear here as the academy catalogue grows. You already meet the admission requirement for this area.',
    bullets: [
      'Austrian School primers and institutional economics',
      'Philosophy of freedom and law — cross-links to your lecture series',
      'AI, blockchain, and decentralisation — applied readings (roadmap)',
    ] as const,
    browseCta: 'Browse lecture series →',
  },

  campus: {
    eyebrow: 'Platform · Ch. 14',
    title: 'Campus',
    description:
      'Messenger and community space where students and graduates converse, discuss, and build peer learning networks — 24/7, globally.',
  },

  officeHours: {
    eyebrow: 'Platform · Ch. 14',
    title: 'Office hours',
    description:
      'Scheduled times for direct interaction with instructors — questions, clarifications, and academic guidance.',
    admittedBody:
      "Visit each instructor's office for their welcome clip and lecture list; live office-hour slots will be published per series.",
    facultiesCta: 'Open faculties & offices →',
  },

  examinations: {
    eyebrow: 'Fees · Ch. 8',
    title: 'Examinations & fees',
    description:
      'Modular examination pricing per the business plan: per-series certificate fees and separate programme final fees. Simulated checkout records orders in your database for demos.',
  },

  partnerOffices: {
    eyebrow: 'Partners · Ch. 8',
    title: 'Partner & recruiter offices',
    description: `Entrepreneurs, agencies, and executive search firms will be able to rent a virtual office, present their brand to ${GFA_INSTITUTION} students, and receive applications — fees to be determined per the business plan.`,
    placeholder:
      'This area is a structured placeholder: no payments or listings yet. For partnerships, contact the academy administration through your usual channel.',
    viewProgrammes: 'View programmes',
    home: 'Home',
  },
} as const

export type SiteCopy = typeof siteCopy
