import { db } from "@/db";
import { ideas } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import Link from "next/link";
import { submitProblem, upvoteIdea } from "./actions";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const sort = resolvedParams.sort || "newest";
  const isTrending = sort === "trending";
  
  // Pagination Math
  const page = parseInt(resolvedParams.page || "1", 10);
  const pageSize = 15; // Number of tiles per page
  const offset = (page - 1) * pageSize;

  // 1. Fetch total count to determine total pages
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(ideas);
  const totalPages = Math.ceil(Number(count) / pageSize) || 1;

  // 2. Fetch the specific chunk of ideas
  const recentIdeas = await db
    .select()
    .from(ideas)
    .orderBy(isTrending ? desc(ideas.upvotes) : desc(ideas.createdAt))
    .limit(pageSize)
    .offset(offset);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20 selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto">
        
        {/* Hero Section */}
        <header className="mb-20 text-center">
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent">
            FOUNDRY<br/>MILLION
          </h1>
          <p className="text-xl text-blue-400 font-light tracking-[0.2em] uppercase mt-6">
            AI may eliminate jobs — but it could also create one million new companies. Describe a problem you see in the world. AI will generate a business idea to solve it. Help us invent one million businesses for the future.
          </p>
        </header>

{/* The Forge Input */}
        <section className="mb-32">
          <form action={submitProblem} className="relative group">
            
            {/* --- NEW: The Honeypot --- */}
            <input 
              type="text" 
              name="forge_identifier" 
              className="hidden absolute w-0 h-0 opacity-0 pointer-events-none" 
              tabIndex={-1} 
              autoComplete="off" 
            />

            <textarea
              name="problem"
              placeholder="What problem exists in the world that you want to solve today?"
              className="w-full bg-gray-900/50 border-2 border-gray-800 rounded-3xl p-8 text-xl md:text-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none min-h-[200px] placeholder:text-gray-700"
              required
            />
            <button
              type="submit"
              className="absolute bottom-6 right-6 bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-2xl"
            >
              Forge Concept
            </button>
          </form>
       </section>

        {/* Trending/Newest Toggle */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-900 pb-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
            The Public Stream
          </h2>
          <div className="flex bg-gray-900/50 p-1 rounded-lg border border-gray-800">
            <Link 
              href="/?sort=newest" 
              className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${!isTrending ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Newest
            </Link>
            <Link 
              href="/?sort=trending" 
              className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${isTrending ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Trending
            </Link>
          </div>
        </div>

        {/* The Feed */}
        <div className="space-y-6">
          {recentIdeas.map((idea) => (
            <div key={idea.id} className="relative p-6 rounded-2xl border border-white/5 bg-gray-900/20 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-500 flex gap-6">
              
              {/* Upvote Column */}
              <form action={upvoteIdea} className="flex flex-col items-center justify-start pt-1 min-w-[3.5rem]">
                <input type="hidden" name="id" value={idea.id} />
                <button 
                  type="submit" 
                  className="flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl bg-gray-900/50 hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20 text-gray-500 hover:text-orange-400 transition-all cursor-pointer group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform origin-bottom">🔥</span>
                  <span className="font-mono text-sm font-bold">{idea.upvotes}</span>
                </button>
              </form>

              {/* Content Column */}
              <Link href={`/idea/${idea.id}`} className="flex-1 block group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {idea.businessName}
                    </h3>
                    <p className="text-blue-500/80 text-sm font-medium uppercase">{idea.tagline}</p>
                  </div>
                  <span className="text-[10px] font-mono text-gray-700 bg-gray-800/50 px-2 py-1 rounded">
                    TILE {idea.tileIndex} OF 1 Million
                  </span>
                </div>
                <p className="text-gray-400 italic line-clamp-2">"{idea.concept}"</p>
              </Link>
            </div>
          ))}

          {recentIdeas.length === 0 && (
            <div className="py-12 text-center text-gray-500 font-mono text-sm uppercase tracking-widest">
              No concepts forged yet. Be the first.
            </div>
          )}
        </div>

        {/* --- NEW: PAGINATION CONTROLS --- */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-between border-t border-gray-900 pt-8">
            {page > 1 ? (
              <Link 
                href={`/?sort=${sort}&page=${page - 1}`}
                className="px-6 py-2 bg-gray-900/50 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 rounded-xl font-mono text-xs uppercase tracking-widest transition-all"
              >
                ← Previous
              </Link>
            ) : (
              <div className="w-24"></div> /* Empty div to keep centering */
            )}

            <div className="text-gray-600 font-mono text-xs uppercase tracking-widest">
              Page {page} of {totalPages}
            </div>

            {page < totalPages ? (
              <Link 
                href={`/?sort=${sort}&page=${page + 1}`}
                className="px-6 py-2 bg-gray-900/50 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 rounded-xl font-mono text-xs uppercase tracking-widest transition-all"
              >
                Next →
              </Link>
            ) : (
              <div className="w-24"></div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}