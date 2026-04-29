import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export interface TransferOrbProps {
  /** External control (0–1). Omit to let the orb run its own timer. */
  progress?: number
  /** Seconds for one full pass in self-controlled mode. Default 10. */
  duration?: number
  /** Start playing on mount (self-controlled mode only). Default false. */
  autoPlay?: boolean
  /** Canvas size in px. Default 300. */
  size?: number
  className?: string
}

const NUM_PARTICLES = 2200
const NUM_REGIONS = 8
const BASE_RADIUS = 1.0
const PULSE_SCALE = 0.06
const BREATH_SCALE = 0.015
const PARTICLE_BASE_SIZE = 0.07 // world-space; shader: size * (canvasHalf / -mvZ)

function buildFibonacciSphere(n: number): { positions: Float32Array; normals: Float32Array } {
  const positions = new Float32Array(n * 3)
  const normals = new Float32Array(n * 3)
  const goldenAngle = Math.PI * (1 + Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / n)
    const theta = goldenAngle * i
    const r = BASE_RADIUS * (1 + (Math.random() - 0.5) * 0.14)
    const sinPhi = Math.sin(phi)
    const nx = sinPhi * Math.cos(theta)
    const ny = Math.cos(phi)
    const nz = sinPhi * Math.sin(theta)
    normals[i * 3] = nx; normals[i * 3 + 1] = ny; normals[i * 3 + 2] = nz
    positions[i * 3] = nx * r; positions[i * 3 + 1] = ny * r; positions[i * 3 + 2] = nz * r
  }
  return { positions, normals }
}

function assignRegions(normals: Float32Array, n: number): Uint8Array {
  const regions = new Uint8Array(n)
  for (let i = 0; i < n; i++) {
    const latBand = normals[i * 3 + 1] > 0 ? 0 : 1
    const angle = Math.atan2(normals[i * 3 + 2], normals[i * 3]) + Math.PI
    const lonWedge = Math.floor(angle / (Math.PI / 2)) % 4
    regions[i] = latBand * 4 + lonWedge
  }
  return regions
}

function buildColors(n: number): Float32Array {
  const colors = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const r = Math.random()
    if (r < 0.12) {
      // ice blue — "white" particles shifted so they're visible on white bg
      colors[i * 3] = 0.55 + Math.random() * 0.15
      colors[i * 3 + 1] = 0.7 + Math.random() * 0.15
      colors[i * 3 + 2] = 0.92 + Math.random() * 0.08
    } else if (r < 0.48) {
      // cyan
      colors[i * 3] = 0.05 + Math.random() * 0.15
      colors[i * 3 + 1] = 0.6 + Math.random() * 0.4
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2
    } else {
      // deep blue
      colors[i * 3] = 0.05 + Math.random() * 0.15
      colors[i * 3 + 1] = 0.1 + Math.random() * 0.25
      colors[i * 3 + 2] = 0.6 + Math.random() * 0.4
    }
  }
  return colors
}

function ringColorStr(progress: number): string {
  if (progress >= 1) return 'rgba(80,255,160,0.95)'
  if (progress > 0.5) {
    const t = (progress - 0.5) * 2
    return `rgba(50,${Math.round(150 + t * 105)},${Math.round(255 - t * 95)},0.9)`
  }
  return `rgba(50,${Math.round(150 * progress * 2)},255,0.9)`
}

