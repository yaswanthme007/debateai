import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { callGroq } from '../lib/groq'
import { ATTACK_PROMPT } from '../lib/prompts'
import StrengthMeter from './StrengthMeter'

const MAX_CHARS = 500

function safeParseJSON(raw) {
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

function Spinner() {
  return (
    <svg style={{ width: 16, height: 16, flexShrink: 0, animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
      <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
    </svg>
  )
}

function ResultCard({ label, claim, result, isWinner }) {
  const score = result?.strength_score ?? null
  const counter = result?.counterarguments?.[0] ?? null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderRadius: 10,
        border: `1px solid ${isWinner ? 'var(--amber-dim)' : 'var(--border-mid)'}`,
        padding: 18,
        background: 'var(--bg)',
        boxShadow: isWinner ? '0 0 28px var(--amber-glow)' : 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {isWinner && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
          padding: '3px 10px', borderRadius: 20,
          fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          color: 'var(--amber)', background: 'var(--amber-subtle)', border: '1px solid rgba(232,160,32,0.35)',
        }}>
          🏆 WINNER
        </span>
      )}

      <div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
          {label}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--cream-dim)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {claim}
        </p>
      </div>

      <StrengthMeter score={score} />

      {counter && (
        <div style={{
          padding: '10px 14px', borderRadius: 6,
          background: 'var(--red-subtle)', borderLeft: '3px solid var(--red)',
          fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--cream-dim)', lineHeight: 1.5,
        }}>
          {counter}
        </div>
      )}

      {result?.verdict && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontStyle: 'italic', color: 'var(--muted-light)', lineHeight: 1.5 }}>
          &ldquo;{result.verdict}&rdquo;
        </p>
      )}
    </motion.div>
  )
}

const LABEL_STYLE = {
  fontFamily: 'var(--font-ui)',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.20em',
  textTransform: 'uppercase',
  color: 'var(--muted-light)',
  display: 'block',
  textAlign: 'left',
  marginBottom: 8,
}

const TEXTAREA_BASE = {
  flex: 1,
  minHeight: 150,
  resize: 'none',
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid var(--border-mid)',
  background: 'var(--bg)',
  color: 'var(--cream)',
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  lineHeight: 1.6,
  outline: 'none',
  transition: 'border-color 0.2s',
  caretColor: 'var(--amber)',
  width: '100%',
  boxSizing: 'border-box',
}

export default function ComparisonMode({ apiKey }) {
  const [claimA, setClaimA] = useState('')
  const [claimB, setClaimB] = useState('')
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  async function compare() {
    if (!claimA.trim() || !claimB.trim() || isLoading) return
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const [rawA, rawB] = await Promise.all([
        callGroq(ATTACK_PROMPT, `Argument: "${claimA}"`, apiKey),
        callGroq(ATTACK_PROMPT, `Argument: "${claimB}"`, apiKey),
      ])

      const a = safeParseJSON(rawA)
      const b = safeParseJSON(rawB)

      if (!a || !b) {
        setError('Could not parse one or both results. Try again.')
        return
      }

      setResults({ a, b })
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const scoreA = results?.a?.strength_score ?? null
  const scoreB = results?.b?.strength_score ?? null
  const winner =
    scoreA !== null && scoreB !== null
      ? scoreA > scoreB ? 'a' : scoreB > scoreA ? 'b' : 'tie'
      : null

  const canCompare = !!claimA.trim() && !!claimB.trim() && !isLoading

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Two textareas — CSS grid forces equal width; flex column + flex:1 forces equal height */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'stretch' }}>
        {[
          { label: 'Argument A', value: claimA, set: setClaimA, placeholder: 'Enter first argument…' },
          { label: 'Argument B', value: claimB, set: setClaimB, placeholder: 'Enter second argument…' },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={LABEL_STYLE}>{label}</label>
            <textarea
              value={value}
              onChange={e => set(e.target.value.slice(0, MAX_CHARS))}
              placeholder={placeholder}
              style={TEXTAREA_BASE}
              onFocus={e => { e.target.style.borderColor = 'var(--amber-dim)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-mid)' }}
            />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.05em',
              color: value.length > 450 ? 'var(--red-light)' : 'var(--muted)',
              marginTop: 5, textAlign: 'right',
            }}>
              {value.length}/{MAX_CHARS}
            </span>
          </div>
        ))}
      </div>

      {/* Compare button — centered below both textareas */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <button
          onClick={compare}
          disabled={!canCompare}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0 28px', minHeight: 48, borderRadius: 8,
            border: '1px solid var(--amber-dim)',
            background: canCompare ? 'var(--amber)' : 'transparent',
            color: canCompare ? '#0A0808' : 'var(--muted)',
            fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.08em',
            cursor: canCompare ? 'pointer' : 'not-allowed',
            transition: 'all 0.18s',
            boxShadow: canCompare ? '0 0 22px rgba(232,160,32,0.4)' : 'none',
            opacity: canCompare ? 1 : 0.42,
          }}
          onMouseEnter={e => { if (canCompare) e.currentTarget.style.boxShadow = '0 0 32px rgba(232,160,32,0.55)' }}
          onMouseLeave={e => { if (canCompare) e.currentTarget.style.boxShadow = '0 0 22px rgba(232,160,32,0.4)' }}
        >
          {isLoading ? <><Spinner /> COMPARING…</> : '⚖ COMPARE ARGUMENTS'}
        </button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: '12px 16px', borderRadius: 8,
              border: '1px solid rgba(194,56,40,0.3)', background: 'var(--red-subtle)',
              fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--red-light)',
            }}
          >
            ⚠ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            {winner === 'tie' && (
              <p style={{ textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--muted-light)', letterSpacing: '0.06em' }}>
                🤝 IT&apos;S A TIE — both arguments scored equally.
              </p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <ResultCard label="Argument A" claim={claimA} result={results.a} isWinner={winner === 'a'} />
              <ResultCard label="Argument B" claim={claimB} result={results.b} isWinner={winner === 'b'} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
