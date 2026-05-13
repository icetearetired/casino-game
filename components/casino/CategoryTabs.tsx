import { Category } from "./types"

type CategoryTabsProps = {
  categories: Category[]
}

export function CategoryTabs({ categories }: CategoryTabsProps) {
  return (
    <nav aria-label="Game categories" className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`whitespace-nowrap rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] ${
            category.active
              ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]/20 text-[var(--text-primary)]"
              : "border-[var(--border)] text-[var(--text-muted)] hover:bg-white/8 hover:text-[var(--text-primary)]"
          }`}
        >
          {category.label}
        </button>
      ))}
    </nav>
  )
}
