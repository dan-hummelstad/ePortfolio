import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Edges, OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { type Drawer, type File, drawers, filesOf } from '@/lib/files'

export const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

// cabinet dimensions in world units
const W = 1.5, D = 2, T = 0.05, DH = 0.7, PLINTH = 0.1
const H = PLINTH + drawers.length * DH + T
const OPEN_Z = D * 0.72
const FW = W - 0.26, FH = DH * 0.74             // folder face
const FOLDER_Y = -DH / 2 + 0.07 + FH / 2

const LIGHT = { metal: '#F3F3F0', plinth: '#CFCFC9', slot: '#BDBDB6', edge: '#111111', ink: '#111111', bg: '#FCFCFA', kraft: '#DCD0B8', paper: '#FFFFFF', sticky: '#FDE047' }
const DARK = { metal: '#44443C', plinth: '#232320', slot: '#1A1A17', edge: '#CFCCC0', ink: '#F2EFE6', bg: '#121210', kraft: '#6B6150', paper: '#1E1E1B', sticky: '#FDE047' }
type Palette = typeof LIGHT
const Pal = createContext<Palette>(LIGHT)

// the one moving value the file-open sequence reads: 0 = in its drawer, 1 = face-on and open
// ponytail: module singleton, there is only ever one cabinet on the page
const anim = { p: -1, slug: null as string | null }

const clamp01 = (t: number) => Math.min(1, Math.max(0, t))
const easeOut = (t: number) => 1 - (1 - t) ** 3
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
const damp = (a: number, b: number, l: number, dt: number) => (REDUCED ? b : THREE.MathUtils.damp(a, b, l, dt))
// under-damped spring, gives the drawer its ~4% overshoot
function spring(s: { x: number, v: number }, target: number, dt: number) {
  if (REDUCED) return (s.x = target)
  s.v += ((target - s.x) * 170 - s.v * 18) * dt
  return (s.x += s.v * dt)
}

// dim by blending toward the background rather than going see-through, so drawers never show their insides.
// labels (textured) sit flat on opaque faces, so plain opacity is fine for them
function fade(obj: THREE.Object3D, o: number, bg: THREE.Color) {
  obj.traverse((c) => {
    const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined
    if (!m || Array.isArray(m) || !m.color) return
    if (m.map) { m.opacity = o; return }
    // a theme change re-applies every colour prop, so recapture the base when the background changes
    if (m.userData.bg !== bg) { m.userData.base = m.color.clone(); m.userData.bg = bg }
    m.color.copy(m.userData.base).lerp(bg, 1 - o)
  })
}

// one soft radial ellipse on the floor plane. no shadow maps
function FloorShadow({ dark }: { dark: boolean }) {
  const texture = useMemo(() => {
    const ctx = document.createElement('canvas').getContext('2d')!
    ctx.canvas.width = ctx.canvas.height = 128
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(0,0,0,1)')
    g.addColorStop(0.5, 'rgba(0,0,0,0.45)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(ctx.canvas)
  }, [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0.1]} raycast={() => null}>
      <planeGeometry args={[W * 1.9, D * 1.6]} />
      <meshBasicMaterial map={texture} color="#000000" transparent opacity={dark ? 0.6 : 0.22} depthWrite={false} />
    </mesh>
  )
}

const pointer = (on: boolean) => { document.body.style.cursor = on ? 'pointer' : '' }

function Box({ size, position, color, ...props }: { size: [number, number, number], position: [number, number, number], color?: string } & React.ComponentProps<'mesh'>) {
  const pal = useContext(Pal)
  return (
    <mesh position={position} castShadow receiveShadow {...props}>
      <boxGeometry args={size} />
      <meshLambertMaterial color={color ?? pal.metal} />
      <Edges color={pal.edge} />
    </mesh>
  )
}

// text drawn to a canvas texture on a plane, so the scene occludes it like any other mesh
function Label({ position, rotation, text, bg, fg, height = 0.1, width, italic, bold }: {
  position: [number, number, number], rotation?: [number, number, number], text: string,
  bg?: string, fg: string, height?: number, width?: number, italic?: boolean, bold?: boolean,
}) {
  const pal = useContext(Pal)
  const { texture, w } = useMemo(() => {
    const px = 96
    const ctx = document.createElement('canvas').getContext('2d')!
    const font = (size: number) => `${italic ? 'italic ' : ''}${bold ? '600 ' : ''}${size}px "IBM Plex Mono", ui-monospace, monospace`
    ctx.font = font(px * 0.55)
    const measured = ctx.measureText(text).width
    const w = width ?? (measured / px + 0.4) * height
    ctx.canvas.width = Math.ceil((w / height) * px)
    ctx.canvas.height = px
    // shrink to fit a fixed-width card
    const size = px * 0.55 * Math.min(1, (ctx.canvas.width - px * 0.4) / (measured || 1))
    if (bg) {
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, ctx.canvas.width, px)
      ctx.lineWidth = 3
      ctx.strokeStyle = fg
      ctx.strokeRect(1.5, 1.5, ctx.canvas.width - 3, px - 3)
    }
    ctx.fillStyle = fg
    ctx.font = font(size)
    ctx.textBaseline = 'middle'
    ctx.fillText(text, px * 0.2, px / 2)
    const texture = new THREE.CanvasTexture(ctx.canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    return { texture, w }
  }, [text, bg, fg, height, width, italic, bold])

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[w, height]} />
      {pal === DARK
        ? <meshBasicMaterial map={texture} transparent toneMapped={false} />
        : <meshLambertMaterial map={texture} transparent />}
    </mesh>
  )
}

