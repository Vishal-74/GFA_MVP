# Global Freedom Academy (GFA) — Platform (PDF-aligned)

A minimalist, AI-powered education platform built with Next.js 14, Supabase, and OpenAI.

## Features

- **AI Tutor**: RAG-powered chatbot that answers questions based on course content
- **Video Learning**: Mux-powered video player with transcripts
- **Rigorous Exams**: Human-reviewed submissions with certificate generation
- **Stripe Payments**: Secure checkout with lifetime course access
- **Beautiful UI**: Minimalist dark theme with amber accents

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Auth & Database**: Supabase (Postgres + Auth + Storage)
- **Payments**: Stripe Checkout + Webhooks
- **Video**: Mux
- **AI**: OpenAI GPT-4o + pgvector for RAG
- **Certificates**: @react-pdf/renderer

## Setup Instructions

### 1. Install Dependencies

```bash
cd old/gfa
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schemas:
   - Execute `supabase/schema.sql` in the SQL Editor
   - Execute `supabase/functions.sql` in the SQL Editor
   - Execute `supabase/storage.sql` in the SQL Editor
3. Enable Google OAuth in Authentication > Providers
4. Copy your project URL and API keys

### 3. Set Up Stripe

1. Create account at [stripe.com](https://stripe.com)
2. Get your API keys from Dashboard > Developers > API keys
3. Set up webhook endpoint pointing to `/api/stripe-webhook`
4. Copy the webhook signing secret

### 4. Set Up Other Services

- **Mux**: Create account at [mux.com](https://mux.com) for video hosting
- **OpenAI**: Get API key from [platform.openai.com](https://platform.openai.com)
- **Resend**: Get API key from [resend.com](https://resend.com) for emails

### 5. Configure Environment Variables

Copy the `.env.local` file and fill in your credentials:

```bash
# Required for the app to run
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_URL=http://localhost:3000

# Optional (needed for full functionality)
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
RESEND_API_KEY=
```

### 6. Seed Sample Data

In your Supabase dashboard, manually insert a test course:

```sql
INSERT INTO courses (slug, title, description, lecturer_name, lecturer_bio, price_cents)
VALUES (
  'intro-to-freedom',
  'Introduction to Freedom',
  'Learn the fundamentals of sovereign thinking and self-directed education.',
  'Dr. John Smith',
  'Philosopher and educator with 20 years of experience.',
  14900
);
```

### 7. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
gfa/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── courses/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       └── learn/page.tsx
│   ├── dashboard/page.tsx
│   ├── exam/[courseId]/page.tsx
│   └── api/
│       ├── checkout/route.ts
│       ├── stripe-webhook/route.ts
│       └── ai-bot/route.ts
├── components/
│   ├── AiBot.tsx
│   ├── CertificateGenerator.tsx
│   ├── EnrollButton.tsx
│   └── LearnClient.tsx
├── lib/
│   ├── supabase.ts
│   ├── stripe.ts
│   ├── openai.ts
│   └── utils.ts
└── supabase/
    ├── schema.sql
    ├── functions.sql
    └── storage.sql
```

## Key Pages

- `/` — Landing page with hero and features
- `/courses` — Course catalogue
- `/courses/[slug]` — Course detail with enrollment
- `/courses/[slug]/learn` — Video player with AI tutor
- `/dashboard` — Student dashboard with enrolled courses
- `/exam/[courseId]` — Exam submission and certificate download
- `/login` & `/signup` — Authentication

## Admin Tasks

### Review Exam Submissions

1. Go to Supabase Dashboard > Storage > exam-submissions
2. Download and review submissions
3. Update exam status in the `exams` table:

```sql
UPDATE exams 
SET status = 'passed', 
    feedback = 'Excellent work!',
    reviewed_at = NOW()
WHERE id = 'exam_id_here';
```

### Add Lecture Content for AI Bot

To enable the AI tutor, you need to embed lecture transcripts:

1. Create chunks from transcripts (~500 tokens each)
2. Generate embeddings using OpenAI
3. Insert into `lecture_chunks` table

Example script (run separately):

```typescript
const chunks = chunkText(transcript, 500)
for (const chunk of chunks) {
  const { data: [{ embedding }] } = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: chunk
  })
  await supabase.from('lecture_chunks').insert({
    lecture_id: lectureId,
    course_id: courseId,
    content: chunk,
    embedding
  })
}
```

## Design Philosophy

- **Minimalist**: Clean, focused interface without distractions
- **Dark theme**: Stone-950 background with amber-500 accents
- **Typography**: Geist Sans for clarity and readability
- **Spacing**: Generous whitespace for breathing room
- **Consistency**: Unified component patterns throughout

## Deploy (Vercel)

This app lives under **`old/gfa`** in the repository. When you import the repo into Vercel, set **Project → Settings → General → Root Directory** to **`old/gfa`**. Vercel will run `npm install` and `npm run build` from that folder (see `vercel.json` and `.nvmrc` for Node 20).

1. Push your branch to GitHub (or GitLab / Bitbucket).
2. In [Vercel](https://vercel.com), **Add New Project** → import the repo → set **Root Directory** to **`old/gfa`**.
3. Under **Environment Variables**, add the same keys you use in `.env.local` for production. At minimum:

   | Variable | Notes |
   |----------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
   | `NEXT_PUBLIC_URL` | Your production site URL, e.g. `https://your-app.vercel.app` |
   | `SUPABASE_SERVICE_ROLE_KEY` | Server-only; optional but recommended for server-side features that bypass RLS (e.g. aggregated catalog counts) |
   | `STRIPE_*`, `OPENAI_API_KEY`, `MUX_*`, `RESEND_API_KEY` | As needed for checkout, AI, video, email |

4. Deploy. From your machine (no global install required):

   ```bash
   cd old/gfa
   npx vercel@latest link    # first time: link to the project whose root is old/gfa
   npx vercel@latest --prod
   ```

Do not commit `.env.local`; configure secrets only in Vercel (or your host) for production.

---

**Built with clarity. Designed for freedom.**
