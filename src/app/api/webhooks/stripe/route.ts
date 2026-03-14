"use server"

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { ideas } from '@/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27' as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  // We use Stripe.Event to override the default global Event
  let event: Stripe.Event; 

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    // We cast this as any or Stripe.Checkout.Session to stop the data error
    const session = event.data.object as any; 
    const ideaId = session.metadata?.ideaId;

    if (ideaId) {
       await db.update(ideas)
        .set({ status: 'paid' })
        .where(eq(ideas.id, Number(ideaId)));
       
       console.log(`Payment confirmed for Idea #${ideaId}`);
    }
  }

  return NextResponse.json({ received: true });
}