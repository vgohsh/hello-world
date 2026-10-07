import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Phrase } from '../lib/content'
import { showZhPhon } from '../lib/settingsStore'
import { useSettings } from '../lib/settings'
import { useLang } from '../lib/useLang'

/** Join short syllables of one word ("samaya"), separate words and long syllables ("benza sato"). */
function needsSpace(p: Phrase, i: number, tradition: 'tibetan' | 'sanskrit'): boolean {
  const a = p.syllables[i - 1]
  const b = p.syllables[i]
  return a.word?.tib !== b.word?.tib || !!b.word?.iast.includes(' ') || a.phon[tradition].length >= 4 || b.phon[tradition].length >= 4
}

type Props = {
  phrase: Phrase
  index: number
  activeSyllable: number // index within this phrase, -1 if none
  active: boolean
  onSyllable: (s: number) => void
  onPlay?: () => void
}

export const PhraseCard = forwardRef<HTMLElement, Props>(function PhraseCard({ phrase, index, activeSyllable, active, onSyllable, onPlay }, ref) {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const { L } = useLang()
  const show = settings.show
  const zh = showZhPhon(settings)
  const zhText = settings.zhPhonStyle === 'hanzi' ? phrase.phonZh : settings.zhPhonStyle === 'pinyin' ? phrase.phonPinyin : `${phrase.phonZh} · ${phrase.phonPinyin}`
  return (
    <article ref={ref} data-testid="phrase" className={`card p-4 ${active ? 'border-saffron ring-2 ring-saffron/30' : ''}`} aria-current={active ? 'true' : undefined}>
      <div className="mb-1 flex items-center justify-between text-xs text-muted">
        <span>{t('reader.phraseN', { n: index + 1 })}</span>
        {onPlay && (
          <button type="button" className="btn min-h-8 px-2.5 text-xs" onClick={onPlay} aria-label={t('reader.playPhrase', { n: index + 1 })}>▶</button>
        )}
      </div>
      {show.tib && (
        <p className="leading-loose" lang="bo">
          {phrase.syllables.map((s, i) => (
            <span key={i}>
              <button
                type="button"
                className="syl tib"
                data-active={i === activeSyllable}
                onClick={() => onSyllable(i)}
                aria-label={`${s.tib} — ${s.phon[settings.tradition]}`}
              >
                {s.tib}
              </button>
              <span aria-hidden className="tib">{i < phrase.syllables.length - 1 ? '་' : '།'}</span>
            </span>
          ))}
        </p>
      )}
      {show.phon && (
        <p className="text-lg font-medium" data-testid="phon">
          {phrase.syllables.map((s, i) => (
            <span key={i}>
              {i > 0 && needsSpace(phrase, i, settings.tradition) ? ' ' : ''}
              <span className={i === activeSyllable ? 'rounded bg-highlight' : ''}>{s.phon[settings.tradition]}</span>
            </span>
          ))}
        </p>
      )}
      {show.iast && <p className="italic text-muted">{phrase.iast}</p>}
      {zh && <p lang="zh-Hans" className="text-muted">{zhText}</p>}
      {show.meaning && <p className="mt-1 border-t border-line pt-1">{L(phrase.gloss)}</p>}
    </article>
  )
})
