import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebateAI } from '../hooks/useDebateAI'
import ModeSelector from './ModeSelector'
import StrengthMeter from './StrengthMeter'
import FallacyDetector from './FallacyDetector'
import TopicPresets from './TopicPresets'

const MAX_CHARS = 500

function getScore(mode, result) {
  if (!result) return null
  if (mode === 'attack') return result.strength_score ?? null
  if (mode === 'defend') return result.improved_score ?? null
  if (mode === 'coach') return result.new_score ?? null
  return null
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreBadge({ score }) {
  if (score === null || score === undefined) return null
  const color =
    score <= 25 ? '#f87171' : score <= 50 ? '#fbbf24' : score <= 75 ? '#60a5fa' : '#4ade80'
  return (
    <span
      className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full shrink-0"
      style={{ color, background: `${color}18`, border: `1px solid ${color}35` }}
    >
      {score}/100
    </span>
  )
}

function ModeBadge({ mode }) {
  const styles = {
    attack: 'text-red-400 bg-red-900/25 border-red-800/40',
    defend: 'text-blue-400 bg-blue-900/25 border-blue-800/40',
    coach: 'text-green-400 bg-green-900/25 border-green-800/40',
  }
  const labels = { attack: '⚔️ Attack', defend: '🛡️ Defend', coach: '🎯 Coach' }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${styles[mode] ?? styles.attack}`}>
      {labels[mode] ?? mode}
    </span>
  )
}

function HistoryCard({ entry, index }) {
  const [expanded, setExpanded] = useState(false)
  const score = getScore(entry.mode, entry.result)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25 }}
      className="rounded-xl border border-[#1e1e2e] overflow-hidden"
      style={{ background: '#0f0f14' }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#13131a] transition-colors"
      >
        <span className="flex-1 text-xs text-gray-500 truncate min-w-0">{entry.claim}</span>
        <ScoreBadge score={score} />
        <ModeBadge mode={entry.mode} />
        <span
          className="text-gray-600 text-[10px] shrink-0 transition-transform duration-200"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 space-y-3 border-t border-[#1e1e2e]">
              <p className="text-xs text-gray-400 leading-relaxed">{entry.claim}</p>

              {entry.mode === 'attack' && entry.result.counterarguments?.[0] && (
                <div
                  className="p-3 rounded-lg text-xs text-gray-300 leading-relaxed"
                  style={{ background: '#0a0606', borderLeft: '2px solid #ef4444' }}
                >
                  {entry.result.counterarguments[0]}
                </div>
              )}
              {entry.mode === 'defend' && entry.result.defenses?.[0] && (
                <div
                  className="p-3 rounded-lg text-xs text-gray-300 leading-relaxed"
                  style={{ background: '#05080f', borderLeft: '2px solid #3b82f6' }}
                >
                  {entry.result.defenses[0]}
                </div>
              )}
              {entry.mode === 'coach' && entry.result.rewritten_argument && (
                <div
                  className="p-3 rounded-lg text-xs text-gray-300 leading-relaxed"
                  style={{ background: '#050a05', borderLeft: '2px solid #22c55e' }}
                >
                  {entry.result.rewritten_argument}
                </div>
              )}

              {(entry.result.verdict || entry.result.coaching_tip) && (
                <p className="text-xs text-gray-600 italic">
                  "{entry.result.verdict ?? entry.result.coaching_tip}"
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function AnalyzingSkeleton() {
  return (
    <div className="rounded-2xl border border-[#1e1e2e] p-5 space-y-4" style={{ background: '#13131a' }}>
      <div className="animate-pulse space-y-4">
        <div className="h-5 rounded-full bg-[#1e1e2e] w-2/5" />
        <div className="h-2.5 rounded-full bg-[#1e1e2e] w-full" />
        {[1, 0.85, 0.7].map((op, i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-[#1e1e2e]"
            style={{ opacity: op }}
          />
        ))}
        <div className="h-4 rounded-full bg-[#1e1e2e] w-1/3" />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ArgumentArena({ apiKey, externalDebate }) {
  const ownDebate = useDebateAI()
  const {
    result, isLoading, error, mode, history,
    analyzeArgument, clearHistory, setMode,
  } = externalDebate ?? ownDebate

  const [claim, setClaim] = useState('')
  const textareaRef = useRef(null)
  const scrollAnchorRef = useRef(null)

  // Auto-resize textarea between 120px and 300px
  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 300)}px`
  }

  // Scroll to results when a new one arrives
  useEffect(() => {
    if (result && scrollAnchorRef.current) {
      setTimeout(
        () => scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
        150,
      )
    }
  }, [result])

  function handleClaimChange(e) {
    setClaim(e.target.value.slice(0, MAX_CHARS))
    autoResize()
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  async function submit() {
    if (!claim.trim() || isLoading) return
    await analyzeArgument(claim, mode, apiKey)
  }

  async function switchMode(newMode) {
    if (isLoading) return
    setMode(newMode)
    await analyzeArgument(claim, newMode, apiKey)
  }

  function handleClear() {
    setClaim('')
    clearHistory()
    if (textareaRef.current) textareaRef.current.style.height = '120px'
  }

  // Compute current score + delta vs previous analysis of same claim
  const score = getScore(mode, result)
  let previousScore = null
  if (history.length >= 2) {
    const prev = history[history.length - 2]
    if (prev.claim === history[history.length - 1]?.claim) {
      previousScore = getScore(prev.mode, prev.result)
    }
  }

  const wordCount = claim.trim() ? claim.trim().split(/\s+/).length : 0
  const recentHistory = [...history].reverse().slice(0, 3)

  return (
    <div className="space-y-5">
      {/* Topic presets */}
      <TopicPresets
        onSelect={(topic) => {
          setClaim(topic)
          setTimeout(autoResize, 0)
          textareaRef.current?.focus()
        }}
      />

      {/* ── Input card ───────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border border-[#1e1e2e] p-5 space-y-4"
        style={{ background: '#13131a' }}
      >
        {!externalDebate && <ModeSelector currentMode={mode} onModeChange={setMode} />}

        {/* Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={claim}
            onChange={handleClaimChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter any claim, opinion, or argument to analyze..."
            style={{ minHeight: '120px', maxHeight: '300px', resize: 'none' }}
            className="w-full px-4 py-3 pb-8 rounded-xl text-sm text-gray-200 leading-relaxed
                       bg-[#0a0a0f] border border-[#1e1e2e] placeholder-gray-600
                       outline-none transition-all duration-200
                       focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15"
          />

          {/* Clear button — appears when there's text */}
          <AnimatePresence>
            {claim && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
                onClick={() => {
                  setClaim('')
                  if (textareaRef.current) textareaRef.current.style.height = '120px'
                  textareaRef.current?.focus()
                }}
                className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center
                           rounded-full text-gray-600 hover:text-white hover:bg-[#1e1e2e]
                           transition-all text-xs"
                aria-label="Clear text"
              >
                ✕
              </motion.button>
            )}
          </AnimatePresence>

          {/* Character counter */}
          <span
            className="absolute bottom-3 right-3 text-xs tabular-nums select-none"
            style={{ color: claim.length > 450 ? '#f87171' : '#374151' }}
          >
            {claim.length}/{MAX_CHARS}
          </span>
        </div>

        {/* Submit row */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-gray-500 select-none">
            {wordCount > 0
              ? `${wordCount} word${wordCount !== 1 ? 's' : ''}`
              : 'Type or pick a topic above'}
          </span>

          <div className="flex items-center gap-2">
            {/* Ctrl+Enter badge */}
            <span className="hidden sm:flex items-center gap-1 text-gray-600 text-xs select-none">
              <kbd className="px-1.5 py-0.5 rounded border border-[#2a2a38] bg-[#18182a] font-mono text-[10px] leading-none">
                Ctrl
              </kbd>
              <span className="text-gray-700">+</span>
              <kbd className="px-1.5 py-0.5 rounded border border-[#2a2a38] bg-[#18182a] font-mono text-[10px] leading-none">
                ↵
              </kbd>
            </span>

            <button
              onClick={submit}
              disabled={!claim.trim() || isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                         bg-[#3b82f6] text-white
                         disabled:opacity-40 disabled:cursor-not-allowed
                         hover:bg-[#2563eb] active:scale-[0.98]
                         transition-all duration-150"
              style={{
                boxShadow: claim.trim() && !isLoading ? '0 0 20px rgba(59,130,246,0.45)' : 'none',
              }}
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Analyzing…
                </>
              ) : (
                'Analyze Argument'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-800/40 text-red-400 text-sm leading-relaxed"
            style={{ background: 'rgba(239,68,68,0.07)' }}
          >
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading skeleton ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnalyzingSkeleton />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll anchor — stable element above results */}
      <div ref={scrollAnchorRef} />

      {/* ── Results ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {result && !isLoading && (
          <motion.div
            key={history.length}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Strength meter */}
            <div
              className="rounded-2xl border border-[#1e1e2e] p-5"
              style={{ background: '#13131a' }}
            >
              <StrengthMeter
                score={score}
                previousScore={previousScore !== score ? previousScore : null}
              />
            </div>

            {/* Mode-specific result cards */}
            <div
              className="rounded-2xl border border-[#1e1e2e] p-5 space-y-4"
              style={{ background: '#13131a' }}
            >
              {/* ── Attack ── */}
              {mode === 'attack' && (
                <>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                    Counterarguments
                  </p>
                  <div className="space-y-3">
                    {result.counterarguments?.map((c, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 + i * 0.1, duration: 0.3 }}
                        className="flex gap-4 p-4 rounded-xl"
                        style={{
                          background: 'rgba(239,68,68,0.04)',
                          borderLeft: '3px solid #ef4444',
                          border: '1px solid rgba(239,68,68,0.12)',
                          borderLeftWidth: '3px',
                        }}
                      >
                        <span className="text-[#ef4444] font-black text-lg shrink-0 leading-none mt-0.5 select-none">
                          {i + 1}
                        </span>
                        <p className="text-sm text-gray-300 leading-relaxed">{c}</p>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Defend ── */}
              {mode === 'defend' && (
                <>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                    Your Rebuttals
                  </p>
                  <div className="space-y-3">
                    {result.defenses?.map((d, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 + i * 0.1, duration: 0.3 }}
                        className="flex gap-4 p-4 rounded-xl"
                        style={{
                          background: 'rgba(59,130,246,0.04)',
                          border: '1px solid rgba(59,130,246,0.12)',
                          borderLeftWidth: '3px',
                          borderLeftColor: '#3b82f6',
                        }}
                      >
                        <span className="text-[#3b82f6] font-black text-lg shrink-0 leading-none mt-0.5 select-none">
                          {i + 1}
                        </span>
                        <p className="text-sm text-gray-300 leading-relaxed">{d}</p>
                      </motion.div>
                    ))}
                  </div>
                  {result.strongest_defense && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="p-3 rounded-xl text-xs text-[#60a5fa] leading-relaxed"
                      style={{
                        background: 'rgba(59,130,246,0.07)',
                        border: '1px solid rgba(59,130,246,0.2)',
                      }}
                    >
                      <span className="font-semibold">Best strategy: </span>
                      {result.strongest_defense}
                    </motion.div>
                  )}
                </>
              )}

              {/* ── Coach ── */}
              {mode === 'coach' && (
                <>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                    Rewritten Argument
                  </p>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 rounded-xl text-sm text-gray-200 leading-relaxed"
                    style={{
                      background: 'rgba(34,197,94,0.06)',
                      border: '1px solid rgba(34,197,94,0.2)',
                      boxShadow: '0 0 24px rgba(34,197,94,0.07)',
                    }}
                  >
                    {result.rewritten_argument}
                  </motion.div>

                  {result.techniques_used?.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-widest">
                        Techniques Applied
                      </p>
                      {result.techniques_used.map((t, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.18 + i * 0.08 }}
                          className="flex items-start gap-2.5 text-sm text-gray-300"
                        >
                          <span className="text-[#4ade80] shrink-0 mt-0.5 font-bold">✓</span>
                          {t}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Fallacy detector — attack mode only */}
            {mode === 'attack' && result.fallacies !== undefined && (
              <div
                className="rounded-2xl border border-[#1e1e2e] p-5"
                style={{ background: '#13131a' }}
              >
                <FallacyDetector fallacies={result.fallacies} />
              </div>
            )}

            {/* Verdict / coaching tip callout */}
            {(result.verdict || result.coaching_tip) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border p-5"
                style={{
                  background: 'rgba(245,158,11,0.05)',
                  borderColor: 'rgba(245,158,11,0.18)',
                }}
              >
                <p className="text-xs font-medium text-[#f59e0b] uppercase tracking-widest mb-3">
                  {mode === 'coach' ? 'Coaching Tip' : 'Verdict'}
                </p>
                <p className="text-sm text-gray-300 leading-relaxed italic">
                  &ldquo;{result.verdict ?? result.coaching_tip}&rdquo;
                </p>
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {mode === 'attack' && (
                <motion.button
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  onClick={() => switchMode('defend')}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                             transition-all duration-150 disabled:opacity-40
                             border border-[#3b82f6]/30 text-[#60a5fa]
                             hover:border-[#3b82f6]/60 hover:bg-[#1a2d4a]"
                  style={{ background: 'rgba(59,130,246,0.07)' }}
                >
                  🛡️ Switch to Defend mode
                </motion.button>
              )}

              {mode !== 'coach' && (
                <motion.button
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => switchMode('coach')}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                             transition-all duration-150 disabled:opacity-40
                             border border-[#22c55e]/30 text-[#4ade80]
                             hover:border-[#22c55e]/60 hover:bg-[#0e1f10]"
                  style={{ background: 'rgba(34,197,94,0.07)' }}
                >
                  🎯 Switch to Coach mode
                </motion.button>
              )}

              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                onClick={handleClear}
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                           transition-all duration-150
                           border border-[#1e1e2e] text-gray-500
                           hover:border-gray-600 hover:text-gray-300 hover:bg-[#18181f]"
              >
                ↩ New argument
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Debate History ────────────────────────────────────────────── */}
      <AnimatePresence>
        {recentHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3 pt-2"
          >
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-widest">
                Recent Debates
              </span>
              <button
                onClick={clearHistory}
                className="text-xs text-gray-700 hover:text-gray-400 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-2">
              {recentHistory.map((entry, i) => (
                <HistoryCard key={entry.timestamp} entry={entry} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
