import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'debateai_groq_key'

export default function SettingsModal({ isOpen, onClose, apiKey, onSaveKey }) {
  const [input, setInput] = useState('')
  const [visible, setVisible] = useState(false)

  // Pre-fill with stored key whenever modal opens
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

  // Use two separate AnimatePresence blocks — framer-motion v12 handles direct keyed
  // children most reliably; avoid wrapping both in a fragment inside one AnimatePresence.
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
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-[#1e1e2e] p-6 space-y-5"
              style={{
                background: '#13131a',
                boxShadow: '0 0 40px rgba(59,130,246,0.15), 0 24px 48px rgba(0,0,0,0.7)',
                pointerEvents: 'auto',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">API Settings</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-[#1e1e2e] transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-widest block">
                  Groq API Key
                </label>
                <div className="relative">
                  <input
                    type={visible ? 'text' : 'password'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="gsk_••••••••••••••••••••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm font-mono bg-[#0a0a0f] border border-[#1e1e2e] text-gray-200 placeholder-gray-600 outline-none focus:border-[#3b82f6] transition-colors"
                    style={{ caretColor: '#3b82f6' }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
                    aria-label={visible ? 'Hide key' : 'Show key'}
                  >
                    {visible ? '🙈' : '👁️'}
                  </button>
                </div>
                <a
                  href="https://console.groq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors inline-block"
                >
                  Get your free API key at console.groq.com ↗
                </a>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-[#1e1e2e] text-gray-400 hover:border-gray-600 hover:text-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-all"
                  style={{ boxShadow: '0 0 16px rgba(59,130,246,0.35)' }}
                >
                  Save Key
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
