import { db } from "@/db";
import { ideas } from "@/db/schema";
import { desc } from "drizzle-orm";
import { submitProblem } from "./actions";
import FoundryGrid from "@/components/FoundryGrid";
import Link from "next/link"; // Added Link import

export default async function Home() {
  const recentIdeas = await db.select().from(ideas).orderBy(desc(ideas.createdAt)).limit(5);

  return (
    <div className="selection:bg-blue-500/30">
      <FoundryGrid />
      
      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-7xl font-black tracking-tighter bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            FOUNDRY MILLION
          </h1>
          <p className="text-gray-400 text-lg font-light tracking-wide max-w-md mx-auto">
            AI may eliminate jobs — but it could also create one million new companies. Describe a problem you see in the world.
AI will generate a business idea to solve it. Help us invent one million businesses for the future.
          </p>
        </div>

        {/* Input Forge */}
        <div className="w-full max-w-xl p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent backdrop-blur-xl shadow-2xl mb-24">
          <form action={submitProblem} className="bg-black/80 p-6 rounded-[calc(1rem-1px)] space-y-4">
            <textarea 
              name="problem"
              placeholder="What problem exists in the world that you want to solve today?"
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none h-32 transition-all resize-none"
              required
            />
            <button 
              type="submit" 
              className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all active:scale-[0.98]"
            >
              Forge Initial Concept (Free)
            </button>
          </form>
        </div>

        {/* Feed of Forged Assets */}
        <div className="w-full max-w-3xl space-y-8">
          <div className="flex items-center gap-4 px-2">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">Live Forge Stream</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
          </div>

          <div className="grid gap-6">
            {recentIdeas.map((idea) => (
              <Link href={`/idea/${idea.id}`} key={idea.id} className="block group">
                <div className="relative p-8 rounded-2xl border border-white/5 bg-gray-900/20 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-500 idea-card-glow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {idea.businessName}
                      </h3>
                      <p className="text-blue-500/80 text-sm font-medium tracking-tight uppercase">
                        {idea.tagline}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-gray-700 bg-gray-800/50 px-2 py-1 rounded">
                      TILE #{idea.tileIndex}
                    </span>
                  </div>
                  <p className="text-gray-400 leading-relaxed font-light italic line-clamp-2">
                    &quot;{idea.concept}&quot;
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}