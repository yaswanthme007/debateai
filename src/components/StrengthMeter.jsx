import { memo, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

function getColor(score) {
  if (score <= 25) return { bar: '#ef4444', glow: 'rgba(239,68,68,0.4)', text: '#f87171' }
  if (score <= 50) return { bar: '#f59e0b', glow: 'rgba(245,158,11,0.4)', text: '#fbbf24' }
  if (score <= 75) return { bar: '#3b82f6', glow: 'rgba(59,130,246,0.4)', text: '#60a5fa' }
  return { bar: '#22c55e', glow: 'rgba(34,197,94,0.4)', text: '#4ade80' }
}

function getLabel(score) {
  if (score <= 25) return 'Weak ❌'
  if (score <= 50) return 'Moderate ⚠️'
  if (score <= 75) return 'Strong ✅'
  return 'Bulletproof 🔥'
}

function CountUp({ target }) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    if (target === null || target === undefined) return

    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setDisplay(target)
      return
    }

    const start = performance.now()
    const duration = 1200

    function tick(now) {
      const elapsed = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - elapsed, 3)
      setDisplay(Math.round(eased * target))
      if (elapsed < 1) frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target])

  return <>{display}</>
}

function StrengthMeter({ score, previousScore }) {
  if (score === null || score === undefined) return null

  const colors = getColor(score)
  const label = getLabel(score)
  const delta = previousScore !== undefined && previousScore !== null ? score - previousScore : null

  return (
    <div className="w-full space-y-2">
      <div className="flex items-end justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          Argument Strength
        </span>
        <div className="flex items-baseline gap-2">
          {delta !== null && (
            <span className="text-xs font-semibold" style={{ color: delta >= 0 ? '#4ade80' : '#f87171' }}>
              {delta >= 0 ? `+${delta} improved` : `${delta} dropped`}
            </span>
          )}
          <span className="text-xs font-medium" style={{ color: colors.text }}>{label}</span>
        </div>
      </div>

      <div className="relative w-full h-3 rounded-full bg-[#1e1e2e] overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: colors.bar, boxShadow: `0 0 10px ${colors.glow}` }}
          initial={{ width: '0%' }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="flex justify-end">
        <span className="text-4xl font-black tabular-nums" style={{ color: colors.text }}>
          <CountUp target={score} />
          <span className="text-xl font-semibold text-gray-500">/100</span>
        </span>
      </div>
    </div>
  )
}

export default memo(StrengthMeter)
