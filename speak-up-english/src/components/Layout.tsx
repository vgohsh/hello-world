import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { BookIcon, ChartIcon, GearIcon, HomeIcon, MoonIcon, SunIcon } from './Icons'
import { useProgress } from '../hooks/useProgress'
import { stopSpeech } from '../hooks/useSpeechSynthesis'

const nav = [
  { to: '/', label: 'Home', Icon: HomeIcon, end: true },
  { to: '/course', label: 'Course', Icon: BookIcon, end: false },
  { to: '/progress', label: 'Progress', Icon: ChartIcon, end: false },
  { to: '/settings', label: 'Settings', Icon: GearIcon, end: false },
]

export default function Layout() {
  const { settings, updateSettings } = useProgress()
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    stopSpeech()
  }, [pathname])

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors ${isActive ? 'bg-gold-soft text-gold' : 'text-muted hover:text-ink'}`

  return (
    <div className="min-h-dvh pb-20 md:pb-0">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 btn-gold">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <NavLink to="/" className="h-serif text-2xl text-ink">
            Speak Up <span className="text-gold">English</span>
          </NavLink>
          <nav aria-label="Main" className="hidden gap-1 md:flex">
            {nav.map(({ to, label, Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={linkCls}>
                <Icon width={16} height={16} />
                {label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="btn-ghost !px-2.5"
            onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            aria-label={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {settings.theme === 'dark' ? <SunIcon width={18} height={18} /> : <MoonIcon width={18} height={18} />}
          </button>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-4 py-6 md:py-10">
        <Outlet />
      </main>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {nav.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `flex flex-col items-center gap-1 py-2.5 text-[11px] ${isActive ? 'text-gold' : 'text-muted'}`}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
