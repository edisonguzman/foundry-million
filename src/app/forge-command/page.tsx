import { db } from "@/db";
import { ideas } from "@/db/schema";
import { desc, ilike, or } from "drizzle-orm";
import { deleteIdea, updateOwnerEmail } from "@/app/actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ForgeCommand({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";

  // Build the search filter
  const whereClause = query
    ? or(
        ilike(ideas.businessName, `%${query}%`),
        ilike(ideas.problem, `%${query}%`),
        ilike(ideas.ownerEmail, `%${query}%`),
        ilike(ideas.status, `%${query}%`)
      )
    : undefined;

  // Fetch filtered ideas
  const allIdeas = await db
    .select()
    .from(ideas)
    .where(whereClause)
    .orderBy(desc(ideas.createdAt));

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-end border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-red-500 mb-2 uppercase">Forge Command</h1>
            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Database Management // {allIdeas.length} Tiles Found</p>
          </div>
          <Link href="/" className="text-blue-500 hover:text-white transition-colors font-mono text-sm">← Back to Site</Link>
        </header>

        {/* --- NEW: Search & Export Controls --- */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-gray-900/40 p-4 rounded-xl border border-white/10">
          
          {/* Search Form */}
          <form action="/forge-command" method="GET" className="flex gap-2 w-full md:w-auto">
            <input 
              type="text" 
              name="q" 
              defaultValue={query}
              placeholder="Search tiles, emails, status..." 
              className="bg-black border border-gray-800 rounded px-3 py-2 text-sm text-gray-300 focus:border-blue-500 outline-none w-full md:w-64"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold uppercase transition-colors">
              Search
            </button>
            {query && (
              <Link href="/forge-command" className="flex items-center text-gray-500 hover:text-red-400 text-xs px-2 uppercase font-mono">
                Clear
              </Link>
            )}
          </form>

          {/* Export Form */}
          <form action="/api/export-csv" method="GET" className="flex gap-2 w-full md:w-auto items-center">
            <span className="text-gray-500 text-xs uppercase font-mono mr-2">Export:</span>
            <input 
              type="date" 
              name="startDate" 
              required
              className="bg-black border border-gray-800 rounded px-2 py-1 text-xs text-gray-300 outline-none uppercase font-mono"
            />
            <span className="text-gray-500 text-xs">to</span>
            <input 
              type="date" 
              name="endDate" 
              required
              className="bg-black border border-gray-800 rounded px-2 py-1 text-xs text-gray-300 outline-none uppercase font-mono"
            />
            <button type="submit" className="bg-gray-800 hover:bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors">
              CSV
            </button>
          </form>
        </div>
        {/* --- END NEW CONTROLS --- */}

        <div className="bg-gray-900/40 border border-white/10 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 border-b border-white/10 text-gray-400 font-mono text-[10px] uppercase tracking-wider">
                <th className="p-4">Tile</th>
                <th className="p-4">Asset Name / Problem</th>
                <th className="p-4">Status</th>
                <th className="p-4">Owner Email (Key)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allIdeas.map((idea) => (
                <tr key={idea.id} className="hover:bg-white/5 transition-colors align-top">
                  <td className="p-4 font-mono text-gray-500">#{idea.tileIndex}</td>
                  <td className="p-4 max-w-sm">
                    <p className="font-bold text-white">{idea.businessName}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{idea.problem}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-mono uppercase border ${idea.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                      {idea.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <form action={updateOwnerEmail} className="flex gap-2">
                      <input type="hidden" name="id" value={idea.id} />
                      <input 
                        name="email" 
                        defaultValue={idea.ownerEmail || ""} 
                        placeholder="Assign email..."
                        className="bg-black border border-gray-800 rounded px-2 py-1 text-xs text-gray-300 focus:border-blue-500 outline-none w-48"
                      />
                      <button type="submit" className="text-[10px] bg-gray-800 hover:bg-blue-600 px-2 py-1 rounded transition-colors uppercase font-bold">Save</button>
                    </form>
                  </td>
                  <td className="p-4 text-right">
                    <form action={deleteIdea}>
                      <input type="hidden" name="id" value={idea.id} />
                      <button 
                        type="submit" 
                        className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-600 px-3 py-1 rounded border border-red-500/30 transition-all"
                      >
                        Vaporize
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {allIdeas.length === 0 && (
            <div className="p-8 text-center text-gray-500 font-mono text-sm">
              No tiles found matching your search.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}