import { useState, useEffect, useRef } from 'react'

const DIMS   = ['logic', 'evidence', 'clarity', 'persuasion', 'originality']
const LABELS = ['Logic', 'Evidence', 'Clarity', 'Persuasion', 'Originality']
const ANGLE_OFFSET = -Math.PI / 2
const MAX = 20

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function polarPoint(index, ratio, cx, cy, r) {
  const angle = (2 * Math.PI * index) / 5 + ANGLE_OFFSET
  return {
    x: cx + r * ratio * Math.cos(angle),
    y: cy + r * ratio * Math.sin(angle),
    angle,
  }
}

function pentagonPoints(cx, cy, r, scale = 1) {
  return DIMS.map((_, i) => {
    const pt = polarPoint(i, scale, cx, cy, r)
    return `${pt.x},${pt.y}`
  }).join(' ')
}

function scorePolygon(scores, cx, cy, r, progress = 1) {
  return DIMS.map((dim, i) => {
    const ratio = ((scores?.[dim] ?? 0) / MAX) * progress
    const pt = polarPoint(i, ratio, cx, cy, r)
    return `${pt.x},${pt.y}`
  }).join(' ')
}

// ─── Radar SVG chart ──────────────────────────────────────────────────────────

export function RadarChart({ scores, previousScores, size = 280, animated = true }) {
  const [progress, setProgress]     = useState(animated ? 0 : 1)
  const [prevOpacity, setPrevOpacity] = useState(0)
  const rafRef = useRef(null)

  const l0 = scores?.logic
  const l1 = scores?.evidence
  const l2 = scores?.clarity
  const l3 = scores?.persuasion
  const l4 = scores?.originality

  useEffect(() => {
    cancelAnimationFrame(rafRef.current)
    setPrevOpacity(0)

    if (!animated) {
      setProgress(1)
      if (previousScores) setPrevOpacity(0.5)
      return
    }

    setProgress(0)
    const start = performance.now()
    const duration = 800

    function frame(now) {
      const p = Math.min((now - start) / duration, 1)
      setProgress(1 - Math.pow(1 - p, 3)) // easeOutCubic
      if (p < 1) {
        rafRef.current = requestAnimationFrame(frame)
      }
    }
    rafRef.current = requestAnimationFrame(frame)

    let fadeId
    if (previousScores) {
      fadeId = setTimeout(() => setPrevOpacity(0.5), 350)
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(fadeId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [l0, l1, l2, l3, l4, animated])

  if (!scores) return null

  const cx = size / 2
  const cy = size / 2
  const r  = size * 0.33
  const lr = r * 1.38 // label radius

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block', overflow: 'visible' }}
      aria-label="Argument strength radar chart"
    >
      {/* Guide pentagons */}
      {[0.25, 0.5, 0.75, 1].map(scale => (
        <polygon
          key={scale}
          points={pentagonPoints(cx, cy, r, scale)}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth="0.5"
        />
      ))}

      {/* Axis spokes */}
      {DIMS.map((_, i) => {
        const tip = polarPoint(i, 1, cx, cy, r)
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={tip.x} y2={tip.y}
            stroke="#2a2a2a"
            strokeWidth="0.5"
          />
        )
      })}

      {/* Previous scores overlay (dashed, fades in after 350ms) */}
      {previousScores && (
        <polygon
          points={scorePolygon(previousScores, cx, cy, r, 1)}
          fill="rgba(212,168,83,0.05)"
          stroke="rgba(212,168,83,0.35)"
          strokeWidth="1.5"
          strokeDasharray="4,4"
          style={{ opacity: prevOpacity, transition: 'opacity 0.4s ease' }}
        />
      )}

      {/* Current score polygon */}
      <polygon
        points={scorePolygon(scores, cx, cy, r, progress)}
        fill="rgba(212,168,83,0.15)"
        stroke="#D4A853"
        strokeWidth="2"
      />

      {/* Data-point circles */}
      {DIMS.map((dim, i) => {
        const ratio = ((scores[dim] ?? 0) / MAX) * progress
        const pt = polarPoint(i, ratio, cx, cy, r)
        return (
          <circle key={dim} cx={pt.x} cy={pt.y} r={3.5} fill="#D4A853" />
        )
      })}

      {/* Axis labels */}
      {DIMS.map((_, i) => {
        const { x: lx, y: ly, angle } = polarPoint(i, 1, cx, cy, lr)
        const cosA = Math.cos(angle)
        const sinA = Math.sin(angle)
        const anchor = Math.abs(cosA) < 0.12 ? 'middle' : cosA > 0 ? 'start' : 'end'
        const dy     = sinA < -0.7 ? '-0.3em' : sinA > 0.7 ? '1.1em' : '0.35em'
        return (
          <text
            key={i}
            x={lx} y={ly}
            textAnchor={anchor}
            dy={dy}
            fontSize="11"
            fill="#888"
            fontFamily="var(--font-ui)"
            letterSpacing="0.05em"
          >
            {LABELS[i]}
          </text>
        )
      })}

      {/* Final score values — fade in at end of animation */}
      {progress > 0.6 && DIMS.map((dim, i) => {
        const value = scores[dim] ?? 0
        const { x: px, y: py, angle } = polarPoint(i, value / MAX, cx, cy, r)
        const cosA = Math.cos(angle)
        const sinA = Math.sin(angle)
        const fadeOpacity = Math.max(0, (progress - 0.7) / 0.3)
        return (
          <text
            key={`sv-${dim}`}
            x={px + cosA * 11}
            y={py + sinA * 11}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fontWeight="700"
            fill="#D4A853"
            style={{ opacity: fadeOpacity }}
          >
            {value}
          </text>
        )
      })}
    </svg>
  )
}

// ─── Dimension bars ───────────────────────────────────────────────────────────

export function DimensionBars({ scores }) {
  const [widths, setWidths] = useState(DIMS.map(() => 0))

  const l0 = scores?.logic
  const l1 = scores?.evidence
  const l2 = scores?.clarity
  const l3 = scores?.persuasion
  const l4 = scores?.originality

  useEffect(() => {
    const id = setTimeout(() => {
      setWidths(DIMS.map(k => ((scores?.[k] ?? 0) / MAX) * 100))
    }, 60)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [l0, l1, l2, l3, l4])

  if (!scores) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {DIMS.map((dim, i) => (
        <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 70, fontSize: 11, color: '#888',
              fontFamily: 'var(--font-ui)', letterSpacing: '0.04em',
              textAlign: 'right', flexShrink: 0,
            }}
          >
            {LABELS[i]}
          </span>
          <div
            style={{
              flex: 1, height: 5, borderRadius: 3,
              background: '#2a2a2a', position: 'relative', overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute', inset: '0 auto 0 0',
                width: `${widths[i]}%`,
                background: '#D4A853',
                borderRadius: 3,
                transition: `width 0.6s ease-out ${i * 0.1}s`,
              }}
            />
          </div>
          <span
            style={{
              width: 30, fontSize: 11, color: '#D4A853',
              fontFamily: 'var(--font-mono)', textAlign: 'right', flexShrink: 0,
            }}
          >
            {scores[dim] ?? 0}
          </span>
        </div>
      ))}
    </div>
  )
}
