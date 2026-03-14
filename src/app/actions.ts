"use server"

import { revalidatePath } from "next/cache";
import { db } from "../db"
import { ideas } from "../db/schema"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function submitProblem(formData: FormData) {
  const problem = formData.get("problem") as string
  
  // 1. Ask the AI for the business idea
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are the Architect of Opportunity. Transform a problem into a startup name, a punchy tagline, and a 2-sentence concept. Format as JSON." },
      { role: "user", content: `Problem: ${problem}` }
    ],
    response_format: { type: "json_object" }
  })

  const aiData = JSON.parse(completion.choices[0].message.content || "{}")

  // 2. Save the real AI data to Neon
  await db.insert(ideas).values({
    tileIndex: Math.floor(Math.random() * 1000000),
    problem: problem,
    businessName: aiData.name || "Unknown Startup",
    tagline: aiData.tagline || "",
    concept: aiData.concept || "",
    tier: 1,
    status: "paid",
  })

  console.log(`Successfully forged: ${aiData.name}`)
  revalidatePath("/");
}