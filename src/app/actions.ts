"use server"

import { db } from "@/db";
import { ideas } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import OpenAI from "openai";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { headers } from "next/headers";
import { cookies } from "next/headers";

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

  const nextTileIndex = lastIdea?.tileIndex ? lastIdea.tileIndex + 1 : 1;

  // 3. Save the Free Stage 1 data
  const [newIdea] = await db.insert(ideas).values({
    tileIndex: nextTileIndex,
    problem: problem,
    businessName: aiData.name || "Unknown Startup",
    tagline: aiData.tagline || "Forging in progress...",
    concept: aiData.concept || "Concept generation failed.",
    status: "pending", 
  }).returning(); 

  revalidatePath("/");
  revalidatePath("/forge-command");
  redirect(`/idea/${newIdea.id}`);
}

export async function createCheckoutSession(formData: FormData) {
  const ideaId = formData.get("ideaId") as string;
  if (!ideaId) throw new Error("Idea ID is required");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16" as any,
  });

  const headersList = await headers();
  const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
          unit_amount: 1000, 
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/idea/${ideaId}?success=true`,
    cancel_url: `${origin}/idea/${ideaId}?canceled=true`,
    metadata: {
      ideaId: ideaId, 
    },
  });

  if (session.url) {
    redirect(session.url);
  } else {
    throw new Error("Failed to create Stripe session");
  }
}

export async function verifyAccess(formData: FormData) {
  const id = formData.get("id") as string;
  const emailInput = formData.get("email")?.toString().toLowerCase().trim();

  if (!emailInput || !id) return;

  const [idea] = await db.select().from(ideas).where(eq(ideas.id, Number(id)));

  if (idea) {
    const isOriginalOwner = idea.ownerEmail?.toLowerCase().trim() === emailInput;
    const unlockedList = Array.isArray(idea.unlockedBy) ? idea.unlockedBy : [];
    const isInUnlockedList = unlockedList.includes(emailInput);

    if (isOriginalOwner || isInUnlockedList) {
      const cookieStore = await cookies();
      cookieStore.set(`access_${id}`, "granted", { 
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
      
      revalidatePath(`/idea/${id}`);
      redirect(`/idea/${id}`);
    } else {
      redirect(`/idea/${id}?error=invalid_email`);
    }
  }
}

export async function upvoteIdea(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) return;

  await db.update(ideas)
    .set({ upvotes: sql`${ideas.upvotes} + 1` })
    .where(eq(ideas.id, id));

  revalidatePath("/");
}

export async function deleteIdea(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) return;

  await db.delete(ideas).where(eq(ideas.id, id));

  revalidatePath("/");
  revalidatePath("/forge-command");
}

export async function updateOwnerEmail(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const email = formData.get("email") as string;
  if (isNaN(id)) return;

  await db.update(ideas)
    .set({ ownerEmail: email.toLowerCase().trim() || null })
    .where(eq(ideas.id, id));

  revalidatePath("/forge-command");
  revalidatePath(`/idea/${id}`);
}