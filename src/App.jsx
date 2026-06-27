import { useState, useEffect } from 'react'
import ArgumentArena from './components/ArgumentArena'
import ModeSelector from './components/ModeSelector'
import SettingsModal from './components/SettingsModal'
import { useDebateAI } from './hooks/useDebateAI'

const STORAGE_KEY = 'debateai_groq_key'

const TAGLINES = [
  'AI that destroys your argument.',
  'AI that defends your position.',
  'AI that makes you unbeatable.',
]

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar({ apiKey, onOpenSettings }) {
  return (
    <header
      className="fixed top-0 inset-x-0 z-40 border-b border-[#1e1e2e]"
      style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(14px)' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 select-none">
          <span className="text-xl">⚔️</span>
          <span className="font-bold text-white tracking-tight text-base">DebateAI</span>
        </a>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* GitHub */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#1e1e2e]
                       text-gray-500 hover:text-white hover:border-gray-600 transition-all duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#1e1e2e]
                       text-gray-500 hover:text-white hover:border-gray-600 transition-all duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      {/* API key warning banner */}
      {!apiKey && (
        <div
          className="border-t border-[#2a1a00] px-4 py-2 flex items-center justify-center gap-3 text-xs text-amber-400"
          style={{ background: 'rgba(245,158,11,0.07)' }}
        >
          <span>⚠️ Add your Groq API key in Settings to start →</span>
          <button
            onClick={onOpenSettings}
            className="px-2.5 py-1 rounded-md text-xs font-semibold border border-amber-500/40
                       text-amber-300 hover:bg-amber-500/10 transition-all duration-150"
          >
            Open Settings
          </button>
        </div>
      )}
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const [taglineIdx, setTaglineIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setTaglineIdx((i) => (i + 1) % TAGLINES.length)
        setFade(true)
      }, 300)
    }, 2000)
    return () => clearInterval(id)
  }, [])

  function scrollToArena() {
    document.getElementById('arena')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: '100vh', paddingTop: '56px' }}
    >
      {/* Faint grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      {/* Radial fade over grid so edges disappear */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, #0a0a0f 100%)',
        }}
      />
      {/* Blue ambient glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: '600px',
          height: '300px',
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto">
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs text-gray-400 mb-8"
          style={{ borderColor: '#1e1e2e', background: 'rgba(30,30,46,0.6)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          Hackverse X — Global Tech Innovation 2026
        </div>

        {/* Main heading */}
        <h1
          className="font-black text-white leading-none mb-6"
          style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', letterSpacing: '-0.03em' }}
        >
          <span
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Debate
          </span>
          <span
            style={{
              display: 'inline-block',
              position: 'relative',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            AI
            {/* Blue underline accent */}
            <span
              style={{
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                right: 0,
                height: '3px',
                borderRadius: '2px',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                opacity: 0.8,
              }}
            />
          </span>
        </h1>

        {/* Rotating tagline */}
        <div className="h-8 mb-5 flex items-center justify-center">
          <p
            className="text-lg sm:text-xl font-medium text-gray-300 transition-opacity duration-300"
            style={{ opacity: fade ? 1 : 0 }}
          >
            {TAGLINES[taglineIdx]}
          </p>
        </div>

        {/* Subtext */}
        <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto leading-relaxed mb-10">
          Real-time argument analysis. Logical fallacy detection. Score your strength 0–100.
        </p>

        {/* CTA button */}
        <button
          onClick={scrollToArena}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white
                     transition-all duration-200 active:scale-[0.97] mb-12"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            boxShadow: '0 0 32px rgba(59,130,246,0.45), 0 4px 16px rgba(0,0,0,0.4)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 48px rgba(59,130,246,0.6), 0 4px 20px rgba(0,0,0,0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 32px rgba(59,130,246,0.45), 0 4px 16px rgba(0,0,0,0.4)'
          }}
        >
          Start Debating
          <span className="text-base">→</span>
        </button>

        {/* Stat pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: '⚡', text: 'Groq-powered' },
            { icon: '🧠', text: '3 Analysis modes' },
            { icon: '🎯', text: 'Fallacy detection' },
          ].map(({ icon, text }) => (
            <span
              key={text}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-400"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span>{icon}</span>
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const cards = [
    {
      step: '01',
      title: 'Enter your argument',
      body: 'Type any claim, position, or opinion you want to test. Pick a preset topic or write your own.',
      accent: '#3b82f6',
      icon: '✍️',
    },
    {
      step: '02',
      title: 'AI attacks it',
      body: 'Groq AI generates the strongest possible counterarguments, detects logical fallacies, and scores your reasoning 0–100.',
      accent: '#ef4444',
      icon: '⚔️',
    },
    {
      step: '03',
      title: 'Improve & win',
      body: 'Defend your position or let the AI coach rewrite your argument. Learn what makes arguments bulletproof.',
      accent: '#22c55e',
      icon: '🏆',
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6" style={{ borderTop: '1px solid #1e1e2e' }}>
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-[#3b82f6] uppercase mb-12">
          How It Works
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.step}
              className="relative rounded-2xl p-6 overflow-hidden"
              style={{
                background: '#13131a',
                border: '1px solid #1e1e2e',
                borderTop: `3px solid ${card.accent}`,
              }}
            >
              {/* Faint step number watermark */}
              <span
                className="absolute top-4 right-5 font-black select-none"
                style={{ fontSize: '3.5rem', color: `${card.accent}12`, lineHeight: 1 }}
              >
                {card.step}
              </span>

              <span className="text-2xl mb-4 block">{card.icon}</span>
              <h3 className="font-semibold text-white text-base mb-2">{card.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      className="py-10 px-4 sm:px-6 text-center space-y-3"
      style={{ borderTop: '1px solid #1e1e2e' }}
    >
      <p className="text-sm text-gray-600">
        Built with ❤️ for{' '}
        <span className="text-gray-400 font-medium">Hackverse X — Global Tech Innovation 2026</span>
      </p>
      <p className="text-xs text-gray-700">
        Powered by{' '}
        <a
          href="https://groq.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
        >
          Groq
        </a>{' '}
        +{' '}
        <a
          href="https://react.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
        >
          React
        </a>
      </p>
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-400 transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
        View on GitHub
      </a>
    </footer>
  )
}

// ─── Arena section wrapper ────────────────────────────────────────────────────

function ArenaSection({ apiKey, onNeedSettings }) {
  const debate = useDebateAI()

  return (
    <section id="arena" className="py-20 px-4 sm:px-6" style={{ borderTop: '1px solid #1e1e2e' }}>
      <div className="max-w-[860px] mx-auto space-y-8">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#3b82f6] uppercase">
            Argument Arena
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <ModeSelector currentMode={debate.mode} onModeChange={debate.setMode} />
        </div>

        <ArgumentArena apiKey={apiKey} externalDebate={debate} onNeedSettings={onNeedSettings} />
      </div>
    </section>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '')
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f', color: '#e5e7eb' }}>
      <Navbar apiKey={apiKey} onOpenSettings={() => setSettingsOpen(true)} />

      <Hero />
      <ArenaSection apiKey={apiKey} onNeedSettings={() => setSettingsOpen(true)} />
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
