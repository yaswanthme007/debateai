const MODES = [
  {
    id: 'attack',
    label: 'ATTACK',
    icon: '⚔',
    description: 'AI destroys your argument',
    activeStyle: {
      background: 'var(--red-subtle)',
      borderColor: 'var(--red)',
      boxShadow: '0 0 22px var(--red-glow)',
      color: 'var(--red-light)',
    },
  },
  {
    id: 'defend',
    label: 'DEFEND',
    icon: '🛡',
    description: 'AI helps you fight back',
    activeStyle: {
      background: 'var(--blue-subtle)',
      borderColor: 'var(--blue)',
      boxShadow: '0 0 22px var(--blue-glow)',
      color: 'var(--blue-light)',
    },
  },
  {
    id: 'coach',
    label: 'COACH',
    icon: '🎯',
    description: 'AI rewrites it perfectly',
    activeStyle: {
      background: 'var(--green-subtle)',
      borderColor: 'var(--green)',
      boxShadow: '0 0 22px var(--green-glow)',
      color: 'var(--green-light)',
    },
  },
]

export default function ModeSelector({ currentMode, onModeChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--muted-light)' }}>
        ◆ Select Mode
      </span>
      <div style={{ display: 'flex', gap: 8 }}>
        {MODES.map((m) => {
          const isActive = currentMode === m.id
          return (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              style={{
                flex: 1,
                padding: '12px 8px',
                border: '1px solid',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.18s',
                textAlign: 'center',
                ...(isActive
                  ? m.activeStyle
                  : { background: 'var(--bg-card)', borderColor: 'var(--border-mid)', color: 'var(--muted-light)' }),
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--border-strong)'
                  e.currentTarget.style.color = 'var(--cream-dim)'
                  e.currentTarget.style.background = 'var(--bg-raised)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--border-mid)'
                  e.currentTarget.style.color = 'var(--muted-light)'
                  e.currentTarget.style.background = 'var(--bg-card)'
                }
              }}
            >
              <span style={{ display: 'block', fontSize: 18, marginBottom: 4 }}>{m.icon}</span>
              <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 19, letterSpacing: '0.07em', lineHeight: 1, marginBottom: 4 }}>
                {m.label}
              </span>
              <span style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 400, opacity: 0.65, lineHeight: 1.3 }}>
                {m.description}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
