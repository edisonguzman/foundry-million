import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20 selection:bg-blue-500/30">
      <div className="max-w-3xl mx-auto space-y-8 text-gray-300">
        <Link href="/" className="text-gray-500 hover:text-white transition-colors text-sm font-mono uppercase tracking-widest mb-8 inline-flex items-center gap-2">
          ← Return to Forge
        </Link>
        
        <h1 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">Terms of Use & Disclaimers</h1>
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-8">Last Updated: March 2026</p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
          <p className="text-sm leading-relaxed">
            By accessing FoundryMillion.com (the "Site"), operated by HowToAttractCustomers.com, LLC ("Company", "we", "us"), you agree to be bound by these Terms of Use.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">2. AI-Generated Content & Financial Disclaimer</h2>
          <p className="text-sm leading-relaxed text-red-400 font-bold">
            All business concepts, marketing plans, and strategic blueprints generated on this Site are created by artificial intelligence. They are for educational, brainstorming, and entertainment purposes only.
          </p>
          <p className="text-sm leading-relaxed">
            HowToAttractCustomers.com, LLC makes ZERO guarantees regarding the viability, legality, or profitability of any idea generated on this platform. We are not financial advisors, legal professionals, or business brokers. You are solely responsible for conducting your own due diligence before investing time or money into any business venture. We are not liable for any financial losses or damages incurred by acting upon AI-generated output.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">3. Payments & Digital Goods Policy</h2>
          <p className="text-sm leading-relaxed">
            The $10 fee to "Unlock a Blueprint" covers the computational cost of generating the Macro-Forge data via third-party AI APIs. Because this is a consumable digital good delivered instantly upon payment, <strong>all sales are final and non-refundable</strong>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">4. User Authentication (Digital Keys)</h2>
          <p className="text-sm leading-relaxed">
            Access to paid blueprints is secured via the email address provided during the Stripe checkout process. It is your responsibility to maintain access to this email address. We reserve the right to revoke access if fraudulent activity is detected.
          </p>
        </section>

        {/* --- NEW CLAUSE --- */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">5. Content License & Promotional Use</h2>
          <p className="text-sm leading-relaxed">
            By submitting prompts and generating content on the Site (including but not limited to business names, taglines, concepts, and strategic blueprints), you grant HowToAttractCustomers.com, LLC a perpetual, worldwide, royalty-free, irrevocable, non-exclusive license to use, reproduce, display, publish, and distribute that content for any purpose. 
          </p>
          <p className="text-sm leading-relaxed">
            This includes, but is not limited to, utilizing the generated data for advertising, marketing campaigns, social media broadcasting, and Site promotions, without any prior notice, attribution, or financial compensation to you.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">6. Governing Law</h2>
          <p className="text-sm leading-relaxed">
            These Terms shall be governed by the laws of the State of New York, without regard to its conflict of law provisions. Any legal action shall be brought exclusively in the state or federal courts located in New York.
          </p>
        </section>

        <section className="space-y-4 pt-8 border-t border-gray-800">
          <h2 className="text-xl font-bold text-white">Contact Information</h2>
          <p className="text-sm leading-relaxed">
            HowToAttractCustomers.com, LLC<br />
            6 Old Temple Hill Rd.<br />
            Vails Gate, NY 12584<br />
            Phone: 845-940-5369
          </p>
        </section>
      </div>
    </main>
  );
}