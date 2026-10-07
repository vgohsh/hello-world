import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PlaceholderVoiceBadge } from '../components/Badges'
import { PageTitle } from '../components/PageTitle'
import { Tib } from '../components/Tib'
import { shuffle } from '../lib/shuffle'
import { speak } from '../lib/speak'
import { CONSONANTS, VOWELS, type Letter } from '../lib/tibetan'
import { useLang } from '../lib/useLang'

export default function Alphabet() {
  const { t } = useTranslation()
  const { L } = useLang()
  const [mode, setMode] = useState<'grid' | 'quiz'>('grid')
  return (
    <div className="space-y-4">
      <PageTitle back="/" sub={t('alphabet.intro')}>{t('alphabet.title')}</PageTitle>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn" aria-pressed={mode === 'grid'} onClick={() => setMode('grid')}>{t('alphabet.letters')}</button>
        <button type="button" className="btn" aria-pressed={mode === 'quiz'} onClick={() => setMode('quiz')}>{t('alphabet.quiz')}</button>
        <PlaceholderVoiceBadge />
      </div>
      {mode === 'grid' ? (
        <>
          <section>
            <h2 className="mb-2 font-semibold">{t('alphabet.consonants')}</h2>
            <p className="mb-2 text-sm text-muted">{t('alphabet.toneNote')}</p>
            <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {CONSONANTS.map((c) => (
                <li key={c.tib}>
                  <button type="button" className="card flex w-full flex-col items-center py-2" onClick={() => speak(c.phon)} aria-label={`${c.tib} ${c.wylie}`}>
                    <Tib className="text-3xl!">{c.tib}</Tib>
                    <span className="text-sm font-medium">{c.wylie}</span>
                    <span className={`text-xs ${c.tone === 'high' ? 'text-saffron' : 'text-muted'}`}>{c.phon} · {t(`alphabet.${c.tone}`)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="mb-2 font-semibold">{t('alphabet.vowels')}</h2>
            <p className="mb-2 text-sm text-muted">{t('alphabet.vowelNote')}</p>
            <ul className="grid grid-cols-4 gap-2">
              {[{ sign: '', example: 'ཀ', wylie: 'a', name: { en: 'inherent a', zh: '固有元音 a' } }, ...VOWELS].map((v) => (
                <li key={v.example}>
                  <button type="button" className="card flex w-full flex-col items-center py-2" onClick={() => speak('k' + v.wylie)}>
                    <Tib className="text-3xl!">{v.example}</Tib>
                    <span className="text-sm font-medium">k{v.wylie}</span>
                    <span className="text-xs text-muted">{L(v.name)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <LetterQuiz />
      )}
    </div>
  )
}

function LetterQuiz() {
  const { t } = useTranslation()
  const [q, setQ] = useState<Letter>(() => shuffle(CONSONANTS)[0])
  const [answer, setAnswer] = useState<string | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })
  const options = useMemo(() => shuffle([q, ...shuffle(CONSONANTS.filter((c) => c !== q)).slice(0, 3)]), [q])
  const choose = (c: Letter) => {
    if (answer) return
    setAnswer(c.tib)
    speak(q.phon)
    setScore((s) => ({ right: s.right + (c === q ? 1 : 0), total: s.total + 1 }))
  }
  return (
    <div className="card p-5 text-center">
      <p className="mb-2 text-sm text-muted">{t('alphabet.quizScore', score)}</p>
      <Tib className="text-7xl! leading-normal">{q.tib}</Tib>
      <p className="mb-3">{t('alphabet.quizPrompt')}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((c) => (
          <button
            key={c.tib}
            type="button"
            onClick={() => choose(c)}
            className={`btn min-h-12 text-lg ${answer ? (c === q ? 'border-ok bg-ok/15' : c.tib === answer ? 'border-warn bg-warn/15' : '') : ''}`}
          >
            {c.wylie}
          </button>
        ))}
      </div>
      {answer && (
        <button type="button" className="btn btn-primary mt-4" autoFocus onClick={() => { setAnswer(null); setQ(shuffle(CONSONANTS.filter((c) => c !== q))[0]) }}>
          {t('common.next')}
        </button>
      )}
    </div>
  )
}
