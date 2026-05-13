import { ActivityItem } from "./types"

type ActivityFeedProps = {
  items: ActivityItem[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
      <h2 className="text-sm font-semibold text-[var(--text-primary)]">Live activity</h2>
      <ul className="mt-3 space-y-2 text-xs">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border border-white/5 bg-white/3 p-2">
            <p className="text-[var(--text-primary)]">{item.user}</p>
            <p className="text-[var(--text-muted)]">{item.action}</p>
            <p className={item.positive ? "text-[var(--accent-green)]" : "text-[var(--danger-red)]"}>{item.amount}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
