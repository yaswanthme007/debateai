/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'debate-bg':     '#0a0a0f',
        'debate-card':   '#13131a',
        'debate-border': '#1e1e2e',
        'debate-blue':   '#3b82f6',
        'debate-red':    '#ef4444',
        'debate-green':  '#22c55e',
        'debate-amber':  '#f59e0b',
      },
    },
  },
  plugins: [],
}

