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
    <svg className="w-4 h-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
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
      className="rounded-2xl border p-5 space-y-4 relative overflow-hidden"
      style={{
        background: '#13131a',
        borderColor: isWinner ? '#fbbf24' : '#1e1e2e',
        boxShadow: isWinner ? '0 0 20px rgba(251,191,36,0.5)' : 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {isWinner && (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-amber-300"
          style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.35)' }}
        >
          🏆 Winner
        </div>
      )}

      <div>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">{claim}</p>
      </div>

      <StrengthMeter score={score} />

      {counter && (
        <div
          className="p-3 rounded-xl text-xs text-gray-400 leading-relaxed"
          style={{ background: 'rgba(239,68,68,0.05)', borderLeft: '2px solid #ef4444' }}
        >
          {counter}
        </div>
      )}

      {result?.verdict && (
        <p className="text-xs text-gray-600 italic leading-relaxed">
          &ldquo;{result.verdict}&rdquo;
        </p>
      )}
    </motion.div>
  )
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

  return (
    <div className="space-y-5">
      {/* Two textareas */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Argument A', value: claimA, set: setClaimA, placeholder: 'Enter first argument…' },
          { label: 'Argument B', value: claimB, set: setClaimB, placeholder: 'Enter second argument…' },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label} className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block">
              {label}
            </label>
            <textarea
              value={value}
              onChange={(e) => set(e.target.value.slice(0, MAX_CHARS))}
              placeholder={placeholder}
              style={{ minHeight: '120px', resize: 'none' }}
              className="w-full px-4 py-3 rounded-xl text-sm text-gray-200 leading-relaxed
                         bg-[#0a0a0f] border border-[#1e1e2e] placeholder-gray-600
                         outline-none transition-all duration-200
                         focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15"
            />
          </div>
        ))}
      </div>

      {/* Compare button */}
      <div className="flex justify-center">
        <button
          onClick={compare}
          disabled={!claimA.trim() || !claimB.trim() || isLoading}
          className="flex items-center gap-2 px-6 min-h-[48px] rounded-xl text-sm font-semibold
                     bg-[#3b82f6] text-white disabled:opacity-40 disabled:cursor-not-allowed
                     hover:bg-[#2563eb] active:scale-[0.98] transition-all duration-150"
          style={{ boxShadow: '0 0 20px rgba(59,130,246,0.4)' }}
        >
          {isLoading ? <><Spinner /> Comparing…</> : '⚖️ Compare Arguments'}
        </button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3 rounded-xl border border-red-800/40 text-red-400 text-sm"
            style={{ background: 'rgba(239,68,68,0.07)' }}
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {winner === 'tie' && (
            <div className="text-center py-2 text-sm text-gray-400">
              🤝 It&apos;s a tie — both arguments scored equally.
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <ResultCard label="Argument A" claim={claimA} result={results.a} isWinner={winner === 'a'} />
            <ResultCard label="Argument B" claim={claimB} result={results.b} isWinner={winner === 'b'} />
          </div>
        </div>
      )}
    </div>
  )
}
