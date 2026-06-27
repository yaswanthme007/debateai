import { useState, useRef, useEffect, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebateAI } from '../hooks/useDebateAI'
import { useTypewriter } from '../hooks/useTypewriter'
import ModeSelector from './ModeSelector'
import StrengthMeter from './StrengthMeter'
import FallacyDetector from './FallacyDetector'
import TopicPresets from './TopicPresets'
import ShareCard from './ShareCard'

const ComparisonMode = lazy(() => import('./ComparisonMode'))

const MAX_CHARS = 500

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getScore(mode, result) {
  if (!result) return null
  if (mode === 'attack') return result.strength_score ?? null
  if (mode === 'defend') return result.improved_score ?? null
  if (mode === 'coach')  return result.new_score ?? null
  return null
}

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function dur(ms) { return reducedMotion() ? 0 : ms }

// ─── Typewriter text ──────────────────────────────────────────────────────────

function TypewriterText({ text, delay = 0, speed = 11 }) {
  const { displayText, isDone } = useTypewriter(text, speed, delay)
  return (
    <>
      {displayText}
      {!isDone && (
        <span
          style={{ display: 'inline-block', width: 2, background: 'currentColor', opacity: 0.6, marginLeft: 2, height: '0.85em', verticalAlign: 'text-bottom', animation: 'arena-pulse 0.8s infinite' }}
        />
      )}
    </>
  )
}

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }) {
  if (score === null || score === undefined) return null
  const color = score <= 25 ? 'var(--red-light)' : score <= 50 ? 'var(--amber-light)' : score <= 75 ? 'var(--blue-light)' : 'var(--green-light)'
  const raw   = score <= 25 ? '#E05040' : score <= 50 ? '#F5C044' : score <= 75 ? '#4A8FD4' : '#38AE72'
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
        padding: '2px 8px', borderRadius: 3, flexShrink: 0,
        color, background: `${raw}14`, border: `1px solid ${raw}30`,
      }}
    >
      {score}/100
    </span>
  )
}

// ─── Mode badge ───────────────────────────────────────────────────────────────

function ModeBadge({ mode }) {
  const cfg = {
    attack: { color: 'var(--red-light)',   raw: '#E05040', label: '⚔ Attack' },
    defend: { color: 'var(--blue-light)',  raw: '#4A8FD4', label: '🛡 Defend' },
    coach:  { color: 'var(--green-light)', raw: '#38AE72', label: '🎯 Coach'  },
  }
  const c = cfg[mode] ?? cfg.attack
  return (
    <span
      style={{
        fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        padding: '3px 8px', borderRadius: 3, flexShrink: 0,
        color: c.color, background: `${c.raw}12`, border: `1px solid ${c.raw}28`,
      }}
    >
      {c.label}
    </span>
  )
}

// ─── History card ─────────────────────────────────────────────────────────────

