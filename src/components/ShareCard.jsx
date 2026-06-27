import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function getLabel(score) {
  if (score <= 25) return 'WEAK'
  if (score <= 50) return 'MODERATE'
  if (score <= 75) return 'STRONG'
  return 'BULLETPROOF'
}

function getColor(score) {
  if (score <= 25) return 'var(--red-light)'
  if (score <= 50) return 'var(--amber)'
  if (score <= 75) return 'var(--blue-light)'
  return 'var(--green-light)'
}

function getRawColor(score) {
  if (score <= 25) return '#E05040'
  if (score <= 50) return '#E8A020'
  if (score <= 75) return '#4A8FD4'
  return '#38AE72'
}

const MODE_LABELS = { attack: '⚔ Attack', defend: '🛡 Defend', coach: '🎯 Coach' }

export default function ShareCard({ claim, score, topCounterargument, mode }) {
  const [copied, setCopied] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  if (score === null || score === undefined || !claim) return null

  const label = getLabel(score)
  const color = getColor(score)
  const raw = getRawColor(score)
  const truncClaim = claim.length > 100 ? claim.slice(0, 97) + '…' : claim
  const truncCounter = topCounterargument
    ? topCounterargument.length > 120 ? topCounterargument.slice(0, 117) + '…' : topCounterargument
    : null

  function handleCopy() {
    const modeLabel = MODE_LABELS[mode] ?? mode
    const lines = [
      `⚔ DebateAI Analysis — ${modeLabel} Mode`,
      '',
      `📌 Argument: "${claim}"`,
      '',
      `📊 Strength Score: ${score}/100 (${label})`,
      ...(topCounterargument ? ['', `💬 Top counterargument:`, `"${topCounterargument}"`] : []),
      '',
      '─────────────────────────────',
      'Analyzed with DebateAI · Hackverse X 2026',
    ]
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true)
      setToastVisible(true)
      setTimeout(() => { setCopied(false); setToastVisible(false) }, 2000)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Visual card */}
      <div style={{
        position: 'relative', borderRadius: 8, padding: 20, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16,
        background: 'linear-gradient(135deg, var(--bg-raised) 0%, var(--bg-card) 100%)',
        border: `1px solid ${raw}22`,
        boxShadow: `0 0 36px ${raw}09`,
        minHeight: 180,
      }}>
        {/* Watermark score */}
        <span style={{
          position: 'absolute', right: 12, bottom: -8,
          fontFamily: 'var(--font-display)', fontSize: 130, lineHeight: 1,
          color: `${raw}09`, pointerEvents: 'none', userSelect: 'none',
        }}>
          {score}
        </span>

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, letterSpacing: '0.08em', color: 'var(--cream)' }}>
            DEBATE<span style={{ color: 'var(--amber)' }}>AI</span>
          </span>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 3, border: `1px solid ${raw}32`, background: `${raw}10`, color }}>
            {MODE_LABELS[mode] ?? mode}
          </span>
        </div>

        {/* Claim */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5 }}>
            Argument
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--cream-dim)', lineHeight: 1.45 }}>
            {truncClaim}
          </p>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, position: 'relative', zIndex: 1 }}>
          {truncCounter ? (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontStyle: 'italic', color: 'var(--muted-light)', flex: 1, lineHeight: 1.45 }}>
              &ldquo;{truncCounter}&rdquo;
            </p>
          ) : <div />}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 58, lineHeight: 1, color, textShadow: `0 0 32px ${raw}55` }}>
              {score}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.07em', color, marginTop: -4 }}>
              {label}
            </div>
          </div>
        </div>
      </div>

      {/* Copy button */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', minHeight: 38, borderRadius: 6,
            border: '1px solid var(--border-mid)',
            background: 'transparent',
            color: copied ? 'var(--green-light)' : 'var(--muted-light)',
            fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!copied) { e.currentTarget.style.borderColor = 'var(--amber-dim)'; e.currentTarget.style.color = 'var(--amber)'; } }}
          onMouseLeave={e => { if (!copied) { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--muted-light)'; } }}
        >
          {copied ? (
            <><span>✓</span> Copied!</>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy Result
            </>
          )}
        </button>

        <AnimatePresence>
          {toastVisible && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.16 }}
              style={{
                position: 'absolute', bottom: '100%', marginBottom: 8, right: 0,
                padding: '6px 12px', borderRadius: 6,
                background: 'rgba(32,122,80,0.14)', border: '1px solid rgba(32,122,80,0.32)',
                color: 'var(--green-light)', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600,
                boxShadow: '0 4px 16px rgba(0,0,0,0.55)', whiteSpace: 'nowrap',
              }}
            >
              ✓ Copied to clipboard!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
