"use server"

import { db } from "@/db";
import { ideas } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import OpenAI from "openai";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { headers } from "next/headers";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function submitProblem(formData: FormData) {
  const problem = formData.get("problem") as string;
  if (!problem) return;

  // 1. The Micro-Forge
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", 
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are the Architect of Opportunity for Foundry Million. 
        Transform the user's problem into a startup name, a punchy tagline, and a 2-sentence concept. 
        Return ONLY valid JSON with exactly three keys: "name", "tagline", and "concept".`
      },
      {
        role: "user",
        content: `Analyze this problem and forge a high-value solution: ${problem}`
      }
    ]
  });

  const aiResponse = completion.choices[0].message.content;
  if (!aiResponse) throw new Error("Failed to forge idea");

  const aiData = JSON.parse(aiResponse);

  // 2. Find the highest existing Tile ID
  const [lastIdea] = await db
    .select({ tileIndex: ideas.tileIndex })
    .from(ideas)
    .orderBy(desc(ideas.tileIndex))
    .limit(1);

  // If there are no ideas yet, start at 1. Otherwise, add 1 to the highest.
  const nextTileIndex = lastIdea?.tileIndex ? lastIdea.tileIndex + 1 : 1;

  // 3. Save the Free Stage 1 data to Neon with the sequential ID
  const [newIdea] = await db.insert(ideas).values({
    tileIndex: nextTileIndex,
    problem: problem,
    businessName: aiData.name || "Unknown Startup",
    tagline: aiData.tagline || "Forging in progress...",
    concept: aiData.concept || "Concept generation failed.",
    status: "pending", 
  }).returning(); 

  revalidatePath("/");
  redirect(`/idea/${newIdea.id}`);
}
export async function createCheckoutSession(formData: FormData) {
  const ideaId = formData.get("ideaId") as string;
  if (!ideaId) throw new Error("Idea ID is required");

  // Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16" as any, // Changed from 2025-01-27
  });

  // Get the current domain so Stripe knows where to send them back
  const headersList = await headers();
  const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Create the checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Unlock Blueprint: Tile #${ideaId}`,
            description: "Full AI-Generated Business & Marketing Strategy",
          },
          unit_amount: 1000, // $10.00 in cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/idea/${ideaId}?success=true`,
    cancel_url: `${origin}/idea/${ideaId}?canceled=true`,
    metadata: {
      ideaId: ideaId, // Crucial: This tells the webhook WHICH idea to mark as 'paid'
    },
  });

  // Redirect the user to Stripe's hosted checkout page
  if (session.url) {
    redirect(session.url);
  } else {
    throw new Error("Failed to create Stripe session");
  }
}
export async function upvoteIdea(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) return;

  // Atomically increment the vote count directly in the database
  await db.update(ideas)
    .set({ upvotes: sql`${ideas.upvotes} + 1` })
    .where(eq(ideas.id, id));

  revalidatePath("/");
}