// what the open folder holds: a printed page, drawn once
function PageFace({ title }: { title: string }) {
  const pal = useContext(Pal)
  const texture = useMemo(() => {
    const ctx = document.createElement('canvas').getContext('2d')!
    ctx.canvas.width = 640
    ctx.canvas.height = Math.round(640 * (FH - 0.06) / (FW - 0.08))
    ctx.fillStyle = pal.paper
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = pal.ink
    ctx.font = '600 26px "Courier Prime", monospace'
    ctx.fillText(title.slice(0, 34), 36, 52)
    ctx.globalAlpha = 0.35
    for (let y = 92, i = 0; y < ctx.canvas.height - 24; y += 26, i++) ctx.fillRect(36, y, [520, 440, 560, 380, 500][i % 5], 7)
    const t = new THREE.CanvasTexture(ctx.canvas)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [title, pal])
  return (
    <mesh position={[0, -0.01, 0]}>
      <planeGeometry args={[FW - 0.08, FH - 0.06]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}

const IDENT = new THREE.Quaternion()
const DIR = new THREE.Vector3(1, 1, 1).normalize()           // from the scene toward the camera
const view = { target: new THREE.Vector3() }                  // what the camera is looking at right now
const tmp = new THREE.Vector3()
const home = new THREE.Vector3()

function Folder({ file, color, z, slot, active, onOpen, onHover }: {
  file: File, color: string, z: number, slot: number, active: boolean,
  onOpen: () => void, onHover: (title: string | null) => void,
}) {
  const pal = useContext(Pal)
  const camera = useThree((s) => s.camera)
  const ref = useRef<THREE.Group>(null!)
  const hinge = useRef<THREE.Group>(null!)
  const lift = useRef(0)
  const [hovered, setHovered] = useState(false)
  const tabX = -FW / 2 + 0.2 + slot * (FW - 0.4) / 2
  const tabColor = useMemo(() => (hovered ? '#' + new THREE.Color(color).multiplyScalar(0.86).getHexString() : color), [hovered, color])

  useFrame((_, dt) => {
    const p = anim.slug === file.slug ? Math.max(0, anim.p) : 0
    lift.current = damp(lift.current, hovered && active && p === 0 ? 0.1 : 0, 16, dt)
    const e1 = easeOut(clamp01(p / 0.3)), e2 = easeInOut(clamp01((p - 0.22) / 0.5)), e3 = easeInOut(clamp01((p - 0.6) / 0.4))
    const g = ref.current
    home.set(0, FOLDER_Y + lift.current + e1 * 0.75, z)
    if (e2 > 0) {
      // fly to the middle of the screen, in front of everything else
      tmp.copy(DIR).multiplyScalar(5).add(view.target)
      g.parent!.worldToLocal(tmp)
      g.position.lerpVectors(home, tmp, e2)
    } else g.position.copy(home)
    g.quaternion.slerpQuaternions(IDENT, camera.quaternion, e2)
    g.scale.setScalar(1 + 0.4 * e2) // the camera is already zoomed in on the drawer
    hinge.current.rotation.y = -1.83 * e3 // cover swings 0 → -105°
  })

  return (
    <group ref={ref} position={[0, FOLDER_Y, z]}>
      <group
        onClick={(e) => { if (!active) return; e.stopPropagation(); onOpen() }}
        onPointerOver={(e) => { if (!active) return; e.stopPropagation(); setHovered(true); onHover(file.title); pointer(true) }}
        onPointerOut={() => { if (!hovered) return; setHovered(false); onHover(null); pointer(false) }}
      >
        <Box size={[FW, FH, 0.012]} position={[0, 0, -0.008]} color={color} />
        <Box size={[0.36, 0.08, 0.012]} position={[tabX, FH / 2 + 0.04, -0.008]} color={tabColor} />
        <Label position={[tabX, FH / 2 + 0.04, -0.0015]} text={file.short} fg={pal.ink} height={0.07} width={0.34} />
        <PageFace title={file.title} />
        <group ref={hinge} position={[-FW / 2, 0, 0.008]}>
          <Box size={[FW, FH * 0.94, 0.012]} position={[FW / 2, -FH * 0.03, 0]} color={color} />
        </group>
      </group>
    </group>
  )
}

function Divider({ label, z }: { label: string, z: number }) {
  const pal = useContext(Pal)
  const h = FH + 0.03, tabX = -FW / 2 + 0.2
  return (
    <group position={[0, FOLDER_Y + 0.015, z]}>
      <Box size={[FW, h, 0.012]} position={[0, 0, 0]} color={pal.kraft} />
      <Box size={[0.36, 0.08, 0.012]} position={[tabX, h / 2 + 0.04, 0]} color={pal.kraft} />
      <Label position={[tabX, h / 2 + 0.04, 0.0065]} text={label} fg={pal.ink} height={0.07} width={0.34} />
    </group>
  )
}

// what stands in a drawer, front to back. drawers over four files get kraft dividers between their groups
function drawerItems(drawer: Drawer) {
  const withDividers = filesOf(drawer).length > 4
  let n = 0
  return drawer.groups.flatMap((g) => [
    ...(withDividers ? [{ key: 'd-' + g.label, label: g.label }] : []),
    ...g.files.map((file) => ({ key: file.slug, file, slot: n++ % 3 })),
  ])
}

function CabinetDrawer({ drawer, index, open, dim, compact, onToggle, onOpenFile, onHover }: {
  drawer: Drawer, index: number, open: boolean, dim: boolean, compact: boolean,
  onToggle: () => void, onOpenFile: (f: File) => void, onHover: (title: string | null) => void,
}) {
  const pal = useContext(Pal)
  const ref = useRef<THREE.Group>(null!)
  const slide = useRef({ x: open ? OPEN_Z : 0, v: 0 })
  const opacity = useRef(1)
  const faded = useRef<THREE.Color | null>(null)
  const [hovered, setHovered] = useState(false)
  const y = H - T - DH * (index + 0.5)
  const sideH = DH * 0.55, sideY = -DH / 2 + 0.05 + sideH / 2
  const card = pal === DARK ? drawer.dark : drawer.color
  const bg = useMemo(() => new THREE.Color(pal.bg), [pal])
  const files = filesOf(drawer)

  const items = useMemo(() => drawerItems(drawer), [drawer])
  const step = Math.min(0.2, 1.55 / items.length)

  useFrame((_, dt) => {
    ref.current.position.z = spring(slide.current, open ? OPEN_Z : hovered ? 0.1 : 0, Math.min(dt, 1 / 30))
    const o = damp(opacity.current, dim ? 0.6 : 1, 10, dt)
    if (o !== opacity.current || bg !== faded.current) fade(ref.current, (opacity.current = o), (faded.current = bg))
  })

  return (
    <group ref={ref} position={[0, y, 0]}>
      <group
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); pointer(true) }}
        onPointerOut={() => { setHovered(false); pointer(false) }}
      >
        <Box size={[W - 2 * T - 0.02, DH - 0.04, 0.06]} position={[0, 0, D / 2 - 0.03]} />
        <Box size={[0.36, 0.05, 0.02]} position={[0.16, 0.02, D / 2 + 0.01]} color={pal.slot} />
        <Label position={[-0.39, 0.06, D / 2 + 0.001]} text={compact ? '' : drawer.label} bg={card} fg={pal.ink} height={0.2} width={0.5} bold />
        {!compact && <Label position={[0.44, -0.13, D / 2 + 0.001]} text={`${files.length} files`} fg={pal.ink} height={0.13} italic />}
      </group>
      {/* drawer box: bottom, sides, back */}
      <Box size={[W - 0.16, 0.03, D - 0.1]} position={[0, -DH / 2 + 0.05, -0.02]} />
      <Box size={[0.03, sideH, D - 0.1]} position={[-(W / 2 - 0.09), sideY, -0.02]} />
      <Box size={[0.03, sideH, D - 0.1]} position={[W / 2 - 0.09, sideY, -0.02]} />
      <Box size={[W - 0.16, sideH, 0.03]} position={[0, sideY, -D / 2 + 0.07]} />
      {items.map((it, i) => {
        const z = D / 2 - 0.25 - i * step
        return 'file' in it
          ? <Folder key={it.key} file={it.file} slot={it.slot} z={z} color={card} active={open} onOpen={() => onOpenFile(it.file)} onHover={onHover} />
          : <Divider key={it.key} label={it.label} z={z} />
      })}
    </group>
  )
}

