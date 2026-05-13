import { Bell, Search, Wallet } from "lucide-react"

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-main)]/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <label className="relative flex-1">
          <span className="sr-only">Search games</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
          <input
            aria-label="Search games"
            placeholder="Search games..."
            className="w-full rounded-[var(--radius-pill)] border border-[var(--border)] bg-white/5 py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
          />
        </label>
        <button className="rounded-[var(--radius-pill)] border border-[var(--border)] px-3 py-2 text-sm transition hover:bg-white/8">Deposit</button>
        <button className="hidden rounded-[var(--radius-pill)] border border-[var(--border)] px-3 py-2 text-sm md:inline-flex md:items-center md:gap-2">
          <Wallet size={16} /> $8,425
        </button>
        <button aria-label="Notifications" className="rounded-[var(--radius-pill)] border border-[var(--border)] p-2 transition hover:bg-white/8">
          <Bell size={16} />
        </button>
      </div>
    </header>
  )
}