export function TransferOrb({
  progress,
  duration = 10,
  autoPlay = false,
  size = 300,
  className,
}: TransferOrbProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)

  const isExternal = progress !== undefined
  const circumference = 2 * Math.PI * 153

  // Refs read by the animation loop — never cause re-renders
  const progressRef = useRef(progress ?? 0)
  const isExternalRef = useRef(isExternal)
  const playingRef = useRef(autoPlay && !isExternal)
  const elapsedRef = useRef(0)
  const durationRef = useRef(duration)
  const lastRafTimeRef = useRef<number | null>(null)

  // Keep non-size refs in sync with props without restarting the scene
  useEffect(() => { durationRef.current = duration }, [duration])
  useEffect(() => {
    isExternalRef.current = progress !== undefined
    if (progress !== undefined) {
      progressRef.current = progress
      updateRing(progress)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress])

  // Play button UI state — only changes on user interaction or completion
  const [playing, setPlaying] = useState(autoPlay && !isExternal)

  function updateRing(p: number) {
    if (!ringRef.current) return
    ringRef.current.style.strokeDashoffset = String(circumference * (1 - p))
    ringRef.current.setAttribute('stroke', ringColorStr(p))
  }

  function togglePlay() {
    if (isExternalRef.current) return
    if (progressRef.current >= 1) {
      elapsedRef.current = 0
      progressRef.current = 0
      updateRing(0)
    }
    const next = !playingRef.current
    playingRef.current = next
    setPlaying(next)
  }

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.z = 3.2

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(size, size)
    renderer.setClearColor(0xffffff, 1)
    mount.appendChild(renderer.domElement)

    const { positions: basePositions, normals } = buildFibonacciSphere(NUM_PARTICLES)
    const regions = assignRegions(normals, NUM_PARTICLES)
    const colors = buildColors(NUM_PARTICLES)
    const baseColors = colors.slice()

    const regionFreq = new Float32Array(NUM_REGIONS)
    const regionPhase = new Float32Array(NUM_REGIONS)
    for (let r = 0; r < NUM_REGIONS; r++) {
      regionFreq[r] = 0.4 + Math.random() * 1.4
      regionPhase[r] = Math.random() * Math.PI * 2
    }

    const positions = basePositions.slice()
    const sizes = new Float32Array(NUM_PARTICLES).fill(PARTICLE_BASE_SIZE)

    const geometry = new THREE.BufferGeometry()
    const posAttr = new THREE.BufferAttribute(positions, 3)
    const colAttr = new THREE.BufferAttribute(colors, 3)
    const sizeAttr = new THREE.BufferAttribute(sizes, 1)
    posAttr.setUsage(THREE.DynamicDrawUsage)
    sizeAttr.setUsage(THREE.DynamicDrawUsage)
    geometry.setAttribute('position', posAttr)
    geometry.setAttribute('color', colAttr)
    geometry.setAttribute('size', sizeAttr)

    const material = new THREE.ShaderMaterial({
      vertexColors: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      transparent: true,
      uniforms: { scale: { value: size / 2 } },
      vertexShader: `
        uniform float scale;
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (scale / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = 0.55 * (1.0 - smoothstep(0.2, 0.5, d));
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    let currentScale = 0.88
    let burstTriggered = false
    let burstActive = false
    const animId = { value: 0 }
    let sceneStartTime = 0 // set on first frame for stable wall-clock time

    function animate(rafTime: number) {
      animId.value = requestAnimationFrame(animate)

      if (sceneStartTime === 0) sceneStartTime = rafTime
      const time = (rafTime - sceneStartTime) / 1000

      // Advance internal timer
      if (playingRef.current && !isExternalRef.current) {
        const dt = lastRafTimeRef.current !== null
          ? (rafTime - lastRafTimeRef.current) / 1000
          : 0
        elapsedRef.current = Math.min(elapsedRef.current + dt, durationRef.current)
        progressRef.current = elapsedRef.current / durationRef.current
        updateRing(progressRef.current)
        if (progressRef.current >= 1) {
          playingRef.current = false
          setPlaying(false)
        }
      }
      lastRafTimeRef.current = rafTime

      const prog = progressRef.current
      let targetScale = 0.88 + prog * (1.06 - 0.88)

      if (prog >= 1 && !burstTriggered) {
        burstTriggered = true
        burstActive = true
        currentScale = 1.15
        for (let i = 0; i < NUM_PARTICLES; i++) {
          colors[i * 3 + 1] = Math.min(1, colors[i * 3 + 1] * 1.25)
          colors[i * 3 + 2] = Math.max(0, colors[i * 3 + 2] * 0.85)
        }
        colAttr.needsUpdate = true
      }
      if (prog < 1 && burstTriggered) {
        burstTriggered = false
        burstActive = false
        for (let i = 0; i < NUM_PARTICLES * 3; i++) colors[i] = baseColors[i]
        colAttr.needsUpdate = true
      }
      if (burstActive && currentScale <= 1.065) burstActive = false

      currentScale += (targetScale - currentScale) * 0.025
      points.scale.setScalar(currentScale)
      points.rotation.y = time * 0.2
      points.rotation.x = Math.sin(time * 0.11) * 0.22

      const breath = Math.sin(time * 0.35) * BREATH_SCALE
      for (let i = 0; i < NUM_PARTICLES; i++) {
        const r = regions[i]
        const osc = Math.sin(time * regionFreq[r] + regionPhase[r])
        const total = breath + osc * PULSE_SCALE
        positions[i * 3]     = basePositions[i * 3]     + normals[i * 3]     * total
        positions[i * 3 + 1] = basePositions[i * 3 + 1] + normals[i * 3 + 1] * total
        positions[i * 3 + 2] = basePositions[i * 3 + 2] + normals[i * 3 + 2] * total
        sizes[i] = PARTICLE_BASE_SIZE * (1 + osc * 0.1)
      }
      posAttr.needsUpdate = true
      sizeAttr.needsUpdate = true

      renderer.render(scene, camera)
    }

    requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animId.value)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size])

  const btnSize = Math.round(size * 0.17)

  return (
    <div
      className={className}
      style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      <div
        ref={mountRef}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 0 40px 12px rgba(40,120,255,0.12), 0 0 80px 30px rgba(20,60,200,0.06)',
        }}
      />

      {/* Progress ring */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 340 340"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        <circle cx="170" cy="170" r="153" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" />
        <circle
          ref={ringRef}
          cx="170" cy="170" r="153"
          fill="none"
          stroke={ringColorStr(0)}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform="rotate(-90 170 170)"
          style={{ transition: 'stroke 0.4s ease' }}
        />
      </svg>

      {/* Play / pause button — only in self-controlled mode */}
      {!isExternal && (
        <button
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: btnSize,
            height: btnSize,
            borderRadius: '50%',
            border: '1.5px solid rgba(50,130,255,0.5)',
            background: 'rgba(50,130,255,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            transition: 'background 0.15s ease, opacity 0.15s ease',
          }}
        >
          {playing ? (
            // Pause icon
            <svg width={btnSize * 0.38} height={btnSize * 0.38} viewBox="0 0 16 16" fill="rgba(30,100,230,0.85)">
              <rect x="2" y="1" width="4.5" height="14" rx="1.5" />
              <rect x="9.5" y="1" width="4.5" height="14" rx="1.5" />
            </svg>
          ) : (
            // Play icon
            <svg width={btnSize * 0.38} height={btnSize * 0.38} viewBox="0 0 16 16" fill="rgba(30,100,230,0.85)">
              <path d="M3 1.5 L14 8 L3 14.5 Z" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}
