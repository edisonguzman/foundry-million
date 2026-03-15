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
    const customerEmail = session.customer_details?.email?.toLowerCase().trim(); // Standardize immediately

    if (ideaId) {
      try {
        // 1. Fetch the original Stage 1 idea
        const [idea] = await db.select().from(ideas).where(eq(ideas.id, Number(ideaId)));
        
        if (idea) {
          // 2. The Macro-Forge
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: `You are an elite enterprise strategist. Generate a highly detailed, professional execution strategy.
                Return ONLY valid JSON with exactly two keys: 
                1. "businessPlan": A detailed JSON object.
                2. "marketingPlan": A detailed JSON object.`
              },
              {
                role: "user",
                content: `Build the blueprint for this company:
                Name: ${idea.businessName}
                Problem: ${idea.problem}
                Concept: ${idea.concept}`
              }
            ]
          });

          const aiResponse = completion.choices[0].message.content;
          if (aiResponse) {
            const parsedPlans = JSON.parse(aiResponse);

            // 3. Update database with Plans AND the Owner Email
            await db.update(ideas)
              .set({ 
                status: 'paid',
                ownerEmail: customerEmail, // The Digital Key
                businessPlan: parsedPlans.businessPlan,
                marketingPlan: parsedPlans.marketingPlan
              })
              .where(eq(ideas.id, Number(ideaId)));
              
            console.log(`Successfully macro-forged and secured Idea #${ideaId}`);
          }
        }
      } catch (error) {
        console.error("Macro-Forge Failed:", error);
        // CRITICAL FIX: Even if AI fails, save the email so the user can at least access the page
        // We set status to 'paid' so you can manually trigger a re-run later if needed.
        await db.update(ideas)
          .set({ 
            status: 'paid', 
            ownerEmail: customerEmail 
          })
          .where(eq(ideas.id, Number(ideaId)));
      }
    }
  }

  return NextResponse.json({ received: true });
}