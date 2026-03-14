// src/app/api/webhooks/stripe/route.ts
import { db } from '@/db';
import { ideas } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import { generateMarketingPlan } from '@/lib/foundry-logic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const payload = await req.text();
  // ... (Standard Stripe signature verification logic here) ...

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const ideaId = session.metadata.ideaId;

    // 1. Fetch Idea from Neon
    const [idea] = await db.select().from(ideas).where(eq(ideas.id, ideaId));

    // 2. Generate the Full Tier 3 Plan
    const fullPlan = await generateMarketingPlan({ name: idea.businessName, concept: idea.concept });

    // 3. Update Neon with the Plan
    await db.update(ideas).set({ 
      marketingPlan: fullPlan,
      tier: 3,
      status: 'completed'
    }).where(eq(ideas.id, ideaId));

    // 4. Email User via Resend
    await resend.emails.send({
      from: 'Edison @ Foundry Million <hello@foundrymillion.com>',
      to: [idea.ownerEmail],
      subject: `Your Foundry Million Marketing Plan: ${idea.businessName}`,
      html: `<h1>Congrats on Tile #${idea.tileIndex}!</h1><p>${fullPlan.social}</p>`
    });
  }

  return new Response('Success', { status: 200 });
}