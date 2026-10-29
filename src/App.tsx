import { useEffect, useState, useSyncExternalStore } from 'react'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import FileCabinet, { REDUCED } from '@/components/FileCabinet'
import { Link, Paper, Rail, type Go } from '@/components/FilePage'
import { ModeToggle } from '@/components/mode-toggle'
import { ThemeProvider, useTheme } from '@/components/theme-provider'
import { type Drawer, type File, drawers, filesOf } from '@/lib/files'

function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => { const m = matchMedia(query); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) },
    () => matchMedia(query).matches,
  )
}

function parse(path: string) {
  const [d, f] = path.split('/').filter(Boolean)
  const drawer = drawers.find((x) => x.slug === d) ?? null
  const file = (drawer && f && filesOf(drawer).find((x) => x.slug === f)) || null
  return { drawer, file }
}

const rangeOf = (d: Drawer) => `${filesOf(d).length} files · ${d.years}`

function DrawerContents({ drawer, go, dark, onHover }: { drawer: Drawer, go: Go, dark: boolean, onHover: (t: string | null) => void }) {
  return (
    <div className="rail">
      <Link to="/" go={go} className="flex items-center gap-3 border-b border-(--ink) px-4 py-3" style={{ background: dark ? drawer.dark : drawer.color }} aria-label="Close drawer">
        <ArrowLeft className="size-4 md:hidden" />
        <span>
          <span className="eyebrow block max-md:hidden">Drawer contents</span>
          <span className="text-[13px]">{drawer.label}</span>
          <span className="text-[11px] opacity-70"> · {rangeOf(drawer)}</span>
        </span>
      </Link>
      {drawer.groups.map((g) => (
        <div key={g.label}>
          {drawer.groups.length > 1 && <p className="divider"><span />{g.label}</p>}
          {g.files.map((f) => (
            <Link
              key={f.slug} to={`/${drawer.slug}/${f.slug}`} go={go} className="rail-row items-start!"
              onPointerEnter={() => onHover(f.title)} onPointerLeave={() => onHover(null)}
            >
              <span className="w-5 shrink-0 text-[10px] opacity-50">{String(filesOf(drawer).indexOf(f) + 1).padStart(2, '0')}</span>
              <span className="flex-1">
                <span className="block">{f.title}</span>
                {f.sub && <span className="block text-[10px] opacity-60">{f.sub}</span>}
              </span>
              <ChevronRight className="size-4 opacity-40 md:hidden" />
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}

function Site() {
  const { dark } = useTheme()
  const compact = useMedia('(max-width: 899px)')
  const [path, setPath] = useState(location.pathname)
  const [hover, setHover] = useState<string | null>(null)
  const { drawer, file } = parse(path)
  const di = drawer ? drawers.indexOf(drawer) : null

  const go: Go = (p) => { if (p !== location.pathname) { history.pushState(null, '', p); setPath(p) } }
  useEffect(() => {
    const on = () => setPath(location.pathname)
    addEventListener('popstate', on)
    return () => removeEventListener('popstate', on)
  }, [])

  // the page waits for the folder to finish opening; a deep link shows it straight away
  const [showPage, setShowPage] = useState(!!file)
  if (!file && showPage) setShowPage(false)
  useEffect(() => {
    if (!file || showPage) return
    const t = setTimeout(() => setShowPage(true), REDUCED ? 0 : 900)
    return () => clearTimeout(t)
  }, [file, showPage])

  // keep the last file rendered while the page fades out
  const [page, setPage] = useState<{ drawer: Drawer, file: File } | null>(null)
  if (drawer && file && page?.file !== file) setPage({ drawer, file })

  const [recent, setRecent] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('recent') ?? '[]') } catch { return [] } })
  const key = drawer && file ? `${drawer.slug}/${file.slug}` : null
  if (key && recent[0] !== key) {
    setRecent([key, ...recent.filter((k) => k !== key)].slice(0, 4))
    setHover(null)
  }
  useEffect(() => { try { localStorage.setItem('recent', JSON.stringify(recent)) } catch { /* private mode */ } }, [recent])
  useEffect(() => {
    document.title = file ? `${file.title} — Daniel Hummelstad` : drawer ? `${drawer.label} — Daniel Hummelstad` : "Daniel Hummelstad"
  }, [drawer, file])

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (file && drawer) go(`/${drawer.slug}`)
      else if (drawer) go('/')
    }
    addEventListener('keydown', on)
    return () => removeEventListener('keydown', on)
  })

  return (
    <>
      {/* the canvas is aria-hidden: this is the real site structure for keyboard and screen readers */}
      <nav className="sr-only" aria-label="All files">
        {drawers.map((d) => (
          <ul key={d.slug} aria-label={d.label}>
            {filesOf(d).map((f) => <li key={f.slug}><Link to={`/${d.slug}/${f.slug}`} go={go}>{d.label}: {f.title}</Link></li>)}
          </ul>
        ))}
      </nav>

      <main className={`stage ${showPage ? 'is-away' : ''}`} inert={showPage}>
        <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 md:p-6">
          <p className="eyebrow">daniel.hummelstad.me</p>
          <p className={`hover-title ${hover ? 'is-on' : ''}`} aria-hidden>{hover}</p>
          <span className="pointer-events-auto"><ModeToggle /></span>
        </header>

        <div className={`canvas-wrap ${drawer ? 'is-open' : ''}`}>
          <FileCabinet
            open={di}
            file={file?.slug ?? null}
            dark={dark}
            compact={compact}
            paused={showPage}
            onDrawer={(i) => go(i === null ? '/' : `/${drawers[i].slug}`)}
            onOpenFile={(d, f) => go(`/${d.slug}/${f.slug}`)}
            onHover={setHover}
          />
        </div>

        {/* mobile: the list under the cabinet. desktop zooms the camera onto the open drawer instead */}
        <div className="panel min-[900px]:hidden">
          {drawer
            ? <DrawerContents key={drawer.slug} drawer={drawer} go={go} dark={dark} onHover={setHover} />
            : (
              <ul className="rail md:hidden">
                {drawers.map((d) => (
                  <li key={d.slug} className="border-b border-(--line) last:border-0">
                    <Link to={`/${d.slug}`} go={go} className="rail-row py-3!">
                      <span className="inline-block h-4 w-3 shrink-0 border border-(--ink)" style={{ background: dark ? d.dark : d.color }} />
                      <span className="flex-1"><span className="block text-[13px]">{d.label}</span><span className="text-[10px] opacity-60">{rangeOf(d)}</span></span>
                      <ChevronRight className="size-4 opacity-40" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </main>

      {page && (
        <div className={`page ${showPage && file ? 'is-on' : ''}`} inert={!(showPage && file)}>
          <div className="mx-auto flex max-w-[1240px] flex-col items-start gap-8 px-4 pb-16 md:px-10 lg:flex-row">
            <div className="w-full min-w-0 lg:w-auto">
              <Link to={`/${page.drawer.slug}`} go={go} className="back-tab" style={{ background: dark ? page.drawer.dark : page.drawer.color }}>
                ← <b>{page.drawer.label}</b> <span className="opacity-60">/ {page.file.short}</span>
              </Link>
              <Paper key={page.file.slug} drawer={page.drawer} file={page.file} />
            </div>
            <div className="w-full lg:sticky lg:top-14 lg:mt-14 lg:w-[440px] lg:shrink-0">
              <Rail drawer={page.drawer} file={page.file} recent={recent} go={go} dark={dark} active={showPage && !!file} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function App() {
  return <ThemeProvider><Site /></ThemeProvider>
}
