export function StatusCard() {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
      <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Tournament starts in</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">02:14:39</p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">Weekly leaderboard reset</p>
    </section>
  )
}