// a sheet of background colour between the cabinet and the flying folder: the cabinet "drops to 25%"
function Veil() {
  const pal = useContext(Pal)
  const camera = useThree((s) => s.camera)
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    const e = clamp01((anim.p - 0.15) / 0.4)
    const m = ref.current.material as THREE.MeshBasicMaterial
    m.opacity = e * 0.75
    ref.current.visible = e > 0
    ref.current.position.copy(DIR).multiplyScalar(3.4).add(view.target)
    ref.current.quaternion.copy(camera.quaternion)
  })
  return (
    <mesh ref={ref} raycast={() => null}>
      <planeGeometry args={[60, 60]} />
      <meshBasicMaterial color={pal.bg} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const ctx = document.createElement('canvas').getContext('2d')!
  ctx.canvas.width = w
  ctx.canvas.height = h
  draw(ctx)
  const t = new THREE.CanvasTexture(ctx.canvas)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

// curtains: two pleated panels on a rod. drag a curtain's edge along the wall to pull it,
// or tap one to draw both closed (or open). each panel is a unit-wide zig-zag strip scaled to its width,
// so pulling it open bunches the folds tighter
const ROD = 1, CURTAIN_H = 2.5, CURTAIN_MIN = 0.24, FOLDS = 8
// how much daylight the curtains let in, 0 closed to 1 open. read by RoomLight
const daylight = { open: 1 }
const wallRay = new THREE.Raycaster(), wall = new THREE.Plane(), onWall = new THREE.Vector3(), wallNormal = new THREE.Vector3(), turned = new THREE.Quaternion()

function pleats(side: 1 | -1) {
  const pos: number[] = [], idx: number[] = []
  for (let i = 0; i <= FOLDS * 2; i++) {
    const x = side * i / (FOLDS * 2), z = (i % 2) * 0.05
    pos.push(x, 0, z, x, -CURTAIN_H, z)
  }
  for (let i = 0; i < FOLDS * 2; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

function Curtains() {
  const pal = useContext(Pal)
  const group = useRef<THREE.Group>(null!)
  const panels = { l: useRef<THREE.Mesh>(null!), r: useRef<THREE.Mesh>(null!) }
  const geometry = useMemo(() => ({ l: pleats(1), r: pleats(-1) }), [])
  const st = useRef({ l: CURTAIN_MIN, r: CURTAIN_MIN, tl: CURTAIN_MIN, tr: CURTAIN_MIN, drag: null as 'l' | 'r' | null, lastX: 0, moved: 0 })

  useEffect(() => {
    const release = () => {
      const s = st.current
      if (!s.drag) return
      if (s.moved < 0.03) { const close = s.tl < 0.6 && s.tr < 0.6; s.tl = s.tr = close ? ROD : CURTAIN_MIN }
      s.drag = null
      document.body.style.cursor = ''
    }
    addEventListener('pointerup', release)
    addEventListener('pointercancel', release)
    return () => { removeEventListener('pointerup', release); removeEventListener('pointercancel', release) }
  }, [])

  useFrame(({ pointer, camera }, dt) => {
    const s = st.current
    if (s.drag) {
      // where the pointer meets the wall plane the curtains hang on, in the rod's own coordinates
      wallRay.setFromCamera(pointer, camera)
      wallNormal.set(0, 0, 1).applyQuaternion(group.current.getWorldQuaternion(turned))
      wall.setFromNormalAndCoplanarPoint(wallNormal, group.current.localToWorld(onWall.set(0, 0, 0)))
      if (wallRay.ray.intersectPlane(wall, onWall)) {
        const x = group.current.worldToLocal(onWall).x
        // the first sample only sets the baseline, so a tap reads as no movement
        if (!Number.isNaN(s.lastX)) s.moved += Math.abs(x - s.lastX)
        s.lastX = x
        // until it actually moves it is a tap, and a tap must not nudge the curtain
        if (s.moved < 0.03) { /* still a tap */ } else if (s.drag === 'l') s.tl = THREE.MathUtils.clamp(x + ROD, CURTAIN_MIN, ROD)
        else s.tr = THREE.MathUtils.clamp(ROD - x, CURTAIN_MIN, ROD)
      }
    }
    s.l = damp(s.l, s.tl, s.drag === 'l' ? 18 : 5, dt)
    s.r = damp(s.r, s.tr, s.drag === 'r' ? 18 : 5, dt)
    panels.l.current.scale.set(s.l, 1, 1 + (1 - s.l) * 1.2)
    panels.r.current.scale.set(s.r, 1, 1 + (1 - s.r) * 1.2)
    daylight.open = 1 - ((s.l + s.r) / 2 - CURTAIN_MIN) / (ROD - CURTAIN_MIN)
  })

  const grab = (side: 'l' | 'r') => ({
    onPointerDown: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      const s = st.current
      s.drag = side
      s.moved = 0
      s.lastX = NaN
      document.body.style.cursor = 'grabbing'
    },
    onPointerOver: (e: { stopPropagation: () => void }) => { e.stopPropagation(); if (!st.current.drag) document.body.style.cursor = 'grab' },
    onPointerOut: () => { if (!st.current.drag) document.body.style.cursor = '' },
    onClick: (e: { stopPropagation: () => void }) => e.stopPropagation(),
  })

  return (
    <group ref={group} position={[0, WIN_H / 2 + 0.14, 0.22]}>
      <Box size={[ROD * 2 + 0.24, 0.035, 0.035]} position={[0, 0.02, 0.03]} color={pal.slot} />
      {(['l', 'r'] as const).map((side) => (
        <mesh key={side} ref={panels[side]} geometry={geometry[side]} position={[side === 'l' ? -ROD : ROD, 0, 0]} castShadow {...grab(side)}>
          <meshLambertMaterial color="#ECE4D4" side={THREE.DoubleSide} flatShading transparent opacity={0.95} />
          <Edges color={pal.edge} threshold={20} />
        </mesh>
      ))}
    </group>
  )
}

// sunlight through the window. the window sits in an invisible wall that only casts shadows,
// so light gets in through the opening alone: the frame and glazing bars print on the floor,
// the cabinet throws a shadow across the patch, and closing the curtains shuts it off
function Sunlight() {
  const target = useMemo(() => new THREE.Object3D(), [])
  const wallAround: [number, number, number, number][] = [
    [0, WIN_H / 2 + 15, 60, 30], [0, -WIN_H / 2 - 15, 60, 30], [-WIN_W / 2 - 15, 0, 30, WIN_H + 0.2], [WIN_W / 2 + 15, 0, 30, WIN_H + 0.2], // overlap, a butt joint leaks light
  ]
  return (
    <>
      {wallAround.map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, -0.08]} castShadow raycast={() => null}>
          <boxGeometry args={[w, h, 0.04]} />
          <meshBasicMaterial colorWrite={false} depthWrite={false} />
        </mesh>
      ))}
      <primitive object={target} position={[-1.45, -4.5, 1.6]} />
      <spotLight
        position={[1.8, 5.6, -2]} target={target} color="#FFE9C4"
        intensity={0.4 * Math.PI} decay={0} angle={0.42} penumbra={0.2}
        castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.02}
      />
    </>
  )
}

// light mode: a window on the back wall, blue sky and sun in the distance
const WIN_W = 1.5, WIN_H = 1.6, WIN_F = 0.07
const WINDOW_X = -2                     // the left wall the window sits in, facing the cabinet
function Window() {
  const sky = useMemo(() => canvasTexture(340, 368, (ctx) => {
    const { width: w, height: h } = ctx.canvas
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#3B8EE0')
    g.addColorStop(0.75, '#9FD3F7')
    g.addColorStop(1, '#D9EFFC')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    const sun = ctx.createRadialGradient(250, 90, 0, 250, 90, 120)
    sun.addColorStop(0, 'rgba(255,248,214,1)')
    sun.addColorStop(0.18, 'rgba(255,240,180,0.95)')
    sun.addColorStop(0.2, 'rgba(255,240,180,0.45)')
    sun.addColorStop(1, 'rgba(255,240,180,0)')
    ctx.fillStyle = sun
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    for (const [x, y, r] of [[70, 150, 22], [100, 140, 30], [135, 152, 20], [190, 230, 14], [214, 222, 20], [240, 232, 13]]) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }
    // distant hills, paler with distance
    for (const [base, amp, color] of [[300, 18, '#9FC3A8'], [326, 14, '#7FAF8A']] as const) {
      ctx.fillStyle = color
      ctx.beginPath(); ctx.moveTo(0, h)
      for (let x = 0; x <= w; x += 10) ctx.lineTo(x, base - Math.sin(x / 55 + base) * amp - Math.sin(x / 23) * amp * 0.3)
      ctx.lineTo(w, h); ctx.fill()
    }
  }), [])
  const iw = WIN_W - WIN_F * 2, ih = WIN_H - WIN_F * 2, d = 0.1
  return (
    <group position={[WINDOW_X, 3.5, 0.9]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[iw, ih]} />
        <meshBasicMaterial map={sky} toneMapped={false} />
      </mesh>
      <Box size={[WIN_W, WIN_F, d]} position={[0, WIN_H / 2 - WIN_F / 2, 0]} />
      <Box size={[WIN_W, WIN_F, d]} position={[0, -WIN_H / 2 + WIN_F / 2, 0]} />
      <Box size={[WIN_F, ih, d]} position={[-WIN_W / 2 + WIN_F / 2, 0, 0]} />
      <Box size={[WIN_F, ih, d]} position={[WIN_W / 2 - WIN_F / 2, 0, 0]} />
      <Box size={[0.04, ih, 0.05]} position={[0, 0, 0]} />
      <Box size={[iw, 0.04, 0.05]} position={[0, 0.15, 0]} />
      <Box size={[WIN_W + 0.2, 0.06, 0.24]} position={[0, -WIN_H / 2 - 0.03, 0.08]} />
      <Curtains />
      <Sunlight />
    </group>
  )
}

