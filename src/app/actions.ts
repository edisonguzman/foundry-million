"use server"

import { db } from "@/db";
import { ideas } from "@/db/schema";
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

  // 1. Stage 1: The Micro-Forge (Fast & Cost-Effective)
  // We use gpt-4o-mini to keep the "free" API burn rate close to zero
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

  // 2. Save the Free Stage 1 data to Neon
  // We use .returning() so we can grab the ID of the newly created idea
  const [newIdea] = await db.insert(ideas).values({
    tileIndex: Math.floor(Math.random() * 1000000), // We will make this sequential later
    problem: problem,
    businessName: aiData.name || "Unknown Startup",
    tagline: aiData.tagline || "Forging in progress...",
    concept: aiData.concept || "Concept generation failed.",
    status: "pending", // It stays 'pending' until they pay for the blueprint
  }).returning(); 

  // 3. Refresh the homepage feed so everyone sees the new idea
  revalidatePath("/");

  // 4. Send the user directly to their new public Blueprint page
  redirect(`/idea/${newIdea.id}`);
}
export async function createCheckoutSession(formData: FormData) {
  const ideaId = formData.get("ideaId") as string;
  if (!ideaId) throw new Error("Idea ID is required");

  // Initialize Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27" as any,
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