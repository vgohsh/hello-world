import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageTitle } from '../components/PageTitle'
import { db, today } from '../lib/db'

export default function Practice() {
  const { t } = useTranslation()
  const todayCount = useLiveQuery(async () => {
    try {
      return (await db.tally.where('day').equals(today()).toArray()).reduce((n, x) => n + x.count, 0)
    } catch {
      return 0
    }
  }, [], 0)
  const items = [
    { to: '/practice/mala', icon: '📿', key: 'mala' },
    { to: '/practice/session', icon: '🪷', key: 'session' },
    { to: '/practice/tracker', icon: '📈', key: 'tracker' },
  ]
  return (
    <div className="space-y-4">
      <PageTitle sub={t('practice.today', { count: todayCount })}>{t('practice.title')}</PageTitle>
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="card flex items-center gap-4 p-4">
              <span aria-hidden className="text-3xl">{i.icon}</span>
              <span>
                <span className="block font-semibold">{t(`${i.key}.title`)}</span>
                <span className="text-sm text-muted">{t(`${i.key}.desc`)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
