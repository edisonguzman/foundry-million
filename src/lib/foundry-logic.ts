// src/lib/foundry-logic.ts
import OpenAI from 'openai';

const openai = new OpenAI();

export async function generateMarketingPlan(businessData: { name: string, concept: string }) {
  // Chain 1: Brand Voice & Social Strategy
  const socialResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "system", content: `Create a 30-day social media roadmap for ${businessData.name}.` }]
  });

  // Chain 2: SEO & Content Strategy
  const seoResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "system", content: `Using this social strategy: ${socialResponse.choices[0].message.content}, identify 5 high-traffic keywords and 3 blog post titles.` }]
  });

  // Chain 3: Growth Hacking
  const growthResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "system", content: `Based on the brand ${businessData.name}, suggest 2 unique 'Growth Hack' viral marketing ideas.` }]
  });

  return {
    social: socialResponse.choices[0].message.content,
    seo: seoResponse.choices[0].message.content,
    growth: growthResponse.choices[0].message.content,
  };
}