// dark mode: a pendant lamp hung from the ceiling, the only warm light in the room.
// it is a pendulum: grab the shade and drag it any way, let go and it swings until it settles.
// it arrives with a small sway. the spotlight and its shadows hang off the same pivot, so the light pool swings too.
const LAMP_Y = H + 1.5
const CORD = 3.2                        // pivot sits this far above the shade, off the top of the screen
const GRAVITY = 9.8, SWING_DAMPING = 0.35
const pivotAt = new THREE.Vector3(), reach = new THREE.Vector3(), other = new THREE.Vector3(), hanging = new THREE.Vector3()
const grabRay = new THREE.Raycaster()

function Lamp() {
  const pal = useContext(Pal)
  const pivot = useRef<THREE.Group>(null!)
  const swing = useRef(REDUCED ? { x: 0, z: 0, vx: 0, vz: 0 } : { x: -0.05, z: 0.12, vx: 0, vz: 0 })
  const dragging = useRef(false)
  const grabRadius = useRef(CORD)
  const target = useMemo(() => new THREE.Object3D(), [])
  const glow = useMemo(() => canvasTexture(128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(255,214,150,0.55)')
    g.addColorStop(0.35, 'rgba(255,190,110,0.18)')
    g.addColorStop(1, 'rgba(255,180,100,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
  }), [])

  useEffect(() => {
    const release = () => { if (dragging.current) { dragging.current = false; document.body.style.cursor = '' } }
    addEventListener('pointerup', release)
    addEventListener('pointercancel', release)
    return () => { removeEventListener('pointerup', release); removeEventListener('pointercancel', release) }
  }, [])

  useFrame(({ pointer, camera }, delta) => {
    const s = swing.current, dt = Math.min(delta, 1 / 30)
    // while held, the grabbed point goes where the pointer's line of sight meets the sphere it can
    // reach on its cord. the line crosses that sphere twice; take the crossing nearer to where the
    // lamp hangs now, so the drag never jumps. out of reach, it stretches as far as it can toward the pointer
    const target = { x: 0, z: 0 }
    if (dragging.current) {
      pivot.current.getWorldPosition(pivotAt)
      grabRay.setFromCamera(pointer, camera)
      const { origin, direction } = grabRay.ray
      const b = other.subVectors(origin, pivotAt).dot(direction)
      const disc = b * b - (other.lengthSq() - grabRadius.current ** 2)
      hanging.set(Math.sin(s.z), -Math.cos(s.z) * Math.cos(s.x), -Math.cos(s.z) * Math.sin(s.x))
      if (disc < 0) grabRay.ray.closestPointToPoint(pivotAt, reach).sub(pivotAt)
      else {
        grabRay.ray.at(-b - Math.sqrt(disc), reach).sub(pivotAt)
        grabRay.ray.at(-b + Math.sqrt(disc), other).sub(pivotAt)
        if (other.dot(hanging) > reach.dot(hanging)) reach.copy(other)
      }
      reach.normalize()
      // the pivot's parent is unrotated, so this inverts rotation.set(x, 0, z) for a cord hanging down -y
      target.z = THREE.MathUtils.clamp(Math.asin(reach.x), -1, 1)
      target.x = THREE.MathUtils.clamp(Math.atan2(-reach.z, -reach.y), -1, 1)
    }
    for (const [a, v] of [['z', 'vz'], ['x', 'vx']] as const) {
      const force = dragging.current
        ? (target[a] - s[a]) * 60 - s[v] * 12
        : -(GRAVITY / CORD) * Math.sin(s[a]) - SWING_DAMPING * s[v]
      s[v] += force * dt
      s[a] = THREE.MathUtils.clamp(s[a] + s[v] * dt, -1, 1)
    }
    pivot.current.rotation.set(s.x, 0, s.z)
  })

  return (
    <group position={[-0.2, LAMP_Y + CORD, 0.3]}>
      {/* the cord above the pivot never moves */}
      <mesh position={[0, 4, 0]} raycast={() => null}>
        <cylinderGeometry args={[0.008, 0.008, 8, 6]} />
        <meshBasicMaterial color={pal.edge} />
      </mesh>
      <group ref={pivot}>
        <mesh position={[0, -CORD / 2 + 0.1, 0]} raycast={() => null}>
          <cylinderGeometry args={[0.008, 0.008, CORD - 0.2, 6]} />
          <meshBasicMaterial color={pal.edge} />
        </mesh>
        <group position={[0, -CORD, 0]}>
          {/* invisible grab handle around the shade */}
          <mesh
            onPointerDown={(e) => {
              if (REDUCED) return
              e.stopPropagation()
              grabRadius.current = e.point.distanceTo(pivot.current.getWorldPosition(pivotAt))
              dragging.current = true
              document.body.style.cursor = 'grabbing'
            }}
            onPointerOver={(e) => { e.stopPropagation(); if (!dragging.current && !REDUCED) document.body.style.cursor = 'grab' }}
            onPointerOut={() => { if (!dragging.current) document.body.style.cursor = '' }}
            onClick={(e) => e.stopPropagation()}
          >
            <sphereGeometry args={[0.42, 12, 8]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0.16, 0]} raycast={() => null}>
            <cylinderGeometry args={[0.035, 0.035, 0.08, 16]} />
            <meshLambertMaterial color={pal.metal} />
            <Edges color={pal.edge} />
          </mesh>
          <mesh raycast={() => null}>
            <coneGeometry args={[0.34, 0.3, 40, 1, true]} />
            <meshLambertMaterial color="#2A2A25" side={THREE.DoubleSide} />
            <Edges color={pal.edge} />
          </mesh>
          <mesh position={[0, -0.1, 0]} raycast={() => null}>
            <sphereGeometry args={[0.075, 16, 12]} />
            <meshBasicMaterial color="#FFE7B8" toneMapped={false} />
          </mesh>
          {/* a faint beam of light under the shade */}
          <mesh position={[0, -0.15 - (LAMP_Y - H - 0.2) / 2, 0]} raycast={() => null}>
            <coneGeometry args={[0.85, LAMP_Y - H - 0.2, 40, 1, true]} />
            <meshBasicMaterial color="#FFC983" transparent opacity={0.045} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
          <sprite position={[0, -0.1, 0]} scale={[2.6, 2.6, 1]} raycast={() => null}>
            <spriteMaterial map={glow} depthWrite={false} toneMapped={false} />
          </sprite>
          <primitive object={target} position={[0, -4, 0]} />
          <spotLight
            position={[0, -0.12, 0]} target={target} color="#FFC27A"
            intensity={9 * Math.PI} decay={1.3} angle={0.7} penumbra={1}
            castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} shadow-normalBias={0.02}
          />
          {/* a little fill so the shade and its surroundings are not pitch black outside the cone */}
          <pointLight position={[0, -0.12, 0]} color="#FFC27A" intensity={0.6 * Math.PI} decay={1.6} />
        </group>
      </group>
    </group>
  )
}

