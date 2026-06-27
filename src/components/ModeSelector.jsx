const MODES = [
  {
    id: 'attack',
    label: '⚔️ Attack',
    description: 'AI destroys your argument',
    activeStyle: {
      background: 'rgba(239,68,68,0.15)',
      borderColor: '#ef4444',
      boxShadow: '0 0 20px rgba(239,68,68,0.4)',
      color: '#f87171',
    },
    hoverBorder: '#ef4444',
  },
  {
    id: 'defend',
    label: '🛡️ Defend',
    description: 'AI helps you fight back',
    activeStyle: {
      background: 'rgba(59,130,246,0.15)',
      borderColor: '#3b82f6',
      boxShadow: '0 0 20px rgba(59,130,246,0.4)',
      color: '#60a5fa',
    },
    hoverBorder: '#3b82f6',
  },
  {
    id: 'coach',
    label: '🎯 Coach',
    description: 'AI rewrites it perfectly',
    activeStyle: {
      background: 'rgba(34,197,94,0.15)',
      borderColor: '#22c55e',
      boxShadow: '0 0 20px rgba(34,197,94,0.4)',
      color: '#4ade80',
    },
    hoverBorder: '#22c55e',
  },
]

export default function ModeSelector({ currentMode, onModeChange }) {
  return (
    <div className="flex gap-3 w-full">
      {MODES.map((m) => {
        const isActive = currentMode === m.id
        return (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            style={isActive ? m.activeStyle : undefined}
            className={[
              'flex-1 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border',
              'transition-all duration-200 cursor-pointer select-none',
              isActive
                ? ''
                : 'bg-[#13131a] border-[#1e1e2e] text-gray-400 hover:border-gray-500 hover:text-gray-200 hover:bg-[#1a1a24]',
            ].join(' ')}
          >
            <span className="text-base font-semibold tracking-wide">{m.label}</span>
            <span className="text-[11px] opacity-70 font-normal">{m.description}</span>
          </button>
        )
      })}
    </div>
  )
}
