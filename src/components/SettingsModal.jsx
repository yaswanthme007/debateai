import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'debateai_groq_key'

export default function SettingsModal({ isOpen, onClose, apiKey, onSaveKey }) {
  const [input, setInput] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setInput(localStorage.getItem(STORAGE_KEY) ?? apiKey ?? '')
      setVisible(false)
    }
  }, [isOpen, apiKey])

  function handleSave() {
    const trimmed = input.trim()
    if (trimmed) localStorage.setItem(STORAGE_KEY, trimmed)
    else localStorage.removeItem(STORAGE_KEY)
    onSaveKey(trimmed)
    onClose()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') onClose()
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="settings-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="settings-modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}
          >
            <div
              style={{
                width: '100%', maxWidth: 420,
                borderRadius: 10, border: '1px solid var(--border-mid)',
                padding: 24,
                background: 'var(--bg-card)',
                boxShadow: '0 0 48px rgba(232,160,32,0.10), 0 24px 56px rgba(0,0,0,0.75)',
                pointerEvents: 'auto',
                display: 'flex', flexDirection: 'column', gap: 20,
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '0.07em', color: 'var(--cream)', lineHeight: 1 }}>
                    API SETTINGS
                  </h2>
                  <div style={{ height: 2, width: 48, background: 'var(--amber)', borderRadius: 1, marginTop: 6 }} />
                </div>
                <button
                  onClick={onClose}
                  style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: '1px solid var(--border-mid)', background: 'transparent', color: 'var(--muted-light)', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.15s' }}
                  aria-label="Close"
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber-dim)'; e.currentTarget.style.color = 'var(--amber)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--muted-light)'; }}
                >
                  ✕
                </button>
              </div>

              {/* Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted-light)', display: 'block' }}>
                  Groq API Key
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={visible ? 'text' : 'password'}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="gsk_••••••••••••••••••••••••••"
                    autoFocus
                    style={{
                      width: '100%', padding: '12px 44px 12px 14px', borderRadius: 8,
                      border: '1px solid var(--border-mid)',
                      background: 'var(--bg)', color: 'var(--cream)',
                      fontFamily: 'var(--font-mono)', fontSize: 13,
                      outline: 'none', transition: 'border-color 0.2s',
                      caretColor: 'var(--amber)',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--amber-dim)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
                  />
                  <button
                    type="button"
                    onClick={() => setVisible(v => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--muted-light)', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--amber)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-light)'}
                    aria-label={visible ? 'Hide key' : 'Show key'}
                  >
                    {visible ? '🙈' : '👁️'}
                  </button>
                </div>
                <a
                  href="https://console.groq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--amber-dim)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--amber)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--amber-dim)'}
                >
                  Get your free API key at console.groq.com ↗
                </a>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 8, cursor: 'pointer',
                    border: '1px solid var(--border-mid)', background: 'transparent',
                    fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, letterSpacing: '0.05em',
                    color: 'var(--muted-light)', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--cream-dim)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--muted-light)'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 8, cursor: 'pointer',
                    border: '2px solid var(--amber-dim)', background: 'var(--amber)', color: '#0A0808',
                    fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.08em',
                    transition: 'all 0.15s',
                    boxShadow: '0 0 20px rgba(232,160,32,0.35)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(232,160,32,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(232,160,32,0.35)'; }}
                >
                  SAVE KEY
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
