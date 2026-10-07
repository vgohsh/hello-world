import { useTranslation } from 'react-i18next'
import type { Syllable } from '../lib/content'
import { useSettings } from '../lib/settings'
import { useLang } from '../lib/useLang'
import { analyze, componentName, ROLE_NAMES, unstack } from '../lib/tibetan'
import { Sheet } from './Sheet'
import { Tib } from './Tib'

export function StackBreakdown({ syl }: { syl: Syllable }) {
  const { t } = useTranslation()
  const { L } = useLang()
  const a = analyze(syl.tib)
  return (
    <div>
      <ul className="flex flex-wrap gap-2">
        {a.parts.map((part) => ({ ...part, char: part.role === 'root' ? unstack(part.char) : part.char })).map((p, i) => (
          <li key={i} className="flex min-w-16 flex-col items-center rounded-lg border border-line bg-surface-2 px-2 py-1 text-center">
            <Tib className="tib-lg leading-tight">{p.char.match(/[ཱ-྄ྐ-ྼ]/) ? `◌${p.char}` : p.char}</Tib>
            <span className="text-xs font-medium">{L(ROLE_NAMES[p.role])}</span>
            <span className="text-xs text-muted">{L(componentName(p.char))}</span>
          </li>
        ))}
      </ul>
      {syl.stack && <p className="mt-2 text-sm">{L(syl.stack.note)}</p>}
      {a.kind === 'sanskrit' && <p className="mt-1 text-xs text-muted">{t('script.sanskritNote')}</p>}
    </div>
  )
}

export function SyllableSheet({ syl, onClose, onPlay, onPlayFrom }: {
  syl: Syllable | null
  onClose: () => void
  onPlay: () => void
  onPlayFrom: () => void
}) {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const { L } = useLang()
  const row = (label: string, value: string, strong = false, lang?: string) => (
    <div className="flex justify-between gap-4 border-b border-line py-1.5 text-sm last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd lang={lang} className={strong ? 'font-semibold' : ''}>{value}</dd>
    </div>
  )
  return (
    <Sheet open={syl !== null} onClose={onClose} title={t('syllable.title')}>
      {syl && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Tib className="text-5xl! leading-normal">{syl.tib}</Tib>
            <div className="flex flex-col gap-2">
              <button type="button" className="btn btn-primary" onClick={onPlay}>▶ {t('syllable.play')}</button>
              <button type="button" className="btn" onClick={onPlayFrom}>⏩ {t('syllable.playFrom')}</button>
            </div>
          </div>
          <dl>
            {row(t('fields.phonTibetan'), syl.phon.tibetan, settings.tradition === 'tibetan')}
            {row(t('fields.phonSanskrit'), syl.phon.sanskrit, settings.tradition === 'sanskrit')}
            {row(t('fields.zhPhon'), `${syl.phonZh} · ${syl.phonPinyin}`, false, 'zh-Hans')}
            {row(t('fields.iast'), syl.iast)}
            {row(t('fields.wylie'), syl.wylie)}
          </dl>
          {syl.word && (
            <section>
              <h3 className="mb-1 text-sm font-semibold">{t('syllable.word')}</h3>
              <p><Tib>{syl.word.tib}</Tib> <span className="text-muted">· {syl.word.iast}</span></p>
              <p className="text-sm">{L(syl.word.gloss)}</p>
            </section>
          )}
          <section>
            <h3 className="mb-1 text-sm font-semibold">{t('syllable.parts')}</h3>
            <StackBreakdown syl={syl} />
          </section>
        </div>
      )}
    </Sheet>
  )
}
