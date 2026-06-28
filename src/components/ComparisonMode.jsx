import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { callGroq } from '../lib/groq'
import { ATTACK_PROMPT } from '../lib/prompts'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
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

function MicIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" x2="12" y1="19" y2="22"/>
    </svg>
  )
}

function MicOffIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" x2="22" y1="2" y2="22"/>
      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/>
      <path d="M5 10v2a7 7 0 0 0 12 5"/>
      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/>
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12"/>
      <line x1="12" x2="12" y1="19" y2="22"/>
    </svg>
  )
}

function ResultCard({ label, claim, result, isWinner }) {
  const score   = result?.strength_score ?? null
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

export default function ComparisonMode({ apiKey }) {
  const [claimA, setClaimA] = useState('')
  const [claimB, setClaimB] = useState('')
  const [results, setResults]   = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]       = useState(null)
  const [interimA, setInterimA] = useState('')
  const [interimB, setInterimB] = useState('')
  const [voiceToast, setVoiceToast] = useState(null)

  const toastTimerRef = useRef(null)

  const showVoiceToast = useCallback((msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setVoiceToast(msg)
    toastTimerRef.current = setTimeout(() => setVoiceToast(null), 2500)
  }, [])

  const speechA = useSpeechRecognition({
    onTranscript: (text) => {
      setClaimA(prev => (prev + (prev ? ' ' : '') + text).slice(0, MAX_CHARS))
      setInterimA('')
    },
    onInterim: (text) => setInterimA(text),
    onError: (type) => {
      if (type === 'not-allowed') showVoiceToast('Microphone access denied. Check your browser permissions.')
      else if (type === 'network') showVoiceToast('Voice input requires an internet connection')
    },
  })

  const speechB = useSpeechRecognition({
    onTranscript: (text) => {
      setClaimB(prev => (prev + (prev ? ' ' : '') + text).slice(0, MAX_CHARS))
      setInterimB('')
    },
    onInterim: (text) => setInterimB(text),
    onError: (type) => {
      if (type === 'not-allowed') showVoiceToast('Microphone access denied. Check your browser permissions.')
      else if (type === 'network') showVoiceToast('Voice input requires an internet connection')
    },
  })

  // Stop A if limit reached
  if (speechA.isListening && claimA.length >= MAX_CHARS) {
    speechA.stopListening()
    showVoiceToast('Character limit reached')
  }

  // Stop B if limit reached
  if (speechB.isListening && claimB.length >= MAX_CHARS) {
    speechB.stopListening()
    showVoiceToast('Character limit reached')
  }

  function toggleMicA() {
    if (speechA.isListening) {
      speechA.stopListening()
      setInterimA('')
    } else {
      if (speechB.isListening) { speechB.stopListening(); setInterimB('') }
      speechA.startListening()
    }
  }

  function toggleMicB() {
    if (speechB.isListening) {
      speechB.stopListening()
      setInterimB('')
    } else {
      if (speechA.isListening) { speechA.stopListening(); setInterimA('') }
      speechB.startListening()
    }
  }

  async function compare() {
    if (speechA.isListening) { speechA.stopListening(); setInterimA('') }
    if (speechB.isListening) { speechB.stopListening(); setInterimB('') }
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

  // Build display values (finalized + interim)
  const displayA = speechA.isListening && interimA
    ? claimA + (claimA ? ' ' : '') + interimA
    : claimA
  const displayB = speechB.isListening && interimB
    ? claimB + (claimB ? ' ' : '') + interimB
    : claimB

  const canCompare = !!claimA.trim() && !!claimB.trim() && !isLoading

  const textareaStyle = (speech) => ({
    flex: 1,
    minHeight: 150,
    resize: 'none',
    paddingTop: 12,
    paddingLeft: 14,
    paddingRight: speech.isSupported ? 48 : 14,
    paddingBottom: speech.isSupported ? 44 : 12,
    borderRadius: 8,
    border: '1px solid',
    borderColor: speech.isListening ? 'var(--amber)' : 'var(--border-mid)',
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
  })

  const micBtnStyle = (isListening) => ({
    position: 'absolute', bottom: 6, right: 6,
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    border: isListening ? '1.5px solid #D4A853' : '1.5px solid rgba(212,168,83,0.4)',
    background: isListening ? '#D4A853' : 'transparent',
    color: isListening ? '#1a1a1a' : '#D4A853',
    transition: 'all 0.2s ease',
    animation: isListening ? 'pulse-ring 1.5s ease-out infinite' : 'none',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(212,168,83,0.4); }
          70%  { box-shadow: 0 0 0 10px rgba(212,168,83,0); }
          100% { box-shadow: 0 0 0 0 rgba(212,168,83,0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
      `}</style>

      {/* Two textareas — equal width via CSS grid; equal height via flex + alignItems:stretch */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'stretch' }}>
        {[
          {
            label: 'Argument A', value: claimA, set: setClaimA,
            placeholder: 'Enter first argument…',
            speech: speechA, interim: interimA, setInterim: setInterimA,
            display: displayA, toggle: toggleMicA,
          },
          {
            label: 'Argument B', value: claimB, set: setClaimB,
            placeholder: 'Enter second argument…',
            speech: speechB, interim: interimB, setInterim: setInterimB,
            display: displayB, toggle: toggleMicB,
          },
        ].map(({ label, set, placeholder, speech, setInterim, display, toggle }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={LABEL_STYLE}>{label}</label>
            {/* Relative wrapper for absolute-positioned mic button */}
            <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <textarea
                value={display}
                onChange={e => {
                  if (speech.isListening) { speech.stopListening(); setInterim('') }
                  set(e.target.value.slice(0, MAX_CHARS))
                }}
                placeholder={placeholder}
                style={textareaStyle(speech)}
                onFocus={e => { e.target.style.borderColor = speech.isListening ? 'var(--amber)' : 'var(--amber-dim)' }}
                onBlur={e => { e.target.style.borderColor = speech.isListening ? 'var(--amber)' : 'var(--border-mid)' }}
              />

              {/* Listening label */}
              {speech.isListening && (
                <span style={{
                  position: 'absolute', bottom: 48, right: 4,
                  fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--amber)',
                  animation: 'pulse-dot 1.2s ease-in-out infinite',
                  pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
                }}>
                  ● Listening…
                </span>
              )}

              {/* Mic button */}
              {speech.isSupported && (
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={speech.isListening ? 'Stop voice recording' : 'Start voice input'}
                  style={micBtnStyle(speech.isListening)}
                  onMouseEnter={e => {
                    if (!speech.isListening) {
                      e.currentTarget.style.borderColor = '#D4A853'
                      e.currentTarget.style.background  = 'rgba(212,168,83,0.1)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!speech.isListening) {
                      e.currentTarget.style.borderColor = 'rgba(212,168,83,0.4)'
                      e.currentTarget.style.background  = 'transparent'
                    }
                  }}
                >
                  {speech.isListening ? <MicOffIcon /> : <MicIcon />}
                </button>
              )}
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.05em',
              color: display.length > 450 ? 'var(--red-light)' : 'var(--muted)',
              marginTop: 5, textAlign: 'right',
            }}>
              {display.length}/{MAX_CHARS}
            </span>
          </div>
        ))}
      </div>

      {/* Voice toast */}
      {voiceToast && (
        <div style={{
          fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '0.03em',
          color: 'var(--amber)', textAlign: 'center', padding: '2px 0',
        }}>
          {voiceToast}
        </div>
      )}

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
