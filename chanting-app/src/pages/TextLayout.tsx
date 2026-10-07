import { NavLink, Outlet, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { UnverifiedBadge } from '../components/Badges'
import { PageTitle } from '../components/PageTitle'
import { Tib } from '../components/Tib'
import type { AudioEngine, EngineState } from '../lib/audioEngine'
import { getText, type Text } from '../lib/content'
import { useEngine } from '../lib/useEngine'
import { useLang } from '../lib/useLang'
import { NotFound } from './NotFound'

export type TextCtx = { text: Text; engine: AudioEngine | null; state: EngineState | null }

export function useTextCtx() {
  return useOutletContext<TextCtx>()
}

const TABS = [
  { to: '', key: 'tabs.read', end: true },
  { to: 'script', key: 'tabs.script' },
  { to: 'memorize', key: 'tabs.memorize' },
  { to: 'record', key: 'tabs.record' },
]

export default function TextLayout() {
  const { id } = useParams()
  const text = getText(id)
  if (!text) return <NotFound />
  return <TextLayoutInner text={text} />
}

function TextLayoutInner({ text }: { text: Text }) {
  const { t } = useTranslation()
  const { L, lang } = useLang()
  const { engine, state } = useEngine(text)
  return (
    <div>
      <PageTitle back="/" sub={<Tib className="text-xl!">{text.title.bo}</Tib>}>
        {text.title[lang]}
      </PageTitle>
      <p className="mb-3 text-muted">{L(text.description)}</p>
      {!text.verified && <div className="mb-3"><UnverifiedBadge notes={text.verifyNotes} /></div>}
      <nav aria-label={t('tabs.label')} className="-mx-4 mb-4 overflow-x-auto border-b border-line px-4">
        <ul className="flex gap-1">
          {TABS.map((tab) => (
            <li key={tab.key}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) => `block whitespace-nowrap border-b-2 px-3 py-2 text-sm ${isActive ? 'border-accent font-semibold text-accent' : 'border-transparent text-muted'}`}
              >
                {t(tab.key)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Outlet context={{ text, engine, state } satisfies TextCtx} />
    </div>
  )
}
