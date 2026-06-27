import { useState, useEffect } from 'react'
import ArgumentArena from './components/ArgumentArena'
import SettingsModal from './components/SettingsModal'

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
      style={{ background: 'rgba(10,10,15,0.88)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 24px' }}>
        <a href="#" className="flex items-center gap-2.5 select-none">
          <span className="text-xl">⚔️</span>
          <span className="font-bold text-white tracking-tight text-base">DebateAI</span>
        </a>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#1e1e2e] text-gray-500 hover:text-white hover:border-gray-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#1e1e2e] text-gray-500 hover:text-white hover:border-gray-600 transition-colors"
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
            className="px-2.5 py-1 rounded-md text-xs font-semibold border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 transition-colors"
          >
            Open Settings
          </button>
        </div>
      )}
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ apiKey }) {
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
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, #0a0a0f 100%)' }}
      />
      <div
        className="pointer-events-none absolute"
        style={{ width: '600px', height: '300px', top: '25%', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '100px', paddingBottom: '40px', paddingLeft: '24px', paddingRight: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs text-gray-400 mb-8"
          style={{ borderColor: '#1e1e2e', background: 'rgba(30,30,46,0.6)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Hackverse X — Global Tech Innovation 2026
        </div>

        <h1
          className="font-black text-white leading-none mb-6"
          style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', letterSpacing: '-0.03em' }}
        >
          <span
            style={{ background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >Debate</span>
          <span
            style={{ display: 'inline-block', position: 'relative', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            AI
            <span style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', opacity: 0.8 }} />
          </span>
        </h1>

        <div className="h-8 mb-5 flex items-center justify-center overflow-hidden">
          <p
            className="text-lg sm:text-xl font-medium text-gray-300"
            style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.3s ease' }}
          >
            {TAGLINES[taglineIdx]}
          </p>
        </div>

        <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto leading-relaxed mb-10">
          Real-time argument analysis. Logical fallacy detection. Score your strength 0–100.
        </p>

        <button
          onClick={scrollToArena}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 active:scale-[0.97] mb-12"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 0 32px rgba(59,130,246,0.45), 0 4px 16px rgba(0,0,0,0.4)' }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 48px rgba(59,130,246,0.6), 0 4px 20px rgba(0,0,0,0.4)' }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 32px rgba(59,130,246,0.45), 0 4px 16px rgba(0,0,0,0.4)' }}
        >
          Start Debating
          <span>→</span>
        </button>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: '⚡', text: 'Groq-powered' },
            { icon: '🧠', text: '3 Analysis modes' },
            { icon: '🎯', text: 'Fallacy detection' },
          ].map(({ icon, text }) => (
            <span
              key={text}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-400"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {icon} {text}
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
    { step: '01', title: 'Enter your argument', body: 'Type any claim, position, or opinion. Pick a preset topic or write your own.', accent: '#3b82f6', icon: '✍️' },
    { step: '02', title: 'AI attacks it', body: 'Groq AI generates the strongest counterarguments, detects logical fallacies, and scores your reasoning 0–100.', accent: '#ef4444', icon: '⚔️' },
    { step: '03', title: 'Improve & win', body: 'Defend your position or let the AI coach rewrite your argument. Learn what makes arguments bulletproof.', accent: '#22c55e', icon: '🏆' },
  ]
  return (
    <section style={{ borderTop: '1px solid #1e1e2e' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px' }}>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.2em', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '3rem' }}>
          How It Works
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {cards.map((card) => (
            <div
              key={card.step}
              style={{ background: '#13131a', border: '1px solid #1e1e2e', borderTop: `3px solid ${card.accent}`, borderRadius: '1rem', padding: '1.5rem' }}
            >
              <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '1rem' }}>{card.icon}</span>
              <h3 style={{ fontWeight: 600, color: '#ffffff', fontSize: '1rem', marginBottom: '0.5rem' }}>{card.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 }}>{card.body}</p>
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
    <footer className="py-10 px-4 sm:px-6 text-center space-y-3" style={{ borderTop: '1px solid #1e1e2e' }}>
      <p className="text-sm text-gray-600">
        Built with ❤️ for <span className="text-gray-400 font-medium">Hackverse X — Global Tech Innovation 2026</span>
      </p>
      <p className="text-xs text-gray-700">
        Powered by{' '}
        <a href="https://groq.com" target="_blank" rel="noopener noreferrer" className="text-[#3b82f6] hover:text-[#60a5fa] transition-colors">Groq</a>
        {' '}+{' '}
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="text-[#3b82f6] hover:text-[#60a5fa] transition-colors">React</a>
      </p>
      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-400 transition-colors">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
        View on GitHub
      </a>
    </footer>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || import.meta.env.VITE_GROQ_API_KEY || '')
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f8fafc' }}>
      <Navbar apiKey={apiKey} onOpenSettings={() => setSettingsOpen(true)} />

      <Hero apiKey={apiKey} />

      <section id="arena" style={{ borderTop: '1px solid #1e1e2e' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px 80px' }}>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.2em', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '2rem' }}>
            Argument Arena
          </p>
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
