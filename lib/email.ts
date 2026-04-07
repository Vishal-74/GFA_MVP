import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY?.trim()
  ? new Resend(process.env.RESEND_API_KEY.trim())
  : null

function fromAddress() {
  return process.env.RESEND_FROM_EMAIL?.trim() || 'onboarding@resend.dev'
}

function adminInbox() {
  return process.env.GFA_ADMIN_EMAIL?.trim() || null
}

const appName = 'Global Freedom Academy'
const baseUrl = process.env.NEXT_PUBLIC_URL?.trim() || 'http://localhost:3000'

export async function sendEnrollmentConfirmation(to: string, courseTitle: string, courseSlug: string) {
  if (!resend || !to) return
  const learnUrl = `${baseUrl}/courses/${courseSlug}/learn`
  await resend.emails.send({
    from: fromAddress(),
    to,
    subject: `${appName} — You're enrolled in ${courseTitle}`,
    html: `
      <p>You now have full access to <strong>${escapeHtml(courseTitle)}</strong>.</p>
      <p><a href="${learnUrl}">Open the course →</a></p>
      <p style="color:#666;font-size:13px;margin-top:24px">${appName}</p>
    `,
  })
}

export async function sendExamSubmittedStudent(to: string, courseTitle: string) {
  if (!resend || !to) return
  await resend.emails.send({
    from: fromAddress(),
    to,
    subject: `${appName} — Exam received`,
    html: `
      <p>We've received your exam answers for <strong>${escapeHtml(courseTitle)}</strong>.</p>
      <p>Faculty typically reviews within 48 hours. You'll get another email when there's a result.</p>
      <p style="color:#666;font-size:13px;margin-top:24px">${appName}</p>
    `,
  })
}

export async function sendExamSubmittedAdmin(courseTitle: string, studentEmail: string, userId: string) {
  const inbox = adminInbox()
  if (!resend || !inbox) return
  await resend.emails.send({
    from: fromAddress(),
    to: inbox,
    subject: `[GFA] New exam submission — ${courseTitle}`,
    html: `
      <p><strong>${escapeHtml(courseTitle)}</strong></p>
      <p>Student: ${escapeHtml(studentEmail)} (${escapeHtml(userId)})</p>
      <p>Review in Supabase Studio → <code>exams</code> table.</p>
    `,
  })
}

export async function sendExamResultStudent(
  to: string,
  courseTitle: string,
  passed: boolean,
  feedback?: string | null
) {
  if (!resend || !to) return
  const subject = passed
    ? `${appName} — You passed: ${courseTitle}`
    : `${appName} — Exam update: ${courseTitle}`
  const certHint = passed
    ? `<p>Your certificate is available when you sign in and open the exam page for this course.</p>`
    : ''
  const fb = feedback?.trim()
    ? `<p><strong>Feedback</strong></p><p>${escapeHtml(feedback)}</p>`
    : ''
  await resend.emails.send({
    from: fromAddress(),
    to,
    subject,
    html: `
      <p>${passed ? 'Congratulations — you passed.' : 'Your submission was reviewed.'}</p>
      <p>Course: <strong>${escapeHtml(courseTitle)}</strong></p>
      ${fb}
      ${certHint}
      <p style="color:#666;font-size:13px;margin-top:24px">${appName}</p>
    `,
  })
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
