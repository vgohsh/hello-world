import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageTitle } from '../components/PageTitle'
import { download, tallyCsv } from '../lib/csv'
import { db, today, type Goal, type Tally } from '../lib/db'
import { streak } from '../lib/mala'
import { DEFAULT_GOALS, MANTRAS } from '../lib/useMantras'
import { useLang } from '../lib/useLang'

const DAYS = 30

function lastDays(n: number): string[] {
  const out: string[] = []
  const d = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d)
    x.setDate(d.getDate() - i)
    out.push(today(x))
  }
  return out
}

export default function Tracker() {
  const { t } = useTranslation()
  const tally = useLiveQuery(() => db.tally.toArray().catch(() => [] as Tally[]), [], [] as Tally[])
  const goals = useLiveQuery(() => db.goals.toArray().catch(() => [] as Goal[]), [], [] as Goal[])
  return (
    <div className="space-y-4">
      <PageTitle back="/practice" sub={t('tracker.desc')}>{t('tracker.title')}</PageTitle>
      {MANTRAS.map((m) => (
        <MantraTracker key={m.id} textId={m.id} rows={tally.filter((r) => r.textId === m.id)} goal={goals.find((g) => g.textId === m.id)?.goal ?? DEFAULT_GOALS[m.id] ?? 100_000} />
      ))}
      <button type="button" className="btn" onClick={() => download(`chanting-${today()}.csv`, tallyCsv(tally), 'text/csv')} disabled={!tally.length}>
        ⬇ {t('tracker.export')}
      </button>
    </div>
  )
}

function MantraTracker({ textId, rows, goal }: { textId: string; rows: Tally[]; goal: number }) {
  const { t } = useTranslation()
  const { lang } = useLang()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(goal))
  const text = MANTRAS.find((m) => m.id === textId)!
  const sum = rows.reduce((n, r) => n + r.count, 0)
  const days = lastDays(DAYS)
  const byDay = new Map(rows.map((r) => [r.day, r.count]))
  const series = days.map((d) => byDay.get(d) ?? 0)
  const max = Math.max(1, ...series)
  const s = streak(rows.filter((r) => r.count > 0).map((r) => r.day), today())
  const pct = Math.min(100, (sum / goal) * 100)
  const fmt = (n: number) => n.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en')

  return (
    <article className="card space-y-3 p-4">
      <h2 className="font-semibold">{text.title[lang]}</h2>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span><strong className="text-xl">{fmt(sum)}</strong> / {fmt(goal)}</span>
        <span>🔥 {t('tracker.streak', { count: s })}</span>
        <span>{t('tracker.today', { count: byDay.get(today()) ?? 0 })}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={t('tracker.goalProgress')}>
        <div className="h-full bg-saffron" style={{ width: `${pct}%` }} />
      </div>
      <figure>
        <svg viewBox={`0 0 ${DAYS * 10} 60`} className="h-20 w-full" role="img" aria-label={t('tracker.chart', { days: DAYS })}>
          {series.map((v, i) => (
            <rect key={days[i]} x={i * 10 + 1} y={60 - (v / max) * 58} width={8} height={Math.max(v ? 2 : 0.5, (v / max) * 58)} rx={1.5} fill={v ? 'var(--saffron)' : 'var(--line)'}>
              <title>{`${days[i]}: ${v}`}</title>
            </rect>
          ))}
        </svg>
        <figcaption className="flex justify-between text-xs text-muted"><span>{days[0]}</span><span>{t('tracker.today', { count: series[series.length - 1] })}</span></figcaption>
      </figure>
      {editing ? (
        <form className="flex gap-2" onSubmit={(e) => {
          e.preventDefault()
          const n = Math.floor(Number(draft))
          if (n > 0) void db.goals.put({ textId, goal: n })
          setEditing(false)
        }}>
          <input type="number" min={1} className="w-36 rounded-full border border-line bg-surface px-3" value={draft} onChange={(e) => setDraft(e.target.value)} aria-label={t('tracker.goal')} />
          <button type="submit" className="btn">{t('common.save')}</button>
        </form>
      ) : (
        <button type="button" className="btn text-sm" onClick={() => { setDraft(String(goal)); setEditing(true) }}>🎯 {t('tracker.editGoal')}</button>
      )}
    </article>
  )
}
