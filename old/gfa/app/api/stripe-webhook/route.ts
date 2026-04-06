import { sendEnrollmentConfirmation } from '@/lib/email'
import { stripe } from '@/lib/stripe'
import { getSupabaseUrl, isSupabaseConfigured } from '@/lib/supabase-env'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const sig = req.headers.get('stripe-signature')
    
    if (!sig) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    const body = await req.text()
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const { courseId, userId, courseSlug, courseTitle } = session.metadata || {}

      if (!courseId || !userId) {
        console.error('Missing metadata in session:', session.id)
        return NextResponse.json({ received: true })
      }

      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

      if (!isSupabaseConfigured() || !serviceKey) {
        console.error('Supabase admin client not configured')
        return NextResponse.json({ received: true })
      }

      const supabaseAdmin = createClient(getSupabaseUrl(), serviceKey)

      const { error } = await supabaseAdmin
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
          stripe_session_id: session.id
        })

      if (error) {
        console.error('Failed to create enrollment:', error)
      } else {
        const { error: accessErr } = await supabaseAdmin.from('lecture_access').upsert(
          {
            user_id: userId,
            course_id: courseId,
            source: 'purchase',
            order_id: null,
          },
          { onConflict: 'user_id,course_id' }
        )
        if (accessErr) {
          console.error('Failed to grant lecture_access:', accessErr)
        }
        let slug = courseSlug || ''
        let title = courseTitle || ''
        if (!slug || !title) {
          const { data: row } = await supabaseAdmin
            .from('courses')
            .select('slug, title')
            .eq('id', courseId)
            .maybeSingle()
          if (row) {
            slug = slug || row.slug
            title = title || row.title
          }
        }
        const { data: userRow } = await supabaseAdmin.auth.admin.getUserById(userId)
        const email =
          userRow.user?.email ||
          session.customer_email ||
          session.customer_details?.email ||
          null
        if (email && title && slug) {
          await sendEnrollmentConfirmation(email, title, slug)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 400 }
    )
  }
}
