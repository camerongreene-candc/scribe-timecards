import { useEffect, useRef, type RefObject } from 'react'

interface ParticleStreamProps {
  progress: number
  sourceRef: RefObject<HTMLDivElement>
  targetRef: RefObject<HTMLDivElement>
}

interface Particle {
  t: number
  speed: number
  destY: number  // absolute CSS px within canvas
  r: number
  g: number
  b: number
}

const MAX_PARTICLES = 170
const DOT_RADIUS = 3
const ORB_RADIUS_PX = 150  // TransferOrb is always size=300

function pickColor(): [number, number, number] {
  const rnd = Math.random()
  if (rnd < 0.12) {
    return [
      Math.round((0.55 + Math.random() * 0.15) * 255),
      Math.round((0.70 + Math.random() * 0.15) * 255),
      Math.round((0.92 + Math.random() * 0.08) * 255),
    ]
  } else if (rnd < 0.48) {
    return [
      Math.round((0.05 + Math.random() * 0.15) * 255),
      Math.round((0.60 + Math.random() * 0.40) * 255),
      Math.round((0.80 + Math.random() * 0.20) * 255),
    ]
  } else {
    return [
      Math.round((0.05 + Math.random() * 0.15) * 255),
      Math.round((0.10 + Math.random() * 0.25) * 255),
      Math.round((0.60 + Math.random() * 0.40) * 255),
    ]
  }
}

function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const u = 1 - t
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
}

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export function ParticleStream({ progress, sourceRef, targetRef }: ParticleStreamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(progress)

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !sourceRef.current || !targetRef.current) return

    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1

    const cssW = canvas.offsetWidth
    const cssH = canvas.offsetHeight
    canvas.width = cssW * dpr
    canvas.height = cssH * dpr
    ctx.scale(dpr, dpr)

    // Use offset* (layout position, unaffected by CSS transforms / enter animations)
    // offsetParent for both panels and the canvas is processingTopRow (position:relative)
    const src = sourceRef.current
    const tgt = targetRef.current

    const startX = src.offsetLeft + src.offsetWidth / 2
    const startY = src.offsetTop + src.offsetHeight / 2

    const orbCenterX = tgt.offsetLeft + tgt.offsetWidth / 2
    const orbCenterY = tgt.offsetTop + tgt.offsetHeight / 2
    const endX = orbCenterX - ORB_RADIUS_PX
    const orbTopY = orbCenterY - ORB_RADIUS_PX
    const orbBotY = orbCenterY + ORB_RADIUS_PX

    const particles: Particle[] = []
    let animId: number
    let lastTime: number | null = null
    let spawnAccum = 0
    let elapsed = 0

    function spawn() {
      const [r, g, b] = pickColor()
      particles.push({
        t: 0,
        speed: 0.55 + Math.random() * 0.45,
        destY: orbTopY + Math.random() * (orbBotY - orbTopY),
        r, g, b,
      })
    }

    function frame(now: number) {
      animId = requestAnimationFrame(frame)
      const dt = lastTime !== null ? Math.min((now - lastTime) / 1000, 0.05) : 0
      lastTime = now
      elapsed += dt

      const prog = progressRef.current

      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].t += particles[i].speed * dt
        if (particles[i].t >= 1) particles.splice(i, 1)
      }

      const target = elapsed >= 0.25 ? MAX_PARTICLES * Math.sin(Math.PI * prog) : 0
      if (particles.length < target) {
        spawnAccum += (target - particles.length) * dt * 8
        while (spawnAccum >= 1 && particles.length < MAX_PARTICLES) {
          spawnAccum -= 1
          spawn()
        }
      }

      ctx.clearRect(0, 0, cssW, cssH)

      for (const p of particles) {
        // Depart horizontally from file center, curve toward orb surface point
        const span = endX - startX
        const x = cubicBezier(p.t, startX, startX + span * 0.4, endX - span * 0.4, endX)
        const y = cubicBezier(p.t, startY, startY, p.destY, p.destY)

        const alpha = 0.6 * smoothstep(0, 0.12, p.t) * (1 - smoothstep(0.82, 1.0, p.t))

        const grad = ctx.createRadialGradient(x, y, 0, x, y, DOT_RADIUS)
        grad.addColorStop(0, `rgba(${p.r},${p.g},${p.b},${alpha.toFixed(3)})`)
        grad.addColorStop(1, `rgba(${p.r},${p.g},${p.b},0)`)

        ctx.beginPath()
        ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }
    }

    animId = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(animId)
  // refs are stable (useRef), so this only runs once after mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}
