import { cn } from '@/lib/utils'
import type { Badge } from '../badges'

interface BadgesSectionProps {
  badges: Badge[]
}

export function BadgesSection({ badges }: BadgesSectionProps) {
  if (badges.length === 0) return null

  const unlocked = badges.filter(b => b.unlocked)
  const locked = badges.filter(b => !b.unlocked)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Conquistas</h3>
        <span className="text-xs text-slate-500">{unlocked.length}/{badges.length}</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4">
        {[...unlocked, ...locked].map(badge => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  )
}

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div
      className={cn(
        "flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border w-[86px] text-center transition-all select-none",
        badge.unlocked
          ? "bg-slate-900/80 border-slate-700 shadow-md"
          : "bg-slate-900/20 border-slate-800/40 opacity-35 grayscale"
      )}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
        style={
          badge.unlocked
            ? { backgroundColor: `${badge.color}22`, boxShadow: `0 0 14px ${badge.color}44` }
            : { backgroundColor: '#1e293b' }
        }
      >
        {badge.emoji}
      </div>
      <p
        className={cn(
          "text-[10px] font-semibold leading-tight",
          badge.unlocked ? "text-white" : "text-slate-600"
        )}
      >
        {badge.title}
      </p>
    </div>
  )
}
