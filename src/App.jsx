import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ArgumentArena from './components/ArgumentArena'
import SettingsModal from './components/SettingsModal'
import ParticleField from './components/ParticleField'

const STORAGE_KEY = 'debateai_groq_key'

const TAGLINES = [
  'AI that destroys your argument.',
  'AI that defends your position.',
  'AI that makes you unbeatable.',
]

const PILLS = ['⚡ GROQ-POWERED', '🧠 3 ANALYSIS MODES', '🎯 FALLACY DETECTION']

// Decorative diamonds scattered around the hero (behind content)
const DIAMONDS = [
  { top: '18%', left:  '7%',  size:  8, dur: '4.2s', delay:    '0s', opacity: 0.18 },
  { top: '42%', right: '9%',  size: 10, dur: '5.6s', delay: '-2.1s', opacity: 0.14 },
  { top: '67%', left: '13%',  size:  6, dur: '4.9s', delay: '-1.4s', opacity: 0.20 },
  { top: '28%', right:'16%',  size:  7, dur: '6.1s', delay: '-3.0s', opacity: 0.13 },
]

const EASE_OUT = [0.22, 1, 0.36, 1]

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar({ apiKey, onOpenSettings }) {
  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
        background: 'rgba(9,7,10,0.93)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 28, height: 28, flexShrink: 0,
            background: 'var(--amber)',
            clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 11, color: '#0A0808', fontWeight: 900, lineHeight: 1 }}>⚔</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.06em', lineHeight: 1 }}>
            <span style={{ color: 'var(--cream)' }}>DEBATE</span>
            <span style={{ color: 'var(--amber)' }}>AI</span>
          </span>
        </a>

        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--border-mid)', color: 'var(--muted-light)', textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber-dim)'; e.currentTarget.style.color = 'var(--amber)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--muted-light)'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--border-mid)', background: 'transparent', color: 'var(--muted-light)', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber-dim)'; e.currentTarget.style.color = 'var(--amber)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--muted-light)'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      {!apiKey && (
        <div style={{ borderTop: '1px solid rgba(232,160,32,0.14)', background: 'rgba(232,160,32,0.05)', padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--amber)' }}>
            ◆ Add your Groq API key to begin
          </span>
          <button
            onClick={onOpenSettings}
            style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 5, border: '1px solid rgba(232,160,32,0.4)', background: 'rgba(232,160,32,0.08)', color: 'var(--amber)', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            Open Settings
          </button>
        </div>
      )}
    </header>
  )
}

// ─── Click-spark wrapper ──────────────────────────────────────────────────────

