import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function getLabel(score) {
  if (score <= 25) return 'Weak ❌'
  if (score <= 50) return 'Moderate ⚠️'
  if (score <= 75) return 'Strong ✅'
  return 'Bulletproof 🔥'
}

function getColor(score) {
  if (score <= 25) return '#f87171'
  if (score <= 50) return '#fbbf24'
  if (score <= 75) return '#60a5fa'
  return '#4ade80'
}

const MODE_LABELS = { attack: '⚔️ Attack', defend: '🛡️ Defend', coach: '🎯 Coach' }

export default function ShareCard({ claim, score, topCounterargument, mode }) {
  const [copied, setCopied] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  if (score === null || score === undefined || !claim) return null

  const label = getLabel(score)
  const color = getColor(score)
  const truncClaim = claim.length > 100 ? claim.slice(0, 97) + '…' : claim
  const truncCounter = topCounterargument
    ? topCounterargument.length > 120 ? topCounterargument.slice(0, 117) + '…' : topCounterargument
    : null

  function handleCopy() {
    const modeLabel = MODE_LABELS[mode] ?? mode
    const lines = [
      `⚔️ DebateAI Analysis — ${modeLabel} Mode`,
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
      setTimeout(() => {
        setCopied(false)
        setToastVisible(false)
      }, 2000)
    })
  }

  return (
    <div className="space-y-3">
      {/* Visual card — 16:9 styled */}
      <div
        className="relative rounded-2xl p-5 overflow-hidden flex flex-col justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, #13131a 0%, #0c0c12 100%)',
          border: `1px solid ${color}20`,
          boxShadow: `0 0 28px ${color}0a`,
          minHeight: '200px',
        }}
      >
        {/* Background score watermark */}
        <span
          className="absolute right-5 bottom-3 font-black select-none pointer-events-none leading-none"
          style={{ fontSize: '7rem', color: `${color}07` }}
        >
          {score}
        </span>

        {/* Top row: logo + mode badge */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-base">⚔️</span>
            <span className="text-sm font-bold text-white tracking-tight">DebateAI</span>
          </div>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}
          >
            {MODE_LABELS[mode] ?? mode}
          </span>
        </div>

        {/* Claim */}
        <div className="z-10 space-y-1">
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Argument</p>
          <p className="text-sm text-gray-200 leading-snug">{truncClaim}</p>
        </div>

        {/* Bottom row: counterargument snippet + score */}
        <div className="flex items-end justify-between gap-4 z-10">
          {truncCounter ? (
            <p className="text-[11px] text-gray-600 leading-relaxed flex-1 italic">
              "{truncCounter}"
            </p>
          ) : <div />}
          <div className="text-right shrink-0">
            <div
              className="text-5xl font-black tabular-nums leading-none"
              style={{ color, textShadow: `0 0 24px ${color}50` }}
            >
              {score}
            </div>
            <div className="text-xs font-semibold mt-0.5" style={{ color }}>
              {label}
            </div>
          </div>
        </div>
      </div>

      {/* Copy button + toast */}
      <div className="relative flex justify-end">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 min-h-[40px] rounded-xl text-sm font-medium
                     border border-[#1e1e2e] text-gray-400
                     hover:border-gray-600 hover:text-white hover:bg-[#18181f]
                     transition-all duration-150"
        >
          {copied ? (
            <>
              <span className="text-[#4ade80]">✓</span>
              <span className="text-[#4ade80]">Copied!</span>
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy result
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
              className="absolute bottom-full mb-2 right-0 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.3)',
                color: '#4ade80',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                whiteSpace: 'nowrap',
              }}
            >
              ✅ Copied to clipboard!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
