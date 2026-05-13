import Link from "next/link"
import { NavItem } from "./types"

type SidebarNavItemProps = {
  item: NavItem
  active?: boolean
}

export function SidebarNavItem({ item, active }: SidebarNavItemProps) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      aria-label={item.label}
      className={`group flex w-full items-center gap-3 rounded-[var(--radius-pill)] border px-3 py-2 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] ${
        active
          ? "border-[var(--border)] bg-white/8 text-[var(--text-primary)]"
          : "border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-white/6 hover:text-[var(--text-primary)]"
      }`}
    >
      <Icon size={16} className="shrink-0" />
      <span className="truncate">{item.label}</span>
      {item.badge ? <span className="ml-auto rounded-full bg-[var(--accent-blue)]/20 px-2 py-0.5 text-xs">{item.badge}</span> : null}
    </Link>
  )
}