function ClickSpark({ children }) {
  const [sparks, setSparks] = useState([])
  const wrapRef = useRef(null)

  function handleClick(e) {
    const rect = wrapRef.current.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    const id = Date.now()
    setSparks(s => [
      ...s,
      ...Array.from({ length: 8 }, (_, i) => ({ id: id + i, angle: i * 45, cx, cy })),
    ])
    setTimeout(() => setSparks(s => s.filter(sp => sp.id < id)), 520)
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }} onClick={handleClick}>
      {children}
      {sparks.map(s => (
        <span
          key={s.id}
          style={{
            position: 'absolute',
            left: s.cx, top: s.cy,
            width: 5, height: 5,
            borderRadius: '50%',
            background: '#D4A853',
            pointerEvents: 'none',
            zIndex: 20,
            '--sa': `${s.angle}deg`,
            animation: 'spark-burst 0.46s ease-out forwards',
          }}
        />
      ))}
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const [taglineIdx, setTaglineIdx] = useState(0)
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const id = setInterval(() => {
      setTaglineIdx(i => (i + 1) % TAGLINES.length)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  function scrollToArena() {
    document.getElementById('arena')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Shorthand for entrance animation props (disabled for reduced motion)
  function enter(initial, delay = 0, duration = 0.5) {
    return {
      initial: prefersReduced ? false : initial,
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: prefersReduced ? { duration: 0 } : { delay, duration, ease: EASE_OUT },
    }
  }

  return (
    <section style={{ position: 'relative', overflow: 'hidden', paddingTop: 56 }}>

      {/* ── Layer 0: particle canvas ─────────────────────────────────────── */}
      <ParticleField />

      {/* ── Layer 0: original background layers ─────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {/* Large warm radial glow */}
        <div style={{ position: 'absolute', top: '-8%', left: '50%', transform: 'translateX(-50%)', width: 960, height: 640, background: 'radial-gradient(ellipse, rgba(232,160,32,0.09) 0%, transparent 65%)', filter: 'blur(52px)' }} />
        {/* Dot-grid texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(232,160,32,0.065) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Fade to background at the bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to bottom, transparent, var(--bg))' }} />
      </div>

      {/* ── Layer 0.5: focused ambient glows (DEBATE / AI) ──────────────── */}
      <div style={{ position: 'absolute', top: '22%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse at center, rgba(212,168,83,0.07) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translateX(-50%)', width: 400, height: 300, background: 'radial-gradient(ellipse at center, rgba(212,168,83,0.11) 0%, transparent 60%)', zIndex: 0, pointerEvents: 'none' }} />

      {/* ── Layer 0.7: floating decorative diamonds ──────────────────────── */}
      {!prefersReduced && DIAMONDS.map((d, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: d.top,
            left: d.left,
            right: d.right,
            fontSize: d.size,
            color: '#D4A853',
            opacity: d.opacity,
            animation: `float-ember ${d.dur} ease-in-out ${d.delay} infinite`,
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
          }}
        >
          ◆
        </span>
      ))}

      {/* ── Layer 1: all hero content ────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 860, margin: '0 auto', padding: '72px 24px 64px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Hackverse badge */}
        <motion.div
          {...enter({ opacity: 0, y: -16 }, 0, 0.45)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 99, border: '1px solid var(--amber-dim)', background: 'var(--amber-subtle)', marginBottom: 44 }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0, animation: 'arena-pulse 2s infinite' }} />
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--amber)' }}>
            Hackverse X — Global Tech Innovation 2026
          </span>
        </motion.div>

        {/* Main title — DEBATE (letter-by-letter stagger) */}
        <div style={{ width: '100%', marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 0.86 }}>
            <span style={{ display: 'block', fontSize: 'clamp(5rem, 21vw, 14.5rem)', color: 'var(--cream)' }}>
              {'DEBATE'.split('').map((letter, i) => (
                <motion.span
                  key={i}
                  style={{ display: 'inline-block' }}
                  initial={prefersReduced ? false : { opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={prefersReduced ? { duration: 0 } : {
                    delay: i * 0.08,
                    duration: 0.6,
                    ease: EASE_OUT,
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </h1>

          <motion.hr
            className="arena-divider"
            style={{ margin: '12px 0' }}
            {...enter({ opacity: 0 }, 0.55, 0.4)}
          />

          {/* AI — scale-in with continuous amber shimmer */}
          <h1 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 0.86 }}>
            <motion.span
              style={{
                display: 'block',
                fontSize: 'clamp(5rem, 21vw, 14.5rem)',
                background: 'linear-gradient(90deg, #D4A853 30%, #F5E6C8 50%, #D4A853 70%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 3s linear infinite',
                filter: 'drop-shadow(0 0 48px rgba(232,160,32,0.28))',
              }}
              initial={prefersReduced ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={prefersReduced ? { duration: 0 } : { delay: 0.7, duration: 0.55, ease: EASE_OUT }}
            >
              AI
            </motion.span>
          </h1>
        </div>

        {/* Rotating tagline — AnimatePresence crossfade */}
        <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={taglineIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1rem, 3vw, 1.4rem)', fontStyle: 'italic', color: 'var(--cream-dim)', position: 'absolute' }}
            >
              {TAGLINES[taglineIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.p
          {...enter({ opacity: 0, y: 16 }, 0.9, 0.45)}
          style={{ fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 500, letterSpacing: '0.04em', color: 'var(--muted-light)', maxWidth: 420, lineHeight: 1.6, marginBottom: 48 }}
        >
          Real-time argument analysis. Logical fallacy detection. Score your strength 0–100.
        </motion.p>

        {/* CTA button with click-spark effect */}
        <motion.div
          {...enter({ opacity: 0, y: 20 }, 1.0, 0.45)}
          style={{ marginBottom: 52 }}
        >
          <ClickSpark>
            <button
              onClick={scrollToArena}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 14,
                padding: '14px 36px', borderRadius: 6,
                border: '2px solid var(--amber)',
                background: 'var(--amber)', color: '#0A0808',
                fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.10em',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 0 40px rgba(232,160,32,0.45), 0 4px 24px rgba(0,0,0,0.55)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--amber)'
                e.currentTarget.style.boxShadow = '0 0 56px rgba(232,160,32,0.55), 0 4px 28px rgba(0,0,0,0.6)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--amber)'
                e.currentTarget.style.color = '#0A0808'
                e.currentTarget.style.boxShadow = '0 0 40px rgba(232,160,32,0.45), 0 4px 24px rgba(0,0,0,0.55)'
              }}
            >
              ENTER THE ARENA
              <span style={{ fontSize: 18, fontFamily: 'sans-serif', fontWeight: 400 }}>→</span>
            </button>
          </ClickSpark>
        </motion.div>

        {/* Feature pills — stagger reveal */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {PILLS.map((text, i) => (
            <motion.span
              key={text}
              initial={prefersReduced ? false : { opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={prefersReduced ? { duration: 0 } : {
                delay: 1.2 + i * 0.15,
                duration: 0.4,
                ease: 'easeOut',
              }}
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '6px 14px',
                border: '1px solid var(--border-mid)',
                borderRadius: 4,
                fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
                color: 'var(--muted-light)',
                background: 'rgba(255,255,255,0.02)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#D4A853'
                e.currentTarget.style.boxShadow  = '0 0 12px rgba(212,168,83,0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-mid)'
                e.currentTarget.style.boxShadow  = 'none'
              }}
            >
              {text}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const HOW_STEPS = [
  { num: 'I',   title: 'ENTER YOUR ARGUMENT',  body: 'Type any claim, position, or opinion. Pick a preset topic or write your own.',                                                                     accent: 'var(--amber)'       },
  { num: 'II',  title: 'AI PUTS IT ON TRIAL',   body: 'Groq AI generates the strongest counterarguments, detects logical fallacies, and scores your reasoning 0–100.',                                  accent: 'var(--red-light)'   },
  { num: 'III', title: 'IMPROVE & WIN',         body: 'Defend your position or let the AI coach rewrite your argument. Learn what makes arguments bulletproof.',                                         accent: 'var(--green-light)' },
]

function HowItWorksCard({ step, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.15, duration: 0.5, ease: EASE_OUT }}
      style={{ background: 'var(--bg-card)', padding: '28px 24px', position: 'relative', overflow: 'hidden' }}
    >
      {/* Left accent border — grows in after card appears */}
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ delay: index * 0.15 + 0.25, duration: 0.5, ease: 'easeOut' }}
        style={{ position: 'absolute', left: 0, top: 0, width: 3, height: '100%', background: step.accent, transformOrigin: 'top' }}
      />
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, color: step.accent, lineHeight: 1, opacity: 0.45, marginBottom: 14 }}>
        {step.num}
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.07em', color: 'var(--cream)', marginBottom: 10 }}>
        {step.title}
      </h3>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--cream-dim)', lineHeight: 1.65 }}>
        {step.body}
      </p>
    </motion.div>
  )
}

function HowItWorks() {
  return (
    <section style={{ borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px' }}>
        <p style={{ textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 40 }}>
          ◆ How It Works ◆
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 1, background: 'var(--border)' }}>
          {HOW_STEPS.map((step, i) => (
            <HowItWorksCard key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '0.08em', color: 'var(--muted)' }}>
          DEBATE<span style={{ color: 'var(--amber-dim)' }}>AI</span>
        </span>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '0.06em', color: 'var(--muted)', textAlign: 'center' }}>
          Built for <span style={{ color: 'var(--cream-dim)' }}>Hackverse X — Global Tech Innovation 2026</span>
        </p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.05em' }}>
          Powered by{' '}
          <a href="https://groq.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber-dim)', textDecoration: 'none', transition: 'color 0.2s' }}
             onMouseEnter={e => e.currentTarget.style.color = 'var(--amber)'}
             onMouseLeave={e => e.currentTarget.style.color = 'var(--amber-dim)'}
          >Groq</a>
          {' '}+{' '}
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber-dim)', textDecoration: 'none', transition: 'color 0.2s' }}
             onMouseEnter={e => e.currentTarget.style.color = 'var(--amber)'}
             onMouseLeave={e => e.currentTarget.style.color = 'var(--amber-dim)'}
          >React</a>
        </p>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--amber)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          View on GitHub
        </a>
      </div>
    </footer>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || import.meta.env.VITE_GROQ_API_KEY || '')
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--cream)' }}>
      <Navbar apiKey={apiKey} onOpenSettings={() => setSettingsOpen(true)} />

      <Hero />

      <section id="arena" style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 34, letterSpacing: '0.07em', color: 'var(--cream)', lineHeight: 1, whiteSpace: 'nowrap' }}>
              THE ARENA
            </span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, var(--amber-dim), transparent)' }} />
          </div>
          <ArgumentArena apiKey={apiKey} onNeedSettings={() => setSettingsOpen(true)} />
        </div>
      </section>

      <HowItWorks />
      <Footer />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={apiKey}
        onSaveKey={setApiKey}
      />
    </div>
  )
}
