import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { ideas } from '@/db/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60; 

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

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

  // Handle successful checkouts
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    
    // --- THE FIX: STRICT PAYMENT VERIFICATION ---
    // A session can be "completed" but "unpaid" if using asynchronous payment methods.
    // We only grant access and fire the AI if the funds have actually cleared.
    if (session.payment_status !== 'paid') {
      console.log(`Session ${session.id} completed, but payment status is '${session.payment_status}'. Blocking access.`);
      return NextResponse.json({ received: true, status: "payment_pending_or_failed" });
    }

    const ideaId = session.metadata?.ideaId;
    const customerEmail = session.customer_details?.email?.toLowerCase().trim();

    if (ideaId && customerEmail) {
      try {
        const [idea] = await db.select().from(ideas).where(eq(ideas.id, Number(ideaId)));
        
        if (idea) {
          // Grab the existing array of buyers, or start a new one
          const currentUnlockedBy = Array.isArray(idea.unlockedBy) ? idea.unlockedBy : [];
          if (!currentUnlockedBy.includes(customerEmail)) {
            currentUnlockedBy.push(customerEmail);
          }

          // SCENARIO A: The plan is ALREADY generated. Just give them access.
          if (idea.status === 'paid') {
            await db.update(ideas)
              .set({ unlockedBy: currentUnlockedBy })
              .where(eq(ideas.id, Number(ideaId)));
            console.log(`Granted access to existing Macro-Forge for Idea #${ideaId}`);
            return NextResponse.json({ received: true });
          }

          // SCENARIO B: First time purchase. Fire OpenAI.
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: `You are an elite enterprise strategist. Generate a highly detailed, professional execution strategy.
                Return ONLY valid JSON with exactly two keys: 
                1. "businessPlan": A detailed JSON object breaking down the business model, target audience, and revenue streams.
                2. "marketingPlan": A detailed JSON object breaking down the go-to-market strategy, acquisition channels, and 30-day roadmap.`
              },
              {
                role: "user",
                content: `Build the blueprint for this company:
                Name: ${idea.businessName}
                Problem solved: ${idea.problem}
                Core Concept: ${idea.concept}`
              }
            ]
          });

          const aiResponse = completion.choices[0].message.content;
          if (aiResponse) {
            const parsedPlans = JSON.parse(aiResponse);

            await db.update(ideas)
              .set({ 
                status: 'paid',
                ownerEmail: idea.ownerEmail || customerEmail, // Set original owner if blank
                unlockedBy: currentUnlockedBy, // Add to access list
                businessPlan: parsedPlans.businessPlan,
                marketingPlan: parsedPlans.marketingPlan,
                tier: 2
              })
              .where(eq(ideas.id, Number(ideaId)));
              
            console.log(`Successfully macro-forged and secured Idea #${ideaId}`);
          }
        }
      } catch (error) {
        console.error("Macro-Forge Failed during webhook execution:", error);
        // Fallback: Ensure the buyer still gets added to the array so they can access it when manually fixed
        const [fallbackIdea] = await db.select().from(ideas).where(eq(ideas.id, Number(ideaId)));
        if (fallbackIdea) {
           const fallbackUnlocked = Array.isArray(fallbackIdea.unlockedBy) ? fallbackIdea.unlockedBy : [];
           if (!fallbackUnlocked.includes(customerEmail)) fallbackUnlocked.push(customerEmail);
           
           await db.update(ideas)
             .set({ status: 'paid', unlockedBy: fallbackUnlocked })
             .where(eq(ideas.id, Number(ideaId)));
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}