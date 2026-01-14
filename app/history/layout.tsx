import { AppShell } from "@/components/app-shell"
import { ReactNode } from "react"

export default function HistoryLayout({ children }: { children: ReactNode }) {
    return <AppShell>{children}</AppShell>
}
