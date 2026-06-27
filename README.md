# ⚔️ DebateAI — Real-Time Argument Coach

> AI that fights back — so you always win every argument

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://YOUR_USERNAME.github.io/debateai)
[![Built for](https://img.shields.io/badge/Built%20for-Hackverse%20X%202026-purple)]()
[![Powered by](https://img.shields.io/badge/Powered%20by-Groq%20AI-orange)]()

---

## What is DebateAI?

DebateAI is an AI-powered real-time argument coach that makes you a better thinker, debater, and communicator. Type any claim — AI tears it apart, detects your logical fallacies, scores your argument 0–100, then coaches you to rebuild it bulletproof.

Built in 48 hours for **Hackverse X — Global Tech Innovation 2026**.

---

## Features

| Feature | Description |
|---|---|
| ⚔️ **Attack mode** | AI generates the 3 strongest counterarguments to your claim |
| 🛡️ **Defend mode** | AI helps you build rebuttals to survive the counterattacks |
| 🎯 **Coach mode** | AI rewrites your argument to be as strong as possible |
| 📊 **Strength meter** | Animated 0–100 score with live color feedback |
| 🔍 **Fallacy detector** | Identifies logical fallacies with hover explanations |
| ⚡ **Groq-powered** | Near-instant responses using llama-3.3-70b-versatile |
| 🆚 **Comparison mode** | Test two arguments head-to-head with a winner banner |
| 📋 **Share result** | Copy a formatted summary to clipboard in one click |

---

## Tech Stack

- **Frontend** — React 19 + Vite 8
- **Styling** — Tailwind CSS v4 + Framer Motion
- **AI** — Groq API (`llama-3.3-70b-versatile`)
- **Deployment** — GitHub Pages via GitHub Actions

---

## Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/debateai
cd debateai
npm install
echo "VITE_GROQ_API_KEY=your_key_here" > .env
npm run dev
```

Get a **free** Groq API key at [console.groq.com](https://console.groq.com) — no credit card required.

---

## Project Structure

```
src/
├── components/
│   ├── ArgumentArena.jsx   # Main debate interface
│   ├── StrengthMeter.jsx   # Animated 0-100 score bar
│   ├── FallacyDetector.jsx # Logical fallacy pills with tooltips
│   ├── ModeSelector.jsx    # Attack / Defend / Coach toggle
│   ├── TopicPresets.jsx    # Quick-start topic chips
│   ├── ShareCard.jsx       # Copyable result card
│   ├── ComparisonMode.jsx  # Side-by-side argument compare
│   └── SettingsModal.jsx   # API key management
├── hooks/
│   ├── useDebateAI.js      # Core analysis orchestration
│   └── useTypewriter.js    # Character-by-character animation
└── lib/
    ├── groq.js             # Groq API client with typed errors
    └── prompts.js          # System prompts for each mode
```

---

## Deployment

This project deploys automatically to GitHub Pages on every push to `main`.

To set it up on your fork:

1. Go to **Settings → Pages** and set source to `gh-pages` branch
2. Add your Groq API key as a repository secret named `VITE_GROQ_API_KEY` *(optional — users can enter their own key in the app)*
3. Push to `main` — the workflow handles the rest

---

## Built For

**Hackverse X — Global Tech Innovation 2026**
Track: AI & Automation

---

<p align="center">Made with ❤️ and way too much coffee</p>
