import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link"; // ADD THIS IMPORT

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
            <div className="text-gray-500 text-xs font-mono uppercase tracking-widest text-center md:text-left">
              © {new Date().getFullYear()} HowToAttractCustomers.com, LLC. All rights reserved.
            </div>
            <div className="flex gap-6 text-xs font-mono uppercase tracking-widest">
              <Link href="/terms" className="text-gray-500 hover:text-white transition-colors">
                Terms & Disclaimers
              </Link>
              <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">
                Privacy & GDPR
              </Link>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}