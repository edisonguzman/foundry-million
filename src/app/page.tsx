export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col">
        <h1 className="text-6xl font-bold tracking-tighter mb-4">
          Foundry Million
        </h1>
        <p className="text-xl text-gray-400 mb-8 text-center max-w-2xl">
          Forging 1,000,000 AI-powered business ideas for the new era. 
          Claim your tile and build the future.
        </p>
        
        {/* This is where the Grid will eventually sit */}
        <div className="w-full h-[400px] border border-gray-800 rounded-lg flex items-center justify-center bg-gray-900/50">
          <p className="text-gray-500 italic">Foundry Grid Loading...</p>
        </div>
      </div>
    </main>
  );
}