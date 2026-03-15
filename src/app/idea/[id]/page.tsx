import { db } from "@/db";
import { ideas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { createCheckoutSession } from "@/app/actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
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

export default async function BlueprintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ideaId = parseInt(id);

  if (isNaN(ideaId)) notFound();
  const [idea] = await db.select().from(ideas).where(eq(ideas.id, ideaId));
  if (!idea) notFound();

  const isPaid = idea.status === "paid";

  const businessPlan = typeof idea.businessPlan === 'string' ? JSON.parse(idea.businessPlan) : idea.businessPlan;
  const marketingPlan = typeof idea.marketingPlan === 'string' ? JSON.parse(idea.marketingPlan) : idea.marketingPlan;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20 selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-gray-500 hover:text-white transition-colors text-sm font-mono uppercase tracking-widest mb-12 inline-flex items-center gap-2">
          ← Return to Forge
        </Link>

        {/* Public Header - Always Visible */}
        <header className="mb-16 pb-12 border-b border-gray-800">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              {idea.businessName}
            </h1>
            <div className="text-right">
              <span className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Asset ID</span>
              <span className={`inline-block px-3 py-1 rounded-md font-mono text-sm border ${isPaid ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                TILE #{idea.tileIndex} {isPaid ? "— SECURED" : ""}
              </span>
            </div>
          </div>
          <p className="text-2xl text-blue-400 font-light tracking-tight mb-8">{idea.tagline}</p>
          <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Core Concept</h3>
            <p className="text-gray-300 leading-relaxed text-lg">{idea.concept}</p>
          </div>
        </header>

        {/* The Locked/Unlocked Content Section */}
        {isPaid ? (
          <section className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl border border-white/5 bg-gradient-to-b from-gray-900/40 to-black">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Strategic Blueprint
              </h2>
              <pre className="text-gray-400 font-mono text-sm whitespace-pre-wrap">
                {businessPlan ? JSON.stringify(businessPlan, null, 2) : "Blueprint is actively generating. Refresh in 30 seconds."}
              </pre>
            </div>
            <div className="p-8 rounded-2xl border border-white/5 bg-gradient-to-b from-gray-900/40 to-black">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Market Positioning
              </h2>
              <pre className="text-gray-400 font-mono text-sm whitespace-pre-wrap">
                {marketingPlan ? JSON.stringify(marketingPlan, null, 2) : "Marketing strategy is actively generating. Refresh in 30 seconds."}
              </pre>
            </div>
          </section>
        ) : (
          <section className="relative p-12 rounded-2xl border border-white/10 bg-gray-900/20 overflow-hidden text-center flex flex-col items-center justify-center min-h-[400px]">
            {/* Blurred Background to simulate locked content */}
            <div className="absolute inset-0 blur-md opacity-20 pointer-events-none select-none flex flex-col gap-4 p-8">
              <div className="h-6 bg-gray-600 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6 mx-auto"></div>
              <div className="h-4 bg-gray-700 rounded w-4/5 mx-auto"></div>
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3 mx-auto mt-8"></div>
            </div>
            
            <div className="relative z-10 max-w-md mx-auto space-y-6">
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Unlock the Execution Plan</h2>
              <p className="text-gray-400">
                Get the comprehensive, AI-generated business model, target audience breakdown, and step-by-step go-to-market strategy.
              </p>
              
              <form action={createCheckoutSession}>
                <input type="hidden" name="ideaId" value={idea.id} />
                <button type="submit" className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]">
                  Unlock Blueprint — $10
                </button>
              </form>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Secure Checkout via Stripe</p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}