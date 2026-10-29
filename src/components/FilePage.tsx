import React, { useState } from 'react'
import { Paperclip } from 'lucide-react'
import { DrawerView } from '@/components/FileCabinet'
import { type Drawer, type File, type Row, type Section, drawers, filesOf } from '@/lib/files'

const printed = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const pad = (n: number) => String(n).padStart(2, '0')

export type Go = (path: string) => void

// a plain <a> that navigates client-side, so every file is still a real, shareable link
export function Link({ to, go, ...props }: { to: string, go: Go } & React.ComponentProps<'a'>) {
  return <a href={to} onClick={(e) => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); go(to) }} {...props} />
}

const Value = ({ row: [, value, href] }: { row: Row }) =>
  href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{value}</a> : <>{value}</>

function Block({ s, attachment }: { s: Section, attachment: string }) {
  switch (s.kind) {
    case 'fields':
      return (
        <dl className="fields">
          {s.rows.map((r, i) => r[1] ? <React.Fragment key={i}><dt>{r[0]}</dt><dd><Value row={r} /></dd></React.Fragment> : <dt key={i} className="span">{r[0]}</dt>)}
        </dl>
      )
    case 'table':
      return (
        <section>
          <h3>{s.title}</h3>
          <table className={s.head[0] === '#' ? 'numbered' : undefined}>
            <thead><tr>{s.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{s.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
          </table>
          {s.totals && <dl className="totals">{s.totals.map((r) => <div key={r[0]}><dt>{r[0]}</dt><dd>{r[1]}</dd></div>)}</dl>}
        </section>
      )
    case 'status':
      return <p className="status">{s.label} <span>{s.value}</span></p>
    case 'figures':
      return (
        <section>
          <h3>{s.title}</h3>
          <dl className="figures">{s.rows.map((r) => <div key={r[0]}><dt>{r[0]}</dt><dd>{r[1]}</dd></div>)}</dl>
        </section>
      )
    case 'prose':
      return <section><h3>{s.title}</h3>{s.paras.map((p, i) => <p key={i} className="prose">{p}</p>)}</section>
    case 'leaders':
      return <div>{s.rows.map((r) => <div key={r[0]} className="leader"><span>{r[0]}</span><i /><Value row={r} /></div>)}</div>
    case 'attachment':
      return (
        <figure className="attachment">
          <div className="leader"><span>Attachment {attachment}</span><i /><span>{s.name}</span></div>
          <div className="photo">
            <Paperclip className="clip" aria-hidden strokeWidth={1.5} />
            <img src={s.src} alt={s.name} loading="lazy" />
          </div>
        </figure>
      )
  }
}

export function Paper({ drawer, file }: { drawer: Drawer, file: File }) {
  const di = drawers.indexOf(drawer)
  const fi = filesOf(drawer).indexOf(file)
  let attachments = 0
  return (
    <article className="paper">
      <div className="feed" aria-hidden />
      <div className="sheet">
        <header className="letterhead">
          <address>
            {['Daniel Hummelstad', file.record, 'Gold Coast, QLD 4217, Australia', file.contact ?? 'daniel@hummelstad.me'].map((l) => <div key={l}>{l}</div>)}
          </address>
          <dl className="refbox">
            <dt>File No.:</dt><dd>{pad(di + 1)}-{pad(fi + 1)}</dd>
            <dt>Drawer:</dt><dd>{drawer.label}</dd>
            <dt>Printed:</dt><dd>{printed}</dd>
          </dl>
        </header>
        <h1 className="sr-only">{file.title}</h1>
        {file.sections.map((s, i) => <Block key={i} s={s} attachment={s.kind === 'attachment' ? String.fromCharCode(65 + attachments++) : ''} />)}
        <footer className="signoff">
          <p>***</p>
          <p>{file.signoff ?? 'End of record.'}</p>
          <p>daniel.hummelstad.me</p>
        </footer>
      </div>
      <div className="feed" aria-hidden />
    </article>
  )
}

function Swatch({ color }: { color: string }) {
  return <span className="inline-block size-3 shrink-0 border border-(--ink)" style={{ background: color }} />
}

export function Rail({ drawer, file, recent, go, dark, active }: { drawer: Drawer, file: File, recent: string[], go: Go, dark: boolean, active: boolean }) {
  const [hover, setHover] = useState<string | null>(null)
  const files = filesOf(drawer)
  const next = files[(files.indexOf(file) + 1) % files.length]
  const tint = (d: Drawer) => (dark ? d.dark : d.color)
  const recentFiles = recent
    .map((key) => { const [d, f] = key.split('/'); const dr = drawers.find((x) => x.slug === d); const fl = dr && filesOf(dr).find((x) => x.slug === f); return dr && fl ? { dr, fl } : null })
    .filter((x) => x && x.fl !== file)
    .slice(0, 3) as { dr: Drawer, fl: File }[]

  return (
    <aside className="rail">
      <div className="border-b border-(--ink) px-4 py-3" style={{ background: tint(drawer) }}>
        <p className="eyebrow">Also in this drawer</p>
        <p className="text-[11px] opacity-70">{drawer.label} · {files.length} files</p>
      </div>
      {/* the drawer itself, front on: every file in it, this one raised */}
      <div className="h-[340px] border-b border-(--line)">
        <DrawerView drawer={drawer} current={file.slug} dark={dark} paused={!active} onOpen={(f) => go(`/${drawer.slug}/${f.slug}`)} onHover={setHover} />
      </div>
      <p className="flex items-center gap-2 border-b border-(--ink) px-4 py-2 text-[11px]">
        <Swatch color={tint(drawer)} />
        <span className={hover ? '' : 'opacity-60'}>{hover ?? file.title}</span>
      </p>
      <ul className="sr-only">
        {files.filter((f) => f !== file).map((f) => (
          <li key={f.slug}><Link to={`/${drawer.slug}/${f.slug}`} go={go}>{f.title}</Link></li>
        ))}
      </ul>
      <Link to={`/${drawer.slug}/${next.slug}`} go={go} className="block border-b border-(--ink) px-4 py-3 hover:bg-(--hover)">
        <p className="eyebrow">Next file</p>
        <p className="text-[12px]">{next.title} →</p>
      </Link>
      {recentFiles.length > 0 && (
        <div className="px-4 py-3">
          <p className="eyebrow mb-1">Recently opened</p>
          {recentFiles.map(({ dr, fl }) => (
            <Link key={dr.slug + fl.slug} to={`/${dr.slug}/${fl.slug}`} go={go} className="flex items-center gap-2 py-1 text-[11px] opacity-80 hover:opacity-100">
              <Swatch color={tint(dr)} />{fl.title}
            </Link>
          ))}
        </div>
      )}
    </aside>
  )
}
