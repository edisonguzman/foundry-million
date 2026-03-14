import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foundry Million",
  description: "Forging 1,000,000 AI-powered business ideas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white">
        {children}
      </body>
    </html>
  );
}