import Link from "next/link"

export default function PrivacyPage() {
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
          Hookory Privacy Policy
        </h1>
        <p className="text-slate-400 text-xs">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <p className="text-slate-300">
          This Privacy Policy explains how Hookory collects, uses, and protects
          your information when you use our website and services.
        </p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-100">
            Information We Collect
          </h2>
          <ul className="space-y-2 text-slate-300">
            <li>
              Account information (such as email address and authentication
              provider).
            </li>
            <li>
              Usage data (such as plan, usage counters, and feature activity).
            </li>
            <li>
              Content you submit to Hookory and the generated outputs, which may
              be temporarily stored to provide history and improve quality.
            </li>
            <li>
              Billing metadata from our payment provider (such as customer and
              subscription IDs). We do not store full payment card details.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-100">
            How We Use Information
          </h2>
          <ul className="space-y-2 text-slate-300">
            <li>Provide, operate, and improve the Hookory service.</li>
            <li>Process payments and manage subscriptions.</li>
            <li>Maintain security, prevent abuse, and troubleshoot issues.</li>
            <li>Respond to support requests.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-100">
            Sharing and Disclosure
          </h2>
          <p className="text-slate-300">
            We only share data with trusted service providers that help us run
            Hookory (for example, hosting, authentication, and payments). We do
            not sell your personal data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-100">
            Data Retention
          </h2>
          <p className="text-slate-300">
            We retain data for as long as your account is active or as needed to
            provide the service. You can request deletion of your account and
            associated data at any time.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-100">
            Security
          </h2>
          <p className="text-slate-300">
            We use reasonable technical and organizational measures to protect
            your information. No method of transmission or storage is 100%
            secure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-100">
            Children&apos;s Privacy
          </h2>
          <p className="text-slate-300">
            Hookory is not intended for children under 13. We do not knowingly
            collect personal information from children.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-100">
            Changes to This Policy
          </h2>
          <p className="text-slate-300">
            We may update this policy from time to time. We will update the
            &quot;Last updated&quot; date at the top of this page.
          </p>
        </section>
      </div>
    </main>
  )
}

