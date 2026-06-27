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
    <div className="w-full space-y-2.5">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
        Quick start — try a topic:
      </span>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((topic) => (
          <button
            key={topic}
            onClick={() => onSelect(topic)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium
                       bg-[#0d1524] border border-[#3b82f6]/30 text-[#93c5fd]
                       hover:bg-[#1a2d4a] hover:border-[#3b82f6]/70 hover:text-white
                       transition-all duration-150 cursor-pointer"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  )
}
