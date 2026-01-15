import Link from "next/link"

export default function TermsPage() {
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
                    Hookory Terms and Conditions
                </h1>
                <p className="text-slate-400 text-xs">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
                <p className="text-slate-300">
                    These Terms and Conditions govern your use of Hookory. By using
                    the service, you agree to these terms.
                </p>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-slate-100">
                        Eligibility and Account
                    </h2>
                    <p className="text-slate-300">
                        You must provide accurate information and keep your account
                        secure. You are responsible for all activity that occurs under
                        your account.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-slate-100">
                        Service Description
                    </h2>
                    <p className="text-slate-300">
                        Hookory provides AI-assisted content repurposing tools. We
                        may update or change features over time.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-slate-100">
                        Subscriptions and Billing
                    </h2>
                    <p className="text-slate-300">
                        Paid plans are billed on a recurring basis until canceled.
                        Taxes may apply based on your location. You can manage or
                        cancel your subscription in your account settings.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-slate-100">
                        Refunds
                    </h2>
                    <p className="text-slate-300">
                        Refunds are handled according to our Refund Policy. Please
                        review the details on the Refund page.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-slate-100">
                        Content Ownership
                    </h2>
                    <p className="text-slate-300">
                        You own the content you submit and the outputs generated for
                        you. Hookory may temporarily store content to provide history,
                        caching, and service improvements.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-slate-100">
                        Prohibited Use
                    </h2>
                    <p className="text-slate-300">
                        You agree not to misuse the platform, attempt to reverse
                        engineer it, or use it to generate harmful, illegal, or
                        abusive content.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-slate-100">
                        Availability and Disclaimers
                    </h2>
                    <p className="text-slate-300">
                        The service is provided on an &quot;as is&quot; basis without
                        warranties of any kind. We do not guarantee uninterrupted or
                        error-free operation.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-slate-100">
                        Limitation of Liability
                    </h2>
                    <p className="text-slate-300">
                        To the maximum extent permitted by law, Hookory is not liable
                        for indirect, incidental, or consequential damages arising
                        from your use of the service.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-base font-semibold text-slate-100">
                        Changes to These Terms
                    </h2>
                    <p className="text-slate-300">
                        We may update these terms from time to time. We will update
                        the &quot;Last updated&quot; date at the top of this page.
                    </p>
                </section>
            </div>
        </main>
    )
}

