import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Badge } from '../badges'

interface BadgesSectionProps {
  badges: Badge[]
  streak: number
  nextHint: string | null
}

export function BadgesSection({ badges, streak, nextHint }: BadgesSectionProps) {
  const [showLocked, setShowLocked] = useState(false)

  // No streak shown for mes_no_azul — the streak indicator replaces it
  const unlockedVisible = badges.filter(b => b.unlocked && (streak === 0 || b.id !== 'mes_no_azul'))
  const locked = badges.filter(b => !b.unlocked)

  if (unlockedVisible.length === 0 && streak === 0 && !nextHint) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Conquistas</h3>
        {locked.length > 0 && (
          <button
            onClick={() => setShowLocked(v => !v)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showLocked ? 'Menos' : 'Ver todas'}
          </button>
        )}
      </div>

      {/* Streak indicator */}
      {streak >= 1 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-950/50 border border-indigo-500/20 rounded-2xl">
          <span className="text-base leading-none">{streak >= 2 ? '🔥' : '✨'}</span>
          <p className="text-xs font-medium text-indigo-200">
            {streak >= 2
              ? `${streak} meses seguidos no azul`
              : 'Mês no azul!'}
          </p>
        </div>
      )}

      {/* Unlocked badges */}
      {unlockedVisible.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4">
          {unlockedVisible.map(badge => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      )}

      {/* Next hint */}
      {nextHint && !showLocked && (
        <p className="text-[11px] text-slate-600 pl-1">{nextHint}</p>
      )}

      {/* Locked badges revealed on "Ver todas" */}
      {showLocked && locked.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4">
          {locked.map(badge => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      )}
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