// a floor that catches the lamp's pool (dark) or the window's sunlight (light), and the cabinet's shadow.
// its albedo is the background divided by the ambient + key light it gets, so unlit it matches the page.
// in light mode it sits a step below the page and fades out at the edges, so the sun has somewhere to brighten to
function Floor({ fade = false }: { fade?: boolean }) {
  const pal = useContext(Pal)
  const lit = pal === DARK ? 0.2 + 0.45 * 0.912 : 0.79 + 0.24 * 0.867
  const color = useMemo(() => new THREE.Color(pal.bg).multiplyScalar((fade ? 0.86 : 1) / lit), [pal, fade, lit])
  const alpha = useMemo(() => fade ? canvasTexture(128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, '#FFFFFF')
    g.addColorStop(0.45, '#FFFFFF')
    g.addColorStop(1, '#000000')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    // nothing past the window wall: the floor spans x -6..6, the wall stands at x = WINDOW_X
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, ((WINDOW_X + 0.15 + 6) / 12) * 128, 128) // a hair short of the wall, where shadow bias leaks light
  }) : null, [fade])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={fade ? [0, -0.001, 0.8] : [0, -0.001, 0]} receiveShadow raycast={() => null}>
      <planeGeometry args={fade ? [12, 12] : [60, 60]} />
      <meshLambertMaterial color={color} alphaMap={alpha} transparent={fade} depthWrite={!fade} />
    </mesh>
  )
}

// critically damped spring: eases in and out, never overshoots, and redirects smoothly mid-move
function follow(s: { x: number, v: number }, target: number, dt: number, k = 30) {
  if (REDUCED) { s.v = 0; return (s.x = target) }
  s.v += ((target - s.x) * k - s.v * 2 * Math.sqrt(k)) * dt
  return (s.x += s.v * dt)
}

