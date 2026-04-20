import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    // Try all possible email fields
    const customerEmail = 
      session.customer_email || 
      session.customer_details?.email ||
      null

    console.log('Checkout completed for:', customerEmail)
    console.log('Session amount:', session.amount_total)
    console.log('Session metadata:', session.metadata)

    if (customerEmail) {
      // Get all users and find by email
      const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
      
      if (error) {
        console.error('Error listing users:', error)
        return NextResponse.json({ error: 'Failed to list users' }, { status: 500 })
      }

      const user = data.users.find(u => u.email === customerEmail)
      console.log('Found user:', user?.id)

      if (user) {
        // Office is $499/yr = 49900 cents, Regional is $2400/yr = 240000 cents
        const plan = session.amount_total >= 200000 ? 'REGIONAL' : 'OFFICE'
        
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
          user_metadata: { 
            ...user.user_metadata,
            plan 
          }
        })

        if (updateError) {
          console.error('Error updating user:', updateError)
        } else {
          console.log('Successfully updated', customerEmail, 'to plan:', plan)
        }
      } else {
        console.log('No user found with email:', customerEmail)
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    try {
      const customer = await stripe.customers.retrieve(sub.customer)
      const email = customer.email
      if (email) {
        const { data } = await supabase.auth.admin.listUsers({ perPage: 1000 })
        const user = data.users.find(u => u.email === email)
        if (user) {
          await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: { ...user.user_metadata, plan: 'FREE' }
          })
        }
      }
    } catch (err) {
      console.error('Error handling subscription deleted:', err)
    }
  }

  return NextResponse.json({ received: true })
}
