import { memo, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

function getColor(score) {
  if (score <= 25) return { bar: 'var(--red)',   glow: 'var(--red-glow)',   text: 'var(--red-light)'   }
  if (score <= 50) return { bar: 'var(--amber)', glow: 'var(--amber-glow)', text: 'var(--amber-light)'  }
  if (score <= 75) return { bar: 'var(--blue)',  glow: 'var(--blue-glow)',  text: 'var(--blue-light)'   }
  return               { bar: 'var(--green)', glow: 'var(--green-glow)', text: 'var(--green-light)'  }
}

function getLabel(score) {
  if (score <= 25) return 'WEAK'
  if (score <= 50) return 'MODERATE'
  if (score <= 75) return 'STRONG'
  return 'BULLETPROOF'
}

function CountUp({ target }) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    if (target === null || target === undefined) return
    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setDisplay(target); return }
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
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--muted-light)' }}>
          Argument Strength
        </span>
        {delta !== null && (
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', color: delta >= 0 ? 'var(--green-light)' : 'var(--red-light)' }}>
            {delta >= 0 ? `▲ +${delta} improved` : `▼ ${delta} dropped`}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* Big score number */}
        <div style={{ textAlign: 'center', flexShrink: 0, lineHeight: 1 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 80, lineHeight: 1, color: colors.text, textShadow: `0 0 48px ${colors.glow}` }}>
            <CountUp target={score} />
          </span>
          <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--muted)', marginTop: -4 }}>
            /100
          </span>
        </div>

        {/* Bar + label */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '0.08em', color: colors.text, marginBottom: 10 }}>
            {label}
          </div>
          <div style={{ width: '100%', height: 10, background: 'var(--border-mid)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', backgroundColor: colors.bar, borderRadius: 2, boxShadow: `0 0 14px ${colors.glow}` }}
              initial={{ width: '0%' }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
            {[0, 25, 50, 75, 100].map(v => (
              <span key={v} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.04em' }}>{v}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(StrengthMeter)