// the angle never changes; opening a drawer glides the camera's target onto it and zooms in
function IsoCamera({ open, compact }: { open: number | null, compact: boolean }) {
  const { width, height } = useThree((s) => s.size)
  // ponytail: zoom fitted to the cabinet's rough projected size, tweak if the model changes
  const base = Math.min(width / 4.4, height / 5.6) * 0.9
  const st = useRef({ y: { x: 0, v: 0 }, z: { x: 0, v: 0 }, zoom: { x: 1, v: 0 } })
  useFrame(({ camera }, delta) => {
    const s = st.current, dt = Math.min(delta, 1 / 30)
    // middle of the pulled-out drawer, nudged up so the tabs sit in the centre of the frame
    const y = open === null ? 0 : H / 2 - T - DH * (open + 0.5) + 0.15
    const z = open === null ? 0 : OPEN_Z + 0.05
    view.target.set(0, follow(s.y, y, dt), follow(s.z, z, dt))
    camera.position.copy(DIR).multiplyScalar(17.3).add(view.target)
    camera.lookAt(view.target)
    camera.zoom = base * follow(s.zoom, open === null ? 1 : compact ? 1.5 : 2.1, dt)
    camera.updateProjectionMatrix()
  })
  return <OrthographicCamera makeDefault position={[10, 10, 10]} zoom={base} near={0.1} far={100} />
}

// the room's base light: lit from above-front only, so the top face is full, the front a step down and the side
// ambient-only. by day it scales with the curtains, and the page background behind the room scales with it,
// so the floor (tuned to match the background) still meets it seamlessly
const ROOM_OPEN = 0.9, ROOM_CLOSED = 0.55
function RoomLight({ dark }: { dark: boolean }) {
  const ambient = useRef<THREE.AmbientLight>(null!)
  const key = useRef<THREE.DirectionalLight>(null!)
  const shown = useRef(-1)
  const stage = useMemo(() => new THREE.Color(), [])
  useEffect(() => () => { document.documentElement.style.removeProperty('--stage') }, [])
  useFrame(() => {
    const f = dark ? 1 : THREE.MathUtils.lerp(ROOM_CLOSED, ROOM_OPEN, daylight.open)
    ambient.current.intensity = (dark ? 0.2 : 0.79 * f) * Math.PI
    key.current.intensity = (dark ? 0.45 : 0.24 * f) * Math.PI
    if (Math.abs(f - shown.current) < 0.003) return
    shown.current = f
    if (dark) document.documentElement.style.removeProperty('--stage')
    else document.documentElement.style.setProperty('--stage', '#' + stage.set(LIGHT.bg).multiplyScalar(f).getHexString())
  })
  return (
    <>
      <ambientLight ref={ambient} />
      <directionalLight ref={key} position={dark ? [0, 9.1, 4.1] : [0, 8.7, 5]} color={dark ? '#FFF1DC' : '#FFFFFF'} />
    </>
  )
}

function Progress({ file }: { file: string | null }) {
  useFrame((_, dt) => {
    const a = anim
    if (a.p < 0) a.p = file ? 1 : 0
    if (file) a.slug = file
    const target = file ? 1 : 0
    // reverse runs at 0.8x the duration
    const rate = REDUCED ? 1e3 : file ? 1 / 0.95 : 1 / 0.76
    a.p = target > a.p ? Math.min(1, a.p + rate * dt) : Math.max(0, a.p - rate * dt)
    if (a.p === 0) a.slug = null
  })
  return null
}

export default function FileCabinet({ open, file, dark, compact, paused, onDrawer, onOpenFile, onHover }: {
  open: number | null, file: string | null, dark: boolean, compact: boolean, paused: boolean,
  onDrawer: (i: number | null) => void, onOpenFile: (d: Drawer, f: File) => void, onHover: (title: string | null) => void,
}) {
  const pal = dark ? DARK : LIGHT

  return (
    <Canvas flat shadows aria-hidden dpr={[1, 2]} frameloop={paused ? 'never' : 'always'} gl={{ alpha: true, antialias: true }} onPointerMissed={() => !file && onDrawer(null)}>
      <Pal.Provider value={pal}>
          <IsoCamera open={open} compact={compact} />
          <Progress file={file} />
          {/* lit from above-front only: top face full, front a step down, side ambient-only. three tones, no shading */}
          <RoomLight dark={dark} />
          <Veil />
            <group position={[0, -H / 2, 0]}>
              {/* body shell, open at the front */}
              <Box size={[W, T, D]} position={[0, H - T / 2, 0]} />
              <Box size={[W, PLINTH, D]} position={[0, PLINTH / 2, 0]} color={pal.plinth} />
              <Box size={[T, H - PLINTH - T, D]} position={[-W / 2 + T / 2, PLINTH + (H - PLINTH - T) / 2, 0]} />
              <Box size={[T, H - PLINTH - T, D]} position={[W / 2 - T / 2, PLINTH + (H - PLINTH - T) / 2, 0]} />
              <Box size={[W, H - PLINTH - T, T]} position={[0, PLINTH + (H - PLINTH - T) / 2, -D / 2 + T / 2]} />
              <Label position={[0.05, H + 0.002, 0.1]} rotation={[-Math.PI / 2, 0, 0.12]} text="Dan's files" bg={pal.sticky} fg="#111111" height={0.3} width={0.8} bold />
              {drawers.map((drawer, i) => (
                <CabinetDrawer
                  key={drawer.slug}
                  drawer={drawer}
                  index={i}
                  open={open === i}
                  dim={open !== null && open !== i}
                  compact={compact}
                  onToggle={() => onDrawer(open === i ? null : i)}
                  onOpenFile={(f) => onOpenFile(drawer, f)}
                  onHover={onHover}
                />
              ))}
              <FloorShadow dark={dark} />
              {dark ? <><Lamp /><Floor /></> : !compact && <><Window /><Floor fade /></>}
            </group>
      </Pal.Provider>
    </Canvas>
  )
}

