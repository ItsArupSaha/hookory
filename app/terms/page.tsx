export default function TermsPage() {
    return (
        <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
            <div className="mx-auto max-w-3xl space-y-4 text-sm">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Terms of Service
                </h1>
                <p className="text-slate-400 text-xs">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
                <p className="text-slate-300">
                    Hookory is provided as a subscription SaaS product. By using this
                    service you agree not to misuse the platform, attempt to reverse
                    engineer it, or use it to generate harmful, illegal, or abusive
                    content.
                </p>
                <p className="text-slate-300">
                    You retain ownership of the content you input and the outputs
                    generated for you. We may temporarily store content and outputs to
                    provide features like history, caching, and quality improvements.
                </p>
                <p className="text-slate-300">
                    This page is a lightweight terms draft. Before going to production,
                    you should replace it with language vetted by your legal counsel.
                </p>
            </div>
        </main>
    )
}

