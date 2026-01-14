export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-4 text-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-slate-400 text-xs">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <p className="text-slate-300">
          Hookory uses Firebase Authentication and Firestore to store your
          account data and usage information. We do not use device
          fingerprinting or third-party trackers beyond essential infrastructure
          providers.
        </p>
        <p className="text-slate-300">
          We store limited information required to operate the service: your
          email, plan, usage counters, optional saved jobs on paid plans, and
          Stripe customer / subscription IDs. We do not sell your data.
        </p>
        <p className="text-slate-300">
          AI providers may temporarily process your content to generate
          outputs, subject to their own terms. Before production use, you should
          review and update this page to match your actual data practices.
        </p>
      </div>
    </main>
  )
}

