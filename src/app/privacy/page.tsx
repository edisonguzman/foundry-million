import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20 selection:bg-blue-500/30">
      <div className="max-w-3xl mx-auto space-y-8 text-gray-300">
        <Link href="/" className="text-gray-500 hover:text-white transition-colors text-sm font-mono uppercase tracking-widest mb-8 inline-flex items-center gap-2">
          ← Return to Forge
        </Link>
        
        <h1 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">Privacy Policy & GDPR</h1>
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-8">Last Updated: March 2026</p>

        <section className="space-y-4">
          <p className="text-sm leading-relaxed">
            HowToAttractCustomers.com, LLC ("we", "us", or "our") respects your privacy. This policy explains how we collect, use, and protect your data when you use FoundryMillion.com.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">1. Data We Collect</h2>
          <ul className="list-disc list-inside text-sm leading-relaxed space-y-2 ml-2">
            <li><strong>Email Addresses:</strong> Collected solely to act as a "Digital Key" for granting you access to purchased blueprints.</li>
            <li><strong>Payment Information:</strong> Processed entirely by Stripe. We do not store or process your credit card numbers on our servers.</li>
            <li><strong>User Inputs:</strong> The problems or concepts you submit to our AI forge.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">2. How We Use Cookies</h2>
          <p className="text-sm leading-relaxed">
            We use strictly necessary functional cookies (specifically, an authentication token valid for 30 days) to keep your browser authorized to view blueprints you have purchased. We do not use third-party tracking or advertising cookies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">3. Third-Party Service Providers</h2>
          <p className="text-sm leading-relaxed">
            To operate the site, we share limited data with secure third-party processors:
          </p>
          <ul className="list-disc list-inside text-sm leading-relaxed space-y-2 ml-2">
            <li><strong>OpenAI:</strong> Your text inputs are sent to OpenAI to generate the blueprints.</li>
            <li><strong>Stripe:</strong> Handles all secure payment processing and provides us with your receipt email.</li>
            <li><strong>Vercel & Neon Postgres:</strong> Used for hosting the site and storing the text-based blueprint database.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">4. GDPR & Your Rights</h2>
          <p className="text-sm leading-relaxed">
            If you are a resident of the European Economic Area (EEA), you have the right to access, update, or delete your personal information (your email address). Because our database binds purchased assets to your email, requesting deletion of your email will result in the forfeiture of access to your purchased blueprints. To exercise these rights, contact us at the phone number below.
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