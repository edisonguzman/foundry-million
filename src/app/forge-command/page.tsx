import { db } from "@/db";
import { ideas } from "@/db/schema";
import { desc } from "drizzle-orm";
import { deleteIdea } from "@/app/actions";
import Link from "next/link";

export default async function ForgeCommand() {
  // Fetch ALL ideas, not just the limit of 5 we use on the homepage
  const allIdeas = await db.select().from(ideas).orderBy(desc(ideas.createdAt));

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex justify-between items-end border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-red-500 mb-2">
              FORGE COMMAND
            </h1>
            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
              Authorized Personnel Only // Database Overview
            </p>
          </div>
          <Link href="/" className="text-blue-500 hover:text-white transition-colors font-mono text-sm">
            ← Back to Live Site
          </Link>
        </header>

        <div className="bg-gray-900/40 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 border-b border-white/10 text-gray-400 font-mono text-xs uppercase tracking-wider">
                <th className="p-4">Tile ID</th>
                <th className="p-4">Business Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Votes</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allIdeas.map((idea) => (
                <tr key={idea.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-gray-500">#{idea.tileIndex}</td>
                  <td className="p-4">
                    <p className="font-bold text-white">{idea.businessName}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{idea.problem}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-widest ${idea.status === 'paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                      {idea.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-orange-400">{idea.upvotes}</td>
                  <td className="p-4 text-right">
                    <form action={deleteIdea}>
                      <input type="hidden" name="id" value={idea.id} />
<button 
  type="submit" 
  className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-600 px-4 py-2 rounded border border-red-500/30 hover:border-red-500 transition-all"
>
  Vaporize
</button>
                    </form>
                  </td>
                </tr>
              ))}
              {allIdeas.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                    Database is currently empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}