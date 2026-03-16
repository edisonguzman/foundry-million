import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ProtectedEmail from "@/components/ProtectedEmail"; // <-- IMPORT THE COMPONENT

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Foundry Million",
  description: "AI-Generated Business Blueprints",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white antialiased flex flex-col min-h-screen`}>
        
        {/* Main Content Area */}
        <div className="flex-grow">
          {children}
        </div>

        {/* Global Footer (Hidden on PDF Prints) */}
        <footer className="print:hidden border-t border-white/10 bg-black py-8 mt-12">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start gap-1">
              <span className="text-gray-500 text-xs font-mono uppercase tracking-widest text-center md:text-left">
                © {new Date().getFullYear()} HowToAttractCustomers.com, LLC. All rights reserved.
              </span>
              {/* --- NEW: PROTECTED EMAIL --- */}
              <div className="text-xs font-mono tracking-widest flex gap-2">
                <span className="text-gray-700 uppercase">Support:</span>
                <ProtectedEmail />
              </div>
            </div>

            <div className="flex gap-6 text-xs font-mono uppercase tracking-widest mt-4 md:mt-0 items-center">
              {/* --- NEW: VAULT LINK --- */}
              <Link href="/vault" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 border border-blue-500/30 px-3 py-1.5 rounded-lg bg-blue-500/5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                My Vault
              </Link>
              
              <Link href="/terms" className="text-gray-500 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}