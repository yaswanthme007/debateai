import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function FallacyPill({ fallacy, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      style={{ position: 'relative' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.25, ease: 'easeOut' }}
    >
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        style={{
          padding: '6px 14px',
          minHeight: 34,
          borderRadius: 4,
          border: '1px solid',
          borderColor: hovered ? 'var(--red-light)' : 'rgba(194,56,40,0.38)',
          background: hovered ? 'rgba(194,56,40,0.18)' : 'rgba(194,56,40,0.09)',
          color: 'var(--red-light)',
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: 'default',
          transition: 'all 0.15s',
          boxShadow: hovered ? '0 0 18px var(--red-glow)' : 'none',
        }}
      >
        {fallacy.name}
      </button>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', zIndex: 20, top: '100%', marginTop: 8,
              left: '50%', transform: 'translateX(-50%)',
              width: 264, padding: '12px 14px', borderRadius: 6,
              background: '#130808', border: '1px solid rgba(194,56,40,0.28)',
              boxShadow: '0 8px 36px rgba(0,0,0,0.75)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--red-light)', display: 'block', marginBottom: 7 }}>
              {fallacy.name}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--cream-dim)', lineHeight: 1.55, display: 'block' }}>
              {fallacy.explanation}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FallacyDetector({ fallacies }) {
  if (fallacies === null || fallacies === undefined) return null

  return (
    <div style={{ width: '100%' }}>
      <span style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--muted-light)', marginBottom: 12 }}>
        Logical Fallacies Detected
      </span>

      {fallacies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-light)', flexShrink: 0, boxShadow: '0 0 8px var(--green-glow)' }} />
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--green-light)' }}>
            No logical fallacies detected — clean argument
          </span>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {fallacies.map((f, i) => (
            <FallacyPill key={f.name + i} fallacy={f} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(FallacyDetector)
