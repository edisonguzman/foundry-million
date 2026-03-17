import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20 flex flex-col items-center justify-center text-center selection:bg-blue-500/30">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Background 404 text */}
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-gray-900 select-none">
          404
        </h1>
        
        {/* Main Headline */}
        <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent uppercase tracking-tighter mt-[-40px]">
          Blueprint Vaporized
        </h2>
        
        {/* Friendly, lighthearted copy */}
        <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed">
          Well, this is awkward. It looks like this startup concept either pivoted out of existence, ran out of imaginary funding, or the founders just forgot to pay the server bill.
        </p>
        
        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
          But innovation doesn't stop here.
        </p>

        {/* CTA Button */}
        <div className="pt-8">
          <Link 
            href="/"
            className="inline-block bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]"
          >
            ← Return to the Forge
          </Link>
        </div>
        
      </div>
    </main>
  );
}