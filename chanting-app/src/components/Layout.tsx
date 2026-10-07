import { NavLink, Link, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LangToggle } from './LangToggle'

const NAV = [
  { to: '/', key: 'nav.learn', icon: '📖', end: true },
  { to: '/review', key: 'nav.review', icon: '🔁' },
  { to: '/practice', key: 'nav.practice', icon: '📿' },
  { to: '/settings', key: 'nav.settings', icon: '⚙️' },
]

export function Layout() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col">
      <a href="#main" className="sr-only focus:not-sr-only">{t('a11y.skip')}</a>
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-bg/95 px-4 py-2 backdrop-blur">
        <Link to="/" className="flex items-center gap-2 font-semibold text-accent">
          <span lang="bo" className="tib text-2xl leading-none">ༀ</span>
          <span>{t('app.name')}</span>
        </Link>
        <LangToggle />
      </header>
      <main id="main" className="flex-1 px-4 pb-28 pt-4">
        <Outlet />
      </main>
      <nav aria-label={t('nav.label')} className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <ul className="mx-auto flex max-w-3xl">
          {NAV.map((n) => (
            <li key={n.to} className="flex-1">
              <NavLink
                to={n.to}
                end={n.end}
                className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-xs ${isActive ? 'font-semibold text-accent' : 'text-muted'}`}
              >
                <span aria-hidden className="text-lg">{n.icon}</span>
                {t(n.key)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
