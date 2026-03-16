import { db } from "@/db";
import { ideas } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { cookies } from "next/headers";
import { loginToVault, logoutFromVault } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function VaultPage() {
  const cookieStore = await cookies();
  const vaultEmail = cookieStore.get("vault_email")?.value;

  // --- STATE 1: NOT LOGGED IN ---
  if (!vaultEmail) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-20 selection:bg-blue-500/30">
        <div className="max-w-md mx-auto mt-20 p-10 rounded-2xl border border-white/10 bg-gray-900/30 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Digital Vault</h1>
          <p className="text-gray-400 text-sm mb-8">Enter your checkout email to access all your unlocked blueprints.</p>
          
          <form action={loginToVault} className="flex flex-col gap-4">
            <input 
              name="email" 
              type="email" 
              placeholder="your@email.com" 
              required 
              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-4 text-white focus:border-blue-500 outline-none transition-all text-center" 
            />
            <button type="submit" className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">
              Access Vault
            </button>
          </form>
        </div>
      </main>
    );
  }

  // --- STATE 2: LOGGED IN (Fetch their tiles) ---
  
  // To avoid complex JSONB dialect issues across different SQL databases, 
  // we fetch all paid ideas and filter them precisely in the server runtime.
  const allPaidIdeas = await db.select().from(ideas).where(eq(ideas.status, "paid")).orderBy(desc(ideas.createdAt));
  
  const userTiles = allPaidIdeas.filter(idea => {
    const isOwner = idea.ownerEmail?.toLowerCase() === vaultEmail;
    const unlockedList = Array.isArray(idea.unlockedBy) ? idea.unlockedBy : [];
    const hasUnlocked = unlockedList.includes(vaultEmail);
    return isOwner || hasUnlocked;
  });

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20 selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-800 pb-6 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2 uppercase">My Vault</h1>
            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
              Secured for: <span className="text-blue-400 lowercase">{vaultEmail}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-white transition-colors font-mono text-xs uppercase tracking-widest">← Return to Forge</Link>
            <form action={logoutFromVault}>
              <button type="submit" className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">
                Lock Vault
              </button>
            </form>
          </div>
        </header>

        {userTiles.length === 0 ? (
          <div className="p-12 text-center border border-gray-800 rounded-2xl bg-gray-900/20">
            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest mb-4">No secured blueprints found for this email.</p>
            <Link href="/" className="inline-block px-6 py-3 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:bg-blue-500 hover:text-white transition-all">
              Forge a New Concept
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {userTiles.map((idea) => (
              <Link key={idea.id} href={`/idea/${idea.id}`} className="block p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-gray-900/40 to-black hover:border-blue-500/50 transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-2 transition-all"></div>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pl-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors mb-1">{idea.businessName}</h3>
                    <p className="text-gray-400 text-sm line-clamp-1">"{idea.tagline}"</p>
                  </div>
                  <div className="text-left md:text-right">
                    <span className="inline-block px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md font-mono text-xs uppercase tracking-widest shadow-[0_0_10px_rgba(74,222,128,0.1)]">
                      Tile #{idea.tileIndex} Unlocked
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}