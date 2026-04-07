# Global Freedom Academy Setup Guide

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up your `.env.local` file with the credentials (see below)

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Environment Setup

### Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Project Settings > API**
3. Copy your:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

4. Run the database schemas:
   - Go to **SQL Editor** in Supabase
   - Copy and execute `supabase/schema.sql`
   - Copy and execute `supabase/functions.sql`
   - Copy and execute `supabase/storage.sql`
   - Copy and execute `supabase/seed.sql` (demo courses + lectures)

5. **Optional demo user** (Supabase keys in `gfa/.env.local` **or** the parent folder `.env.local`; the parent file overrides placeholders in `gfa/.env.local` for CLI scripts):

```bash
cd gfa && npm run seed:demo
```

Creates **demo@gfa.local** / **demo123456**, enrolls in all demo courses, adds sample progress, and a **passed** exam on the free course so you can open the certificate flow. Override with `SEED_DEMO_EMAIL` and `SEED_DEMO_PASSWORD`.

For frictionless local signups, in Supabase go to **Authentication → Providers → Email** and turn off **Confirm email** (re-enable for production).

6. Enable authentication providers:
   - Go to **Authentication > Providers**
   - Ensure **Email** is enabled for password sign-up and sign-in
   - Optionally enable **Google** (OAuth credentials in Google Cloud Console)
   - Add your site URL to **Redirect URLs**: `http://localhost:3000/**`

### Step 2: Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Go to **Developers > API keys**
3. Copy:
   - `Secret key` → `STRIPE_SECRET_KEY`
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

4. Set up webhook:
   - Go to **Developers > Webhooks**
   - Click **Add endpoint**
   - URL: `https://your-domain.com/api/stripe-webhook` (use ngrok for local testing)
   - Events to listen: `checkout.session.completed`
   - Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### Step 3: OpenAI Setup

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Copy to `OPENAI_API_KEY`

### Step 4: Mux Setup (Optional)

1. Create account at [mux.com](https://mux.com)
2. Go to **Settings > Access Tokens**
3. Create a new token with these permissions:
   - Mux Video: Read, Write
   - Mux Data: Read
4. Copy:
   - `Token ID` → `MUX_TOKEN_ID`
   - `Token Secret` → `MUX_TOKEN_SECRET`

### Step 5: Resend Setup (Optional)

1. Create account at [resend.com](https://resend.com)
2. Go to **API Keys**
3. Create new key → `RESEND_API_KEY`

## Seed Sample Data

Run this in your Supabase SQL Editor:

```sql
-- Insert a sample course
INSERT INTO courses (slug, title, description, lecturer_name, lecturer_bio, price_cents)
VALUES (
  'freedom-philosophy-101',
  'Freedom Philosophy 101',
  'Explore the foundations of individual sovereignty, voluntary association, and self-directed learning.',
  'Dr. Alex Rivera',
  'Political philosopher and educator specializing in libertarian thought and autonomous education systems.',
  14900
);

-- Get the course ID (save this for the next query)
SELECT id FROM courses WHERE slug = 'freedom-philosophy-101';

-- Insert sample lectures (replace <course-id> with the ID from above)
INSERT INTO lectures (course_id, title, mux_asset_id, transcript, order_index)
VALUES
  ('<course-id>', 'What is Freedom?', 'demo-video-id-1', 'Sample transcript for lecture 1...', 1),
  ('<course-id>', 'The Sovereign Individual', 'demo-video-id-2', 'Sample transcript for lecture 2...', 2),
  ('<course-id>', 'Self-Directed Learning', 'demo-video-id-3', 'Sample transcript for lecture 3...', 3);
```

For Mux, upload your videos and replace the `demo-video-id-X` with actual Mux playback IDs.

## Testing Locally

1. Start the dev server:
```bash
npm run dev
```

2. Test the flow:
   - Browse courses at `/courses`
   - Sign up at `/signup`
   - View a course detail page
   - For testing payments, use Stripe test cards:
     - Success: `4242 4242 4242 4242`
     - Any future expiry date and any 3-digit CVC

3. For webhook testing locally, use [ngrok](https://ngrok.com):
```bash
ngrok http 3000
# Update your Stripe webhook URL to the ngrok URL + /api/stripe-webhook
```

## Embedding Lecture Content for AI Bot

The AI bot needs embedded lecture chunks. Here's a sample script:

```typescript
// scripts/embed-lectures.ts
import { openai } from './lib/openai'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function embedLectures() {
  const { data: lectures } = await supabase.from('lectures').select('*')
  
  for (const lecture of lectures) {
    if (!lecture.transcript) continue
    
    const chunks = chunkText(lecture.transcript, 500)
    
    for (const chunk of chunks) {
      const { data: [{ embedding }] } = await openai!.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunk
      })
      
      await supabase.from('lecture_chunks').insert({
        lecture_id: lecture.id,
        course_id: lecture.course_id,
        content: chunk,
        embedding
      })
    }
  }
}

function chunkText(text: string, maxTokens: number): string[] {
  const words = text.split(' ')
  const chunks: string[] = []
  let currentChunk: string[] = []
  
  for (const word of words) {
    currentChunk.push(word)
    if (currentChunk.length >= maxTokens) {
      chunks.push(currentChunk.join(' '))
      currentChunk = []
    }
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '))
  }
  
  return chunks
}

embedLectures()
```

## Deploy to Vercel

1. Push your code to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add all environment variables
4. Update `NEXT_PUBLIC_URL` to your production URL
5. Deploy!

## Troubleshooting

### Build fails with Supabase error
- Make sure all environment variables are set in `.env.local`
- The placeholder values should allow builds to succeed

### Stripe webhook not working locally
- Use ngrok to expose your local server
- Update the webhook URL in Stripe dashboard
- Make sure the signing secret matches

### AI bot not responding
- Check that `supabase/functions.sql` has been executed
- Verify OpenAI API key is valid
- Ensure lecture chunks have been embedded (see script above)

### Videos not playing
- Make sure Mux playback IDs are correct
- Check that videos are set to "public" in Mux dashboard

## File Structure

```
gfa/
├── app/
│   ├── (auth)/              # Auth routes (login, signup)
│   ├── courses/             # Course pages
│   ├── dashboard/           # User dashboard
│   ├── exam/                # Exam submission
│   ├── api/                 # API routes
│   │   ├── ai-bot/          # RAG chatbot endpoint
│   │   ├── checkout/        # Stripe checkout
│   │   └── stripe-webhook/  # Stripe webhook handler
│   └── page.tsx             # Landing page
├── components/              # React components
├── lib/                     # Utilities and clients
└── supabase/               # Database schemas
```

## Design System

- **Background**: stone-950 (almost black)
- **Primary**: amber-500 (vibrant yellow-orange)
- **Text**: stone-50, stone-400 (white and gray)
- **Borders**: stone-800/50 (subtle borders)
- **Cards**: stone-900/30 with backdrop blur
- **Rounded**: 2xl for cards, lg for buttons
- **Typography**: Geist Sans (clean, modern)

Built with minimalism and clarity in mind.
