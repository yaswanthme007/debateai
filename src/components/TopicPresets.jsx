const PRESETS = [
  'AI will replace all jobs',
  'Social media harms democracy',
  'Climate action needs to be radical',
  'Remote work is the future',
  'Crypto is the future of money',
  'Space exploration is worth the cost',
]

export default function TopicPresets({ onSelect }) {
  return (
    <div style={{ width: '100%' }}>
      <span style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--muted-light)', marginBottom: 10 }}>
        ◆ Quick Start — Try a Topic
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {PRESETS.map((topic) => (
          <button
            key={topic}
            onClick={() => onSelect(topic)}
            style={{
              padding: '6px 13px',
              border: '1px solid rgba(232,160,32,0.22)',
              borderRadius: 4,
              background: 'rgba(232,160,32,0.055)',
              color: 'var(--amber-light)',
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(232,160,32,0.55)'
              e.currentTarget.style.background = 'rgba(232,160,32,0.13)'
              e.currentTarget.style.boxShadow = '0 0 12px rgba(232,160,32,0.14)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(232,160,32,0.22)'
              e.currentTarget.style.background = 'rgba(232,160,32,0.055)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  )
}
