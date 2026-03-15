import { db } from "@/db";
import { ideas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";

// 1. Dynamic Metadata for SEO
// This ensures every forged idea becomes an indexable search asset
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params;
  const ideaId = parseInt(id);
  
  if (isNaN(ideaId)) return { title: "Not Found" };

  const [idea] = await db.select().from(ideas).where(eq(ideas.id, ideaId));
  
  if (!idea) return { title: "Idea Not Found | Foundry Million" };

  return {
    title: `${idea.businessName} | Foundry Million Blueprint`,
    description: idea.tagline || idea.concept,
  };
}

// 2. The Server Component
export default async function BlueprintPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const ideaId = parseInt(id);

  if (isNaN(ideaId)) notFound();

  // Fetch the specific idea from Neon
  const [idea] = await db.select().from(ideas).where(eq(ideas.id, ideaId));

  if (!idea) notFound();

  // Parse the JSONB data (if it exists) safely
  const businessPlan = typeof idea.businessPlan === 'string' 
    ? JSON.parse(idea.businessPlan) 
    : idea.businessPlan;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20 selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <Link 
          href="/" 
          className="text-gray-500 hover:text-white transition-colors text-sm font-mono uppercase tracking-widest mb-12 inline-flex items-center gap-2"
        >
          ← Return to Forge
        </Link>

        {/* Header Section */}
        <header className="mb-16 pb-12 border-b border-gray-800">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              {idea.businessName}
            </h1>
            <div className="text-right">
              <span className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">
                Asset ID
              </span>
              <span className="inline-block bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-md font-mono text-sm">
                TILE #{idea.tileIndex}
              </span>
            </div>
          </div>
          <p className="text-2xl text-blue-400 font-light tracking-tight mb-8">
            {idea.tagline}
          </p>
          <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Core Concept</h3>
            <p className="text-gray-300 leading-relaxed text-lg">
              {idea.concept}
            </p>
          </div>
        </header>

        {/* Blueprint Details Section */}
        <section className="grid md:grid-cols-2 gap-8">
          {/* We will populate these with actual OpenAI structured data later */}
          <div className="p-8 rounded-2xl border border-white/5 bg-gradient-to-b from-gray-900/40 to-black">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Strategic Blueprint
            </h2>
            {businessPlan ? (
              <pre className="text-gray-400 font-mono text-sm whitespace-pre-wrap">
                {JSON.stringify(businessPlan, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-600 italic">Detailed blueprint data is currently being forged...</p>
            )}
          </div>

          <div className="p-8 rounded-2xl border border-white/5 bg-gradient-to-b from-gray-900/40 to-black">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Market Positioning
            </h2>
            {idea.marketingPlan ? (
              <pre className="text-gray-400 font-mono text-sm whitespace-pre-wrap">
                {JSON.stringify(idea.marketingPlan, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-600 italic">Go-to-market strategy requires a Tier 2 forge sequence.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}