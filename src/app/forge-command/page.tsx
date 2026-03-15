import { db } from "@/db";
import { ideas } from "@/db/schema";
import { desc } from "drizzle-orm";
import { deleteIdea, updateOwnerEmail } from "@/app/actions";
import Link from "next/link";

export default async function ForgeCommand() {
  const allIdeas = await db.select().from(ideas).orderBy(desc(ideas.createdAt));

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-end border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-red-500 mb-2 uppercase">Forge Command</h1>
            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Database Management // {allIdeas.length} Tiles Processed</p>
          </div>
          <Link href="/" className="text-blue-500 hover:text-white transition-colors font-mono text-sm">← Back to Site</Link>
        </header>

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
        </div>
      </div>
    </main>
  );
}