import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { courseId, courseSlug, priceInCents, userId, courseTitle, userEmail } =
      await req.json()

    if (!courseId || !courseSlug || !priceInCents || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: priceInCents,
          product_data: {
            name: courseTitle || `GFA Course: ${courseSlug}`,
            description: 'Lifetime access with AI tutor and certificate',
          }
        },
        quantity: 1
      }],
      ...(userEmail && typeof userEmail === 'string'
        ? { customer_email: userEmail }
        : {}),
      success_url: `${process.env.NEXT_PUBLIC_URL}/courses/${courseSlug}/learn`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/courses/${courseSlug}`,
      metadata: {
        courseId,
        userId,
        courseSlug,
        courseTitle: (courseTitle || `GFA: ${courseSlug}`).slice(0, 450),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
