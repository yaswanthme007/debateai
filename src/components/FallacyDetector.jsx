import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function FallacyPill({ fallacy, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.25, ease: 'easeOut' }}
    >
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide cursor-default
                   bg-[#2d1111] border border-[#ef4444]/40 text-[#f87171]
                   hover:bg-[#3d1515] hover:border-[#ef4444]/70 transition-all duration-150"
        style={{ boxShadow: hovered ? '0 0 12px rgba(239,68,68,0.3)' : undefined }}
      >
        {fallacy.name}
      </button>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 top-full mt-2 left-1/2 -translate-x-1/2
                       w-64 p-3 rounded-xl text-xs text-gray-300 leading-relaxed
                       bg-[#1a0a0a] border border-[#ef4444]/30"
            style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
          >
            <span className="font-semibold text-[#f87171] block mb-1">{fallacy.name}</span>
            {fallacy.explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FallacyDetector({ fallacies }) {
  if (fallacies === null || fallacies === undefined) return null

  return (
    <div className="w-full space-y-3">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
        Logical Fallacies Detected
      </span>

      {fallacies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-[#4ade80]"
        >
          <span className="text-base">✅</span>
          <span>No logical fallacies detected — clean argument!</span>
        </motion.div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {fallacies.map((f, i) => (
            <FallacyPill key={f.name + i} fallacy={f} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
