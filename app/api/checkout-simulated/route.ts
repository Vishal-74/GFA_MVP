import { createServerSupabase } from '@/lib/supabase-server'
import { createServiceSupabase } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

type Body = {
  kind?: string
  courseId?: string
  level?: 'bachelor' | 'master'
}

const KINDS = ['admission', 'lecture_series', 'exam_cert', 'final_exam'] as const

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body
    const kind = body.kind
    if (!kind || !KINDS.includes(kind as (typeof KINDS)[number])) {
      return NextResponse.json(
        { error: 'kind must be admission, lecture_series, exam_cert, or final_exam' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createServiceSupabase()
    if (!admin) {
      return NextResponse.json(
        { error: 'Server missing SUPABASE_SERVICE_ROLE_KEY for simulated checkout' },
        { status: 503 }
      )
    }

    if (kind === 'admission') {
      const { data: existing } = await admin
        .from('admissions')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing) {
        return NextResponse.json({ ok: true, already: true, message: 'Already admitted' })
      }

      const { data: priceRow, error: priceErr } = await admin
        .from('pricing_items')
        .select('code, amount_cents, currency')
        .eq('code', 'ADMISSION_USD')
        .single()

      if (priceErr || !priceRow) {
        console.error('checkout-simulated admission pricing:', priceErr)
        return NextResponse.json({ error: 'Admission pricing not configured' }, { status: 500 })
      }

      const { data: order, error: orderErr } = await admin
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'paid',
          provider: 'simulated',
          currency: priceRow.currency,
          total_amount_cents: priceRow.amount_cents,
          paid_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (orderErr || !order) {
        console.error('checkout-simulated admission order:', orderErr)
        return NextResponse.json({ error: 'Could not record order' }, { status: 500 })
      }

      const { error: itemErr } = await admin.from('order_items').insert({
        order_id: order.id,
        sku: 'admission',
        pricing_item_code: priceRow.code,
        unit_amount_cents: priceRow.amount_cents,
        quantity: 1,
      })

      if (itemErr) {
        console.error('checkout-simulated admission item:', itemErr)
        return NextResponse.json({ error: 'Could not record order line' }, { status: 500 })
      }

      const { error: admErr } = await admin.from('admissions').upsert(
        {
          user_id: user.id,
          order_id: order.id,
          paid_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

      if (admErr) {
        console.error('checkout-simulated admission row:', admErr)
        return NextResponse.json({ error: 'Could not unlock admission' }, { status: 500 })
      }

      return NextResponse.json({ ok: true, orderId: order.id })
    }

    if (kind === 'lecture_series') {
      const courseId = body.courseId
      if (!courseId || typeof courseId !== 'string') {
        return NextResponse.json({ error: 'courseId required for lecture_series' }, { status: 400 })
      }

    const { data: course, error: courseErr } = await admin
      .from('courses')
      .select('id, slug, title, price_cents, lecture_series_price_cents, lecture_series_currency')
      .eq('id', courseId)
      .maybeSingle()

    if (courseErr || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (course.price_cents === 0) {
      return NextResponse.json({ error: 'Use free enrollment for this series' }, { status: 400 })
    }

    let cents = course.lecture_series_price_cents
    if (cents == null) {
      const { data: seriesPrice } = await admin
        .from('pricing_items')
        .select('amount_cents')
        .eq('code', 'LECTURE_SERIES_EUR')
        .maybeSingle()
      cents = seriesPrice?.amount_cents ?? 20000
    }

    const currency = course.lecture_series_currency || 'eur'

    const { data: have } = await admin
      .from('lecture_access')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle()

    if (have) {
      return NextResponse.json({
        ok: true,
        already: true,
        slug: course.slug,
        message: 'Already purchased',
      })
    }

    const { data: order, error: orderErr } = await admin
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'paid',
        provider: 'simulated',
        currency,
        total_amount_cents: cents,
        paid_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (orderErr || !order) {
      console.error('checkout-simulated lecture order:', orderErr)
      return NextResponse.json({ error: 'Could not record order' }, { status: 500 })
    }

    const { error: itemErr } = await admin.from('order_items').insert({
      order_id: order.id,
      sku: 'lecture_series',
      pricing_item_code: 'LECTURE_SERIES_EUR',
      course_id: courseId,
      unit_amount_cents: cents,
      quantity: 1,
    })

    if (itemErr) {
      console.error('checkout-simulated lecture item:', itemErr)
      return NextResponse.json({ error: 'Could not record order line' }, { status: 500 })
    }

    const { error: laErr } = await admin.from('lecture_access').upsert(
      {
        user_id: user.id,
        course_id: courseId,
        source: 'purchase',
        order_id: order.id,
      },
      { onConflict: 'user_id,course_id' }
    )

    if (laErr) {
      console.error('checkout-simulated lecture_access:', laErr)
      return NextResponse.json({ error: 'Could not grant access' }, { status: 500 })
    }

    const { error: enrErr } = await admin.from('enrollments').upsert(
      {
        user_id: user.id,
        course_id: courseId,
        stripe_session_id: `simulated:${order.id}`,
      },
      { onConflict: 'user_id,course_id' }
    )

    if (enrErr) {
      console.error('checkout-simulated enrollment:', enrErr)
    }

      return NextResponse.json({ ok: true, orderId: order.id, slug: course.slug })
    }

    if (kind !== 'exam_cert' && kind !== 'final_exam') {
      return NextResponse.json({ error: 'Unsupported checkout kind' }, { status: 400 })
    }

    const level = body.level === 'master' ? 'master' : 'bachelor'

    const { data: admitted } = await admin
      .from('admissions')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!admitted) {
      return NextResponse.json({ error: 'Academy admission required before examination fees' }, { status: 403 })
    }

    if (kind === 'exam_cert') {
      const courseId = body.courseId
      if (!courseId || typeof courseId !== 'string') {
        return NextResponse.json({ error: 'courseId required for exam_cert' }, { status: 400 })
      }

      const { data: access } = await admin
        .from('lecture_access')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle()

      const { data: legacyEnr } = await admin
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle()

      if (!access && !legacyEnr) {
        return NextResponse.json(
          { error: 'Lecture-series access required before paying certificate examination fee' },
          { status: 403 }
        )
      }

      const priceCode = level === 'master' ? 'EXAM_CERT_MASTER_EUR' : 'EXAM_CERT_BACHELOR_EUR'

      const { data: existing } = await admin
        .from('exam_fee_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle()

      if (existing) {
        return NextResponse.json({ ok: true, already: true, message: 'Certificate examination fee already paid' })
      }

      const { data: priceRow, error: priceErr } = await admin
        .from('pricing_items')
        .select('code, amount_cents, currency')
        .eq('code', priceCode)
        .single()

      if (priceErr || !priceRow) {
        console.error('checkout-simulated exam_cert pricing:', priceErr)
        return NextResponse.json({ error: 'Examination pricing not configured' }, { status: 500 })
      }

      const { data: order, error: orderErr } = await admin
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'paid',
          provider: 'simulated',
          currency: priceRow.currency,
          total_amount_cents: priceRow.amount_cents,
          paid_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (orderErr || !order) {
        console.error('checkout-simulated exam_cert order:', orderErr)
        return NextResponse.json({ error: 'Could not record order' }, { status: 500 })
      }

      const { error: itemErr } = await admin.from('order_items').insert({
        order_id: order.id,
        sku: `exam_cert_${level}`,
        pricing_item_code: priceRow.code,
        course_id: courseId,
        unit_amount_cents: priceRow.amount_cents,
        quantity: 1,
      })

      if (itemErr) {
        console.error('checkout-simulated exam_cert item:', itemErr)
        return NextResponse.json({ error: 'Could not record order line' }, { status: 500 })
      }

      const { error: efpErr } = await admin.from('exam_fee_purchases').insert({
        user_id: user.id,
        pricing_item_code: priceCode,
        course_id: courseId,
        order_id: order.id,
      })

      if (efpErr) {
        console.error('checkout-simulated exam_fee_purchases:', efpErr)
        return NextResponse.json({ error: 'Could not record examination fee' }, { status: 500 })
      }

      return NextResponse.json({ ok: true, orderId: order.id })
    }

    const priceCode = level === 'master' ? 'FINAL_EXAM_MASTER_EUR' : 'FINAL_EXAM_BACHELOR_EUR'

    const { data: existingFinal } = await admin
      .from('exam_fee_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('pricing_item_code', priceCode)
      .is('course_id', null)
      .maybeSingle()

    if (existingFinal) {
      return NextResponse.json({ ok: true, already: true, message: 'Final examination fee already paid' })
    }

    const { data: priceRow, error: priceErr } = await admin
      .from('pricing_items')
      .select('code, amount_cents, currency')
      .eq('code', priceCode)
      .single()

    if (priceErr || !priceRow) {
      console.error('checkout-simulated final_exam pricing:', priceErr)
      return NextResponse.json({ error: 'Final examination pricing not configured' }, { status: 500 })
    }

    const { data: order, error: orderErr } = await admin
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'paid',
        provider: 'simulated',
        currency: priceRow.currency,
        total_amount_cents: priceRow.amount_cents,
        paid_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (orderErr || !order) {
      console.error('checkout-simulated final_exam order:', orderErr)
      return NextResponse.json({ error: 'Could not record order' }, { status: 500 })
    }

    const { error: itemErr } = await admin.from('order_items').insert({
      order_id: order.id,
      sku: `final_exam_${level}`,
      pricing_item_code: priceRow.code,
      course_id: null,
      unit_amount_cents: priceRow.amount_cents,
      quantity: 1,
    })

    if (itemErr) {
      console.error('checkout-simulated final_exam item:', itemErr)
      return NextResponse.json({ error: 'Could not record order line' }, { status: 500 })
    }

    const { error: efpErr } = await admin.from('exam_fee_purchases').insert({
      user_id: user.id,
      pricing_item_code: priceCode,
      course_id: null,
      order_id: order.id,
    })

    if (efpErr) {
      console.error('checkout-simulated final_exam efp:', efpErr)
      return NextResponse.json({ error: 'Could not record examination fee' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, orderId: order.id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
