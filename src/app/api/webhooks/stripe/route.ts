import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { ideas } from '@/db/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any, // Changed from 2025-01-27
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Vercel serverless functions time out after 10-15 seconds by default.
// GPT-4o can take a bit longer for heavy tasks, so we explicitly tell Vercel to allow up to 60 seconds.
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const ideaId = session.metadata?.ideaId;

    if (ideaId) {
      try {
        // 1. Fetch the original Stage 1 idea to give the AI context
        const [idea] = await db.select().from(ideas).where(eq(ideas.id, Number(ideaId)));
        
        if (idea) {
          // 2. The Macro-Forge: Fire GPT-4o to build the comprehensive plans
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: `You are an elite enterprise strategist. The user has provided a core business concept. 
                Generate a highly detailed, professional execution strategy.
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

            // 3. Update the database: Mark as paid AND save the generated plans
            await db.update(ideas)
              .set({ 
                status: 'paid',
                businessPlan: parsedPlans.businessPlan,
                marketingPlan: parsedPlans.marketingPlan
              })
              .where(eq(ideas.id, Number(ideaId)));
              
            console.log(`Successfully macro-forged and secured Idea #${ideaId}`);
          }
        }
      } catch (error) {
        console.error("Macro-Forge Failed during webhook execution:", error);
        // Even if generation fails, we should mark them as paid so we can retry or refund them
        await db.update(ideas).set({ status: 'paid' }).where(eq(ideas.id, Number(ideaId)));
      }
    }
  }

  // Always return a 200 quickly so Stripe knows the event was received
  return NextResponse.json({ received: true });
}