import { db } from "@/db";
import { ideas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { createCheckoutSession, verifyAccess } from "@/app/actions";
import { cookies } from "next/headers";
import PrintButton from "./PrintButton"; // <-- Imported the new client component

// --- THE PREMIUM RENDERER ---
const DataRenderer = ({ data }: { data: any }) => {
  if (typeof data === 'string' || typeof data === 'number') {
    return <p className="text-gray-300 leading-relaxed text-sm print:text-black">{data}</p>;
  }
  
  if (Array.isArray(data)) {
    return (
      <ul className="list-disc list-outside ml-4 space-y-2 text-gray-300 text-sm print:text-black">
        {data.map((item, i) => (
          <li key={i}><DataRenderer data={item} /></li>
        ))}
      </ul>
    );
  }
  
  if (typeof data === 'object' && data !== null) {
    return (
      <div className="space-y-4 mt-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="border-l border-gray-800 print:border-gray-400 pl-4 py-1 print:break-inside-avoid">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 print:text-gray-800">
              {key.replace(/([A-Z])/g, ' $1').trim()} 
            </h4>
            <DataRenderer data={value} />
          </div>
        ))}
      </div>
    );
  }
  
  return null;
};

// --- DYNAMIC METADATA ---
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

// --- MAIN PAGE COMPONENT ---
export default async function BlueprintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ideaId = parseInt(id);

  if (isNaN(ideaId)) notFound();
  const [idea] = await db.select().from(ideas).where(eq(ideas.id, ideaId));
  if (!idea) notFound();

  // 1. Check if the project is actually paid (Macro-Forge status)
  const isPaid = idea.status === "paid";

  // 2. Check for the Secure Access Cookie
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get(`access_${ideaId}`)?.value === "granted";
  
  const showFullPlan = isPaid && hasAccess;

  // Safely parse JSON
  const businessPlan = typeof idea.businessPlan === 'string' ? JSON.parse(idea.businessPlan) : idea.businessPlan;
  const marketingPlan = typeof idea.marketingPlan === 'string' ? JSON.parse(idea.marketingPlan) : idea.marketingPlan;

  return (
    <main className="min-h-screen bg-black text-white print:bg-white print:text-black px-6 py-20 selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto">
        
        {/* Hides the back button on PDF */}
        <Link href="/" className="print:hidden text-gray-500 hover:text-white transition-colors text-sm font-mono uppercase tracking-widest mb-12 inline-flex items-center gap-2">
          ← Return to Forge
        </Link>

        {/* Public Header */}
        <header className="mb-16 pb-12 border-b border-gray-800 print:border-gray-300">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-500 print:from-black print:to-black bg-clip-text text-transparent print:text-black">
              {idea.businessName}
            </h1>
            <div className="text-right">
              <span className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-1 print:text-gray-800">Asset ID</span>
              <span className={`inline-block px-3 py-1 rounded-md font-mono text-sm border ${isPaid ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(74,222,128,0.2)] print:border-gray-400 print:text-black print:shadow-none print:bg-transparent' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                TILE {idea.tileIndex} OF 1M {isPaid ? "— SECURED" : ""}
              </span>
            </div>
          </div>
          <p className="text-2xl text-blue-400 font-light tracking-tight mb-8 print:text-black">{idea.tagline}</p>
          <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm print:border-gray-300 print:bg-transparent">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-3 print:text-gray-800">Core Concept</h3>
            <p className="text-gray-300 leading-relaxed text-lg print:text-black">{idea.concept}</p>
          </div>
        </header>

        {/* Broadcast Bar (Hidden on PDF) */}
        {showFullPlan && (
          <div className="print:hidden mb-8 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <p className="text-xs font-mono uppercase tracking-widest text-blue-400">Blueprint Broadcast Ready</p>
            </div>
            <div className="flex gap-2">
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just forged a new $1M business blueprint: ${idea.businessName}. Check out Tile #${idea.tileIndex} on @FoundryMillion!`)}&url=${encodeURIComponent(`https://www.foundrymillion.com/idea/${idea.id}`)}`} target="_blank" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">Share on X</a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://www.foundrymillion.com/idea/${idea.id}`)}`} target="_blank" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">LinkedIn</a>
            </div>
          </div>
        )}

        {/* Export Action Bar (Hidden on PDF) */}
        {showFullPlan && (
          <div className="flex justify-end mb-6 print:hidden">
            <PrintButton />
          </div>
        )}

        {/* LOGIC GATE */}
        {showFullPlan ? (
          /* STATE 1: PAID AND VERIFIED (HAS ACCESS) */
          /* Note: The print: classes are merged directly into these existing containers */
          <section className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 print:block print:space-y-8">
            <div className="p-8 rounded-2xl border border-white/5 bg-gradient-to-b from-gray-900/40 to-black shadow-2xl print:border-gray-300 print:bg-none print:shadow-none print:break-inside-avoid">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 border-b border-gray-800 pb-4 print:text-black print:border-gray-300">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] print:hidden"></span> 
                Strategic Blueprint
              </h2>
              <DataRenderer data={businessPlan} />
            </div>
            <div className="p-8 rounded-2xl border border-white/5 bg-gradient-to-b from-gray-900/40 to-black shadow-2xl print:border-gray-300 print:bg-none print:shadow-none print:break-inside-avoid print:mt-8">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 border-b border-gray-800 pb-4 print:text-black print:border-gray-300">
                <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] print:hidden"></span> 
                Market Positioning
              </h2>
              <DataRenderer data={marketingPlan} />
            </div>
          </section>
        ) : (
          /* STATE 2: NO ACCESS (Show both Buy and Unlock options) */
          <section className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto print:hidden">
            
            {/* BUY OPTION */}
            <div className="p-10 rounded-2xl border border-white/10 bg-gray-900/30 text-center flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="w-14 h-14 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Unlock Full Execution Plan
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                Purchase lifetime access to the AI-generated business model and marketing strategy.
              </p>
              
              <form action={createCheckoutSession}>
                <input type="hidden" name="ideaId" value={idea.id} />
                <button type="submit" className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  Unlock Blueprint — $10
                </button>
              </form>
            </div>

            {/* LOGIN / VERIFY OPTION */}
            <div className="p-10 rounded-2xl border border-blue-500/20 bg-gray-900/50 text-center flex flex-col justify-center">
              <div className="w-14 h-14 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Already Purchased?</h2>
              <p className="text-gray-400 text-sm mb-8">Enter the email used at checkout to authenticate your Digital Key.</p>
              
              <form action={verifyAccess} className="flex flex-col gap-3">
                <input type="hidden" name="id" value={idea.id} />
                <input 
                  name="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  required 
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all text-center" 
                />
                <button type="submit" className="w-full bg-blue-600/20 text-blue-400 border border-blue-600/50 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest transition-all">
                  Authenticate
                </button>
              </form>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}