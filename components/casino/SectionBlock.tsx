import { Game } from "./types"
import { GameCard } from "./GameCard"

export function SectionBlock({ title, games }: { title: string; games: Game[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  )
}