function HistoryCard({ entry, index }) {
  const [expanded, setExpanded] = useState(false)
  const score = getScore(entry.mode, entry.result)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: dur(0.25) }}
      style={{ borderRadius: 8, border: '1px solid var(--border-mid)', overflow: 'hidden', background: 'var(--bg-card)' }}
    >
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', minHeight: 46,
          textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--cream-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
          {entry.claim}
        </span>
        <ScoreBadge score={score} />
        <ModeBadge mode={entry.mode} />
        <span style={{ color: 'var(--muted)', fontSize: 9, flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="history-detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: dur(0.2), ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '14px 16px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--cream-dim)', lineHeight: 1.5 }}>{entry.claim}</p>
              {entry.mode === 'attack' && entry.result.counterarguments?.[0] && (
                <div style={{ padding: '10px 14px', borderRadius: 6, borderLeft: '3px solid var(--red)', background: 'var(--red-subtle)', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--cream-dim)', lineHeight: 1.55 }}>
                  {entry.result.counterarguments[0]}
                </div>
              )}
              {entry.mode === 'defend' && entry.result.defenses?.[0] && (
                <div style={{ padding: '10px 14px', borderRadius: 6, borderLeft: '3px solid var(--blue)', background: 'var(--blue-subtle)', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--cream-dim)', lineHeight: 1.55 }}>
                  {entry.result.defenses[0]}
                </div>
              )}
              {entry.mode === 'coach' && entry.result.rewritten_argument && (
                <div style={{ padding: '10px 14px', borderRadius: 6, borderLeft: '3px solid var(--green)', background: 'var(--green-subtle)', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--cream-dim)', lineHeight: 1.55 }}>
                  {entry.result.rewritten_argument}
                </div>
              )}
              {(entry.result.verdict || entry.result.coaching_tip) && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontStyle: 'italic', color: 'var(--muted-light)' }}>
                  &ldquo;{entry.result.verdict ?? entry.result.coaching_tip}&rdquo;
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AnalyzingSkeleton() {
  return (
    <div style={{ borderRadius: 10, border: '1px solid var(--border-mid)', padding: 20, background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ animation: 'pulse 1.5s ease-in-out infinite', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        <div style={{ height: 18, borderRadius: 3, background: 'var(--bg-raised)', width: '38%' }} />
        <div style={{ height: 10, borderRadius: 3, background: 'var(--bg-raised)', width: '100%' }} />
        {[1, 0.8, 0.65].map((op, i) => (
          <div key={i} style={{ height: 64, borderRadius: 6, background: 'var(--bg-raised)', opacity: op }} />
        ))}
        <div style={{ height: 14, borderRadius: 3, background: 'var(--bg-raised)', width: '30%' }} />
      </div>
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg style={{ width: 16, height: 16, flexShrink: 0, animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
      <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ArgumentArena({ apiKey, onNeedSettings }) {
  const { result, isLoading, error, mode, history, analyzeArgument, clearHistory, setMode } = useDebateAI()

  const [claim, setClaim] = useState('')
  const [compareMode, setCompareMode] = useState(false)
  const [countdown, setCountdown] = useState(null)

  const textareaRef    = useRef(null)
  const scrollAnchorRef = useRef(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 300)}px`
  }, [claim])

  useEffect(() => {
    if (result && scrollAnchorRef.current) {
      setTimeout(() => scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150)
    }
  }, [result])

  useEffect(() => {
    if (error?.type === 'rate_limit') setCountdown(10)
    else setCountdown(null)
  }, [error?.type])

  useEffect(() => {
    if (!countdown || countdown <= 0) return
    const id = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [countdown])

  useEffect(() => {
    if (error?.type === 'no_api_key') onNeedSettings?.()
  }, [error?.type, onNeedSettings])

  function handleClaimChange(e) { setClaim(e.target.value.slice(0, MAX_CHARS)) }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); submit() }
  }

  async function submit() {
    if (!claim.trim() || isLoading || countdown > 0) return
    if (!apiKey) { onNeedSettings?.(); return }
    await analyzeArgument(claim, mode, apiKey)
  }

  async function switchMode(newMode) {
    if (isLoading || countdown > 0) return
    if (!apiKey) { onNeedSettings?.(); return }
    setMode(newMode)
    await analyzeArgument(claim, newMode, apiKey)
  }

  function handleClear() {
    setClaim('')
    clearHistory()
    if (textareaRef.current) textareaRef.current.style.height = '120px'
  }

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
  const topCounterargument = result?.counterarguments?.[0] ?? result?.defenses?.[0] ?? result?.rewritten_argument ?? null

  const canSubmit = !!claim.trim() && !isLoading && !countdown

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Mode selector */}
      <ModeSelector currentMode={mode} onModeChange={setMode} />

      {/* Topic presets */}
      <TopicPresets onSelect={topic => { setClaim(topic); textareaRef.current?.focus() }} />

      {/* Compare mode toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setCompareMode(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', minHeight: 36, borderRadius: 6,
            border: '1px solid',
            fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
            cursor: 'pointer', transition: 'all 0.15s', background: 'transparent',
            ...(compareMode
              ? { borderColor: 'var(--amber-dim)', color: 'var(--amber)' }
              : { borderColor: 'var(--border-mid)', color: 'var(--muted-light)' }),
          }}
        >
          {compareMode ? '✕ Exit Comparison' : '⚖ Compare Two Arguments'}
        </button>
      </div>

      {/* ── Comparison mode ──────────────────────────────────────────────────── */}
      {compareMode ? (
        <Suspense fallback={<div style={{ height: 192, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-mid)', animation: 'pulse 1.5s infinite' }} />}>
          <div style={{ borderRadius: 10, border: '1px solid var(--border-mid)', padding: 20, background: 'var(--bg-card)' }}>
            <ComparisonMode apiKey={apiKey} />
          </div>
        </Suspense>
      ) : (
        <>
          {/* ── Input card ────────────────────────────────────────────────────── */}
          <div style={{ borderRadius: 10, border: '1px solid var(--border-mid)', padding: 20, background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <textarea
                ref={textareaRef}
                value={claim}
                onChange={handleClaimChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter any claim, opinion, or argument to analyze…"
                style={{
                  width: '100%', minHeight: 120, maxHeight: 300, resize: 'none',
                  padding: '14px 16px 32px',
                  borderRadius: 8, border: '1px solid',
                  borderColor: 'var(--border-mid)',
                  background: 'var(--bg)', color: 'var(--cream)',
                  fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.6,
                  outline: 'none', transition: 'border-color 0.2s',
                  caretColor: 'var(--amber)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--amber-dim)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
              />
              <style>{`textarea::placeholder { color: var(--muted); font-family: var(--font-ui); font-size: 14px; }`}</style>

              <AnimatePresence>
                {claim && (
                  <motion.button
                    key="clear-btn"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: dur(0.12) }}
                    onClick={() => { setClaim(''); textareaRef.current?.focus() }}
                    aria-label="Clear text"
                    style={{
                      position: 'absolute', top: 10, right: 10,
                      width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--border-mid)',
                      background: 'var(--bg-raised)', color: 'var(--muted-light)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--cream)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-light)'; e.currentTarget.style.borderColor = 'var(--border-mid)'; }}
                  >
                    ✕
                  </motion.button>
                )}
              </AnimatePresence>

              <span
                style={{
                  position: 'absolute', bottom: 10, right: 14,
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.05em',
                  color: claim.length > 450 ? 'var(--red-light)' : 'var(--muted)',
                  pointerEvents: 'none', userSelect: 'none',
                }}
              >
                {claim.length}/{MAX_CHARS}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--muted)', letterSpacing: '0.04em' }}>
                {wordCount > 0 ? `${wordCount} word${wordCount !== 1 ? 's' : ''}` : 'Type or pick a topic above'}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted)' }}>
                  {['Ctrl', '+', '↵'].map((k, i) => (
                    k === '+' ? <span key={i} style={{ color: 'var(--muted)', fontSize: 10 }}>+</span> :
                    <kbd key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 5px', borderRadius: 3, border: '1px solid var(--border-mid)', background: 'var(--bg-raised)', color: 'var(--muted-light)', letterSpacing: 0 }}>{k}</kbd>
                  ))}
                </span>

                <button
                  onClick={submit}
                  disabled={!canSubmit}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '0 20px', minHeight: 44, borderRadius: 8,
                    border: '1px solid var(--amber-dim)',
                    background: canSubmit ? 'var(--amber)' : 'transparent',
                    color: canSubmit ? '#0A0808' : 'var(--muted)',
                    fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.08em',
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    transition: 'all 0.18s',
                    boxShadow: canSubmit ? '0 0 22px rgba(232,160,32,0.4)' : 'none',
                    opacity: !claim.trim() || countdown > 0 ? 0.42 : 1,
                  }}
                  onMouseEnter={e => { if (canSubmit) { e.currentTarget.style.boxShadow = '0 0 32px rgba(232,160,32,0.55)' } }}
                  onMouseLeave={e => { if (canSubmit) { e.currentTarget.style.boxShadow = '0 0 22px rgba(232,160,32,0.4)' } }}
                >
                  {isLoading ? (
                    <><Spinner /> ANALYZING…</>
                  ) : countdown > 0 ? (
                    `WAIT ${countdown}s`
                  ) : (
                    'ANALYZE'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── Error display ─────────────────────────────────────────────────── */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error-msg"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: dur(0.2) }}
                style={{
                  padding: '12px 16px', borderRadius: 8, border: '1px solid',
                  fontFamily: 'var(--font-ui)', fontSize: 13,
                  ...(error.type === 'rate_limit'
                    ? { borderColor: 'rgba(232,160,32,0.3)', background: 'var(--amber-subtle)' }
                    : { borderColor: 'rgba(194,56,40,0.3)', background: 'var(--red-subtle)' }),
                }}
              >
                {error.type === 'rate_limit' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ color: 'var(--amber-light)', fontWeight: 600 }}>
                      ⏱ Going too fast! {countdown > 0 ? `Wait ${countdown}s…` : 'Ready to retry.'}
                    </span>
                    {countdown === 0 && (
                      <button onClick={submit} style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 5, border: '1px solid var(--amber-dim)', background: 'var(--amber-subtle)', color: 'var(--amber)', cursor: 'pointer' }}>
                        RETRY
                      </button>
                    )}
                  </div>
                ) : error.type === 'network' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ color: 'var(--red-light)', fontWeight: 600 }}>📡 {error.message}</span>
                    <button onClick={submit} style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 5, border: '1px solid var(--border-strong)', background: 'var(--bg-raised)', color: 'var(--cream-dim)', cursor: 'pointer' }}>
                      RETRY
                    </button>
                  </div>
                ) : error.type === 'no_api_key' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ color: 'var(--amber-light)', fontWeight: 600 }}>🔑 Add your Groq API key to continue</span>
                    <button onClick={() => onNeedSettings?.()} style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 5, border: '1px solid rgba(232,160,32,0.4)', background: 'var(--amber-subtle)', color: 'var(--amber)', cursor: 'pointer' }}>
                      OPEN SETTINGS
                    </button>
                  </div>
                ) : error.type === 'invalid_key' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ color: 'var(--red-light)', fontWeight: 600 }}>🔑 Invalid API key. Check your key in Settings.</span>
                    <button onClick={() => onNeedSettings?.()} style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 5, border: '1px solid rgba(194,56,40,0.4)', background: 'var(--red-subtle)', color: 'var(--red-light)', cursor: 'pointer' }}>
                      OPEN SETTINGS
                    </button>
                  </div>
                ) : (
                  <span style={{ color: 'var(--red-light)', fontWeight: 600 }}>⚠ {error.message}</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading skeleton */}
          <AnimatePresence>
            {isLoading && (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AnalyzingSkeleton />
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={scrollAnchorRef} />

          {/* ── Results ───────────────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {result && !isLoading && (
              <motion.div
                key={`result-${history.length}`}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: dur(0.38), ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                {/* Strength meter */}
                <div style={{ borderRadius: 10, border: '1px solid var(--border-mid)', padding: 20, background: 'var(--bg-card)' }}>
                  <StrengthMeter
                    score={score}
                    previousScore={previousScore !== null && previousScore !== score ? previousScore : null}
                  />
                </div>

                {/* Mode-specific cards */}
                <div style={{ borderRadius: 10, border: '1px solid var(--border-mid)', padding: 20, background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {mode === 'attack' && (
                    <>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--muted-light)' }}>
                        Counterarguments
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {result.counterarguments?.map((c, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -14 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: dur(0.08 + i * 0.10), duration: dur(0.28) }}
                            style={{
                              display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 8,
                              background: 'var(--red-subtle)', borderLeft: '3px solid var(--red)',
                            }}
                          >
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--red-light)', flexShrink: 0, lineHeight: 1, marginTop: 2, userSelect: 'none' }}>
                              {i + 1}
                            </span>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--cream-dim)', lineHeight: 1.6 }}>
                              <TypewriterText text={c} delay={i * 420} speed={11} />
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}

                  {mode === 'defend' && (
                    <>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--muted-light)' }}>
                        Your Rebuttals
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {result.defenses?.map((d, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -14 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: dur(0.08 + i * 0.10), duration: dur(0.28) }}
                            style={{
                              display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 8,
                              background: 'var(--blue-subtle)', borderLeft: '3px solid var(--blue)',
                            }}
                          >
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--blue-light)', flexShrink: 0, lineHeight: 1, marginTop: 2, userSelect: 'none' }}>
                              {i + 1}
                            </span>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--cream-dim)', lineHeight: 1.6 }}>
                              <TypewriterText text={d} delay={i * 420} speed={11} />
                            </p>
                          </motion.div>
                        ))}
                      </div>
                      {result.strongest_defense && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: dur(0.4) }}
                          style={{ padding: '10px 14px', borderRadius: 6, background: 'var(--blue-subtle)', border: '1px solid rgba(37,96,168,0.28)' }}
                        >
                          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--blue-light)' }}>Best strategy: </span>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--cream-dim)' }}>{result.strongest_defense}</span>
                        </motion.div>
                      )}
                    </>
                  )}

                  {mode === 'coach' && (
                    <>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--muted-light)' }}>
                        Rewritten Argument
                      </span>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: dur(0.3) }}
                        style={{
                          padding: '16px 18px', borderRadius: 8,
                          background: 'var(--green-subtle)', border: '1px solid rgba(32,122,80,0.28)',
                          boxShadow: '0 0 28px rgba(32,122,80,0.08)',
                          fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--cream-dim)', lineHeight: 1.65,
                        }}
                      >
                        <TypewriterText text={result.rewritten_argument} delay={0} speed={9} />
                      </motion.div>
                      {result.techniques_used?.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
                          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                            Techniques Applied
                          </span>
                          {result.techniques_used.map((t, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: dur(0.18 + i * 0.08) }}
                              style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
                            >
                              <span style={{ color: 'var(--green-light)', flexShrink: 0, marginTop: 2, fontWeight: 700 }}>✓</span>
                              <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--cream-dim)' }}>{t}</span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Fallacy detector */}
                {mode === 'attack' && result.fallacies !== undefined && (
                  <div style={{ borderRadius: 10, border: '1px solid var(--border-mid)', padding: 20, background: 'var(--bg-card)' }}>
                    <FallacyDetector fallacies={result.fallacies} />
                  </div>
                )}

                {/* Verdict / coaching tip */}
                {(result.verdict || result.coaching_tip) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: dur(0.3) }}
                    style={{
                      borderRadius: 10, padding: 20,
                      background: 'var(--amber-subtle)', border: '1px solid rgba(232,160,32,0.22)',
                    }}
                  >
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 10 }}>
                      {mode === 'coach' ? 'Coaching Tip' : 'Verdict'}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, fontStyle: 'italic', color: 'var(--cream-dim)', lineHeight: 1.6 }}>
                      &ldquo;{result.verdict ?? result.coaching_tip}&rdquo;
                    </p>
                  </motion.div>
                )}

                {/* Share card */}
                <div style={{ borderRadius: 10, border: '1px solid var(--border-mid)', padding: 20, background: 'var(--bg-card)' }}>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--muted-light)', marginBottom: 14 }}>
                    Share Result
                  </p>
                  <ShareCard claim={claim} score={score} topCounterargument={topCounterargument} mode={mode} />
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 4 }}>
                  {mode === 'attack' && (
                    <motion.button
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: dur(0.35) }}
                      onClick={() => switchMode('defend')}
                      disabled={isLoading || countdown > 0}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '0 16px', minHeight: 42, borderRadius: 7,
                        border: '1px solid rgba(37,96,168,0.35)',
                        background: 'var(--blue-subtle)', color: 'var(--blue-light)',
                        fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em',
                        cursor: 'pointer', transition: 'all 0.15s',
                        opacity: isLoading || countdown > 0 ? 0.4 : 1,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,96,168,0.65)'; e.currentTarget.style.background = 'rgba(37,96,168,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(37,96,168,0.35)'; e.currentTarget.style.background = 'var(--blue-subtle)'; }}
                    >
                      🛡 Switch to Defend Mode
                    </motion.button>
                  )}
                  {mode !== 'coach' && (
                    <motion.button
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: dur(0.40) }}
                      onClick={() => switchMode('coach')}
                      disabled={isLoading || countdown > 0}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '0 16px', minHeight: 42, borderRadius: 7,
                        border: '1px solid rgba(32,122,80,0.35)',
                        background: 'var(--green-subtle)', color: 'var(--green-light)',
                        fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em',
                        cursor: 'pointer', transition: 'all 0.15s',
                        opacity: isLoading || countdown > 0 ? 0.4 : 1,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(32,122,80,0.65)'; e.currentTarget.style.background = 'rgba(32,122,80,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(32,122,80,0.35)'; e.currentTarget.style.background = 'var(--green-subtle)'; }}
                    >
                      🎯 Switch to Coach Mode
                    </motion.button>
                  )}
                  <motion.button
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dur(0.45) }}
                    onClick={handleClear}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '0 16px', minHeight: 42, borderRadius: 7, marginLeft: 'auto',
                      border: '1px solid var(--border-mid)', background: 'transparent',
                      color: 'var(--muted-light)',
                      fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--cream-dim)'; e.currentTarget.style.background = 'var(--bg-raised)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--muted-light)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    ↩ New Argument
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Recent Debates ─────────────────────────────────────────────────── */}
          <AnimatePresence>
            {recentHistory.length > 0 && (
              <motion.div
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                    Recent Debates
                  </span>
                  <button
                    onClick={clearHistory}
                    style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.04em', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--amber)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                  >
                    Clear all
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {recentHistory.map((entry, i) => (
                    <HistoryCard key={entry.timestamp} entry={entry} index={i} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