// ---------- the open drawer, seen from the front: the file page's sibling picker ----------

// picking a folder lifts it out and fades it before the page changes;
// the file you just left (enter) drops back into its slot
function ViewFolder({ file, color, z, slot, enter, onOpen, onHover }: {
  file: File, color: string, z: number, slot: number, enter: boolean,
  onOpen: () => void, onHover: (title: string | null) => void,
}) {
  const pal = useContext(Pal)
  const ref = useRef<THREE.Group>(null!)
  const lift = useRef(enter && !REDUCED ? 0.5 : 0)
  const opacity = useRef(enter && !REDUCED ? 0 : 1)
  const leaving = useRef(false)
  const [hovered, setHovered] = useState(false)
  const tabX = -FW / 2 + 0.2 + slot * (FW - 0.4) / 2
  const tabColor = useMemo(() => (hovered ? '#' + new THREE.Color(color).multiplyScalar(0.86).getHexString() : color), [hovered, color])

  useFrame((_, dt) => {
    const out = leaving.current
    lift.current = damp(lift.current, out ? 0.9 : hovered ? 0.12 : 0, out ? 6 : 10, dt)
    ref.current.position.y = FOLDER_Y + lift.current
    const o = damp(opacity.current, out ? 0 : 1, out ? 7 : 6, dt)
    if (o === opacity.current) return
    opacity.current = o
    ref.current.traverse((c) => {
      const m = (c as THREE.Mesh).material as THREE.Material | undefined
      if (!m || Array.isArray(m)) return
      m.transparent = o < 0.999
      m.opacity = o
      m.depthWrite = o > 0.5
    })
  })

  return (
    <group
      ref={ref}
      position={[0, FOLDER_Y, z]}
      onClick={(e) => {
        e.stopPropagation()
        if (leaving.current) return
        leaving.current = true
        setTimeout(onOpen, REDUCED ? 0 : 380)
      }}
      onPointerOver={(e) => { e.stopPropagation(); if (leaving.current) return; setHovered(true); onHover(file.title); pointer(true) }}
      onPointerOut={() => { setHovered(false); onHover(null); pointer(false) }}
    >
      <Box size={[FW, FH, 0.012]} position={[0, 0, 0]} color={color} />
      <Box size={[0.4, 0.1, 0.012]} position={[tabX, FH / 2 + 0.05, 0]} color={tabColor} />
      <Label position={[tabX, FH / 2 + 0.05, 0.0065]} text={file.short} fg={pal.ink} height={0.09} width={0.38} />
    </group>
  )
}

// low and in front, looking back into the drawer: tabs stack up front to back
function FrontCamera() {
  return <PerspectiveCamera makeDefault position={[0, 1.75, 2.35]} fov={36} near={0.1} far={20} onUpdate={(c) => c.lookAt(0, -0.24, -0.3)} />
}

export function DrawerView({ drawer, current, dark, paused, onOpen, onHover }: {
  drawer: Drawer, current: string, dark: boolean, paused: boolean,
  onOpen: (f: File) => void, onHover: (title: string | null) => void,
}) {
  const pal = dark ? DARK : LIGHT
  // the file you just left drops back in
  const [shown, setShown] = useState(current)
  const [returning, setReturning] = useState<string | null>(null)
  if (shown !== current) { setReturning(shown); setShown(current) }
  // the open file is out of the drawer, so it is not in the view
  const items = useMemo(() => drawerItems(drawer).filter((it) => !('file' in it) || it.file.slug !== current), [drawer, current])
  const step = Math.min(0.2, 1.55 / items.length)
  const sideH = DH * 0.55, sideY = -DH / 2 + 0.05 + sideH / 2
  return (
    <Canvas flat aria-hidden dpr={[1, 2]} frameloop={paused ? 'never' : 'always'} gl={{ alpha: true, antialias: true }}>
      <Pal.Provider value={pal}>
        <FrontCamera />
        <ambientLight intensity={(dark ? 0.3 : 0.79) * Math.PI} />
        <directionalLight position={[0, 8.7, 5]} intensity={(dark ? 0.7 : 0.24) * Math.PI} color={dark ? '#FFE2B8' : '#FFFFFF'} />
        <group position={[0, 0, -0.1]}>
          <Box size={[W - 0.16, 0.03, D - 0.1]} position={[0, -DH / 2 + 0.05, -0.02]} />
          <Box size={[0.03, sideH, D - 0.1]} position={[-(W / 2 - 0.09), sideY, -0.02]} />
          <Box size={[0.03, sideH, D - 0.1]} position={[W / 2 - 0.09, sideY, -0.02]} />
          <Box size={[W - 0.16, sideH, 0.03]} position={[0, sideY, -D / 2 + 0.07]} />
          {/* a low lip instead of the full drawer front, so nothing in the drawer is hidden */}
          <Box size={[W - 2 * T - 0.02, 0.16, 0.06]} position={[0, -DH / 2 + 0.1, D / 2 - 0.03]} />
          {items.map((it, i) => {
            const z = D / 2 - 0.25 - i * step
            return 'file' in it
              ? <ViewFolder key={it.key} file={it.file} slot={it.slot} z={z} color={dark ? drawer.dark : drawer.color} enter={it.file.slug === returning} onOpen={() => onOpen(it.file)} onHover={onHover} />
              : <Divider key={it.key} label={it.label} z={z} />
          })}
        </group>
      </Pal.Provider>
    </Canvas>
  )
}
