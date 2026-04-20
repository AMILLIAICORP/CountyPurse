import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PRICE_IDS = {
  OFFICE: process.env.STRIPE_OFFICE_PRICE_ID,
  REGIONAL: process.env.STRIPE_REGIONAL_PRICE_ID,
}

export async function POST(req) {
  try {
    const { plan, email, name } = await req.json()
    const priceId = PRICE_IDS[plan]
    if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: process.env.NEXT_PUBLIC_SITE_URL + '/dashboard?subscribed=true',
      cancel_url: process.env.NEXT_PUBLIC_SITE_URL + '/pricing',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
