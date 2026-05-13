import { Game } from "./types"

export function GameCard({ game }: { game: Game }) {
  return (
    <article className="group overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] transition duration-150 hover:-translate-y-0.5 hover:border-white/25 hover:shadow-[var(--shadow-elevated)]">
      <div className={`h-28 w-full ${game.colorClass}`} />
      <div className="space-y-1 p-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{game.title}</h3>
        <p className="text-xs text-[var(--text-muted)]">{game.subtitle}</p>
        <p className="text-xs text-[var(--accent-green)]">{game.players} playing</p>
      </div>
    </article>
  )
}
