import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export const config = { api: { bodyParser: false } }

async function getRawBody(req: NextRequest): Promise<Buffer> {
  const chunks: Uint8Array[] = []
  const reader = req.body?.getReader()
  if (!reader) return Buffer.alloc(0)
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }
  return Buffer.concat(chunks)
}

export async function POST(req: NextRequest) {
  const rawBody = await getRawBody(req)
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] signature failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, plan } = session.metadata || {}
        if (userId && plan) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: plan as any,
              subscriptionId: session.subscription as string,
              subscriptionStatus: 'active',
            },
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const { userId, plan } = sub.metadata || {}
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: sub.status,
              ...(plan ? { plan: plan as any } : {}),
            },
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const { userId } = sub.metadata || {}
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { plan: 'FREE', subscriptionStatus: 'canceled', subscriptionId: null },
          })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } })
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { subscriptionStatus: 'past_due' },
          })
        }
        break
      }
    }
  } catch (err) {
    console.error('[webhook] handler error', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
