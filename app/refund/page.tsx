import Link from "next/link"

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-5 text-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-emerald-300 hover:text-emerald-200"
        >
          ← Back to Hookory
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hookory Refund Policy
        </h1>
        <p className="text-slate-400 text-xs">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <p className="text-slate-300">
          This Refund Policy explains when Hookory issues refunds for paid
          services.
        </p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-100">
            No Refunds After Service Starts
          </h2>
          <p className="text-slate-300">
            Once a paid service has started or been delivered, we do not provide
            refunds.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-100">
            Refunds When Service Has Not Started
          </h2>
          <p className="text-slate-300">
            If you have paid for a service but it has not started due to a fault
            on Hookory&apos;s side, we will issue a refund for the affected charge.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-100">
            Discount Offer
          </h2>
          <p className="text-slate-300">
            In eligible refund cases, Hookory will also provide a discount for a
            future purchase as a goodwill gesture.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-100">
            How to Request a Refund
          </h2>
          <p className="text-slate-300">
            Please contact Hookory support through the app with your account
            email and payment details so we can review your request.
          </p>
        </section>
      </div>
    </main>
  )
}
