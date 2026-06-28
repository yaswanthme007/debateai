import { useRef, useEffect } from 'react'

const COLORS = ['#D4A853', '#B8860B', '#F5E6C8']
const REPULSE_RADIUS = 120
const LINK_RADIUS    = 100

function rand(a, b) { return a + Math.random() * (b - a) }

export default function ParticleField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.innerWidth < 768
    const COUNT = isMobile ? 40 : 80

    let W = 0, H = 0
    let mouseX = -9999, mouseY = -9999
    let rafId = null
    const hero = canvas.parentElement

    function resize() {
      if (!hero) return
      const r = hero.getBoundingClientRect()
      W = canvas.width  = Math.round(r.width)
      H = canvas.height = Math.round(r.height)
    }
    resize()

    function makeParticle(spawnAtBottom = false) {
      return {
        x:   rand(0, W),
        y:   spawnAtBottom ? H + rand(4, 12) : rand(0, H),
        bvx: rand(-0.08, 0.08),
        bvy: rand(-0.35, -0.12),
        evx: 0,
        evy: 0,
        r:   rand(1, 2.8),
        op:  rand(0.2, 0.72),
        col: COLORS[0 | (Math.random() * COLORS.length)],
      }
    }

    const pts = Array.from({ length: COUNT }, () => makeParticle(false))

    function onMouseMove(e) {
      const r = canvas.getBoundingClientRect()
      mouseX = e.clientX - r.left
      mouseY = e.clientY - r.top
    }
    function onMouseLeave() { mouseX = -9999; mouseY = -9999 }

    hero.addEventListener('mousemove',  onMouseMove,  { passive: true })
    hero.addEventListener('mouseleave', onMouseLeave)

    function frame() {
      ctx.clearRect(0, 0, W, H)

      // Connecting lines between nearby particles
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i]
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < LINK_RADIUS * LINK_RADIUS) {
            const alpha = ((1 - Math.sqrt(d2) / LINK_RADIUS) * 0.12).toFixed(3)
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(212,168,83,${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Update and draw each particle
      for (const p of pts) {
        // Mouse repulsion — smooth physics, not teleportation
        const dx = p.x - mouseX
        const dy = p.y - mouseY
        const d  = Math.sqrt(dx * dx + dy * dy)
        if (d < REPULSE_RADIUS && d > 1) {
          const force = ((REPULSE_RADIUS - d) / REPULSE_RADIUS) * 1.1
          p.evx += (dx / d) * force
          p.evy += (dy / d) * force
        }
        p.evx *= 0.88
        p.evy *= 0.88

        p.x += p.bvx + p.evx
        p.y += p.bvy + p.evy

        // Respawn at bottom when particle exits through the top
        if (p.y < -8) {
          p.x   = rand(0, W)
          p.y   = H + 8
          p.bvx = rand(-0.08, 0.08)
          p.bvy = rand(-0.35, -0.12)
          p.evx = 0
          p.evy = 0
        }
        // Horizontal wrap
        if (p.x < -8)    p.x = W + 8
        if (p.x > W + 8) p.x = -8

        // Draw particle with its fixed opacity
        const hexA = Math.round(p.op * 255).toString(16).padStart(2, '0')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.col + hexA
        ctx.fill()
      }

      if (!prefersReduced) rafId = requestAnimationFrame(frame)
    }

    // First frame is always rendered; subsequent frames only if motion allowed
    frame()

    const ro = new ResizeObserver(resize)
    ro.observe(hero)

    return () => {
      cancelAnimationFrame(rafId)
      hero.removeEventListener('mousemove',  onMouseMove)
      hero.removeEventListener('mouseleave', onMouseLeave)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  )
}
