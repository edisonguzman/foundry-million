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
  const honeypot = formData.get("forge_identifier"); // Catch the bots

  // 1. The Honeypot Check: If a bot filled this, silently abort.
  if (honeypot || !problem) return;

  // 2. The Micro-Forge with Built-in Spam Detection
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", 
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are the Architect of Opportunity for Foundry Million. First, evaluate the user's input. If it is promotional spam, an advertisement, gibberish, or harmful, return ONLY this JSON: {"is_valid": false}. If it is a legitimate problem or concept, transform it into a startup name, a punchy tagline, and a 2-sentence concept. Return valid JSON with exactly four keys: "is_valid" (true), "name", "tagline", and "concept".`
      },
      {
        role: "user",
        content: `Analyze this input: ${problem}`
      }
    ]
  });

  const aiResponse = completion.choices[0].message.content;
  if (!aiResponse) throw new Error("Failed to forge idea");

  const aiData = JSON.parse(aiResponse);

  // 3. The Gatekeeper Check: If the AI flagged it as spam, silently abort.
  if (aiData.is_valid === false) {
    console.warn("Spam or promotional content rejected by AI Engine.");
    return; 
  }

  // 4. Find the highest existing Tile ID
  const [lastIdea] = await db
    .select({ tileIndex: ideas.tileIndex })
    .from(ideas)
    .orderBy(desc(ideas.tileIndex))
    .limit(1);

  const nextTileIndex = lastIdea?.tileIndex ? lastIdea.tileIndex + 1 : 1;

  // 5. Save the Free Stage 1 data
  const [newIdea] = await db.insert(ideas).values({
    tileIndex: nextTileIndex,
    problem: problem,
    businessName: aiData.name || "Unknown Startup",
    tagline: aiData.tagline || "Forging in progress...",
    concept: aiData.concept || "Concept generation failed.",
    status: "pending", 
  }).returning(); 

  revalidatePath("/", "layout");
  revalidatePath("/forge-command", "layout");
  redirect(`/idea/${newIdea.id}`);
}

  const aiResponse = completion.choices[0].message.content;
  if (!aiResponse) throw new Error("Failed to forge idea");

  const aiData = JSON.parse(aiResponse);

  // 3. The Gatekeeper Check: If the AI flagged it as spam, silently abort.
  if (aiData.is_valid === false) {
    console.warn("Spam or promotional content rejected by AI Engine.");
    return; 
  }

  // 4. Find the highest existing Tile ID
  const [lastIdea] = await db
    .select({ tileIndex: ideas.tileIndex })
    .from(ideas)
    .orderBy(desc(ideas.tileIndex))
    .limit(1);

  const nextTileIndex = lastIdea?.tileIndex ? lastIdea.tileIndex + 1 : 1;

  // 5. Save the Free Stage 1 data
  const [newIdea] = await db.insert(ideas).values({
    tileIndex: nextTileIndex,
    problem: problem,
    businessName: aiData.name || "Unknown Startup",
    tagline: aiData.tagline || "Forging in progress...",
    concept: aiData.concept || "Concept generation failed.",
    status: "pending", 
  }).returning(); 

  revalidatePath("/", "layout");
  revalidatePath("/forge-command", "layout");
  redirect(`/idea/${newIdea.id}`);
}

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

  const cookieStore = await cookies();
  const voteCookieName = `voted_${id}`;
  const hasVoted = cookieStore.get(voteCookieName)?.value;

  // 1. The Gatekeeper: If the cookie exists, silently reject the vote
  if (hasVoted) {
    console.log(`Vote blocked: User already voted on Idea #${id}`);
    return;
  }

  // 2. Process the vote in the database
  await db.update(ideas)
    .set({ upvotes: sql`${ideas.upvotes} + 1` })
    .where(eq(ideas.id, id));

  // 3. Drop the enforcement cookie (Locks them out for 1 year)
  cookieStore.set(voteCookieName, "true", {
    maxAge: 60 * 60 * 24 * 365, // 1 year in seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  // 4. Update the UI caches
  revalidatePath("/");
  revalidatePath(`/idea/${id}`);
}

export async function deleteIdea(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) return;

  await db.delete(ideas).where(eq(ideas.id, id));

  // The "layout" parameter forces Next.js to purge all cached variants (like ?sort=trending & pages)
  // and clears the client-side router cache so the main feed updates instantly.
  revalidatePath("/", "layout");
  revalidatePath("/forge-command", "layout");
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
export async function loginToVault(formData: FormData) {
  const email = formData.get("email")?.toString().toLowerCase().trim();
  if (!email) return;

  const cookieStore = await cookies();
  
  // Set a secure vault session cookie valid for 30 days
  cookieStore.set("vault_email", email, {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  revalidatePath("/vault");
  redirect("/vault");
}

export async function logoutFromVault() {
  const cookieStore = await cookies();
  cookieStore.delete("vault_email");
  
  revalidatePath("/vault");
  redirect("/vault");
}