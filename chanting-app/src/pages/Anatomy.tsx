import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageTitle } from '../components/PageTitle'
import { Tib } from '../components/Tib'
import { analyze, componentName, ROLE_NAMES, unstack, type Role } from '../lib/tibetan'
import { useLang } from '../lib/useLang'

const EXAMPLES = ['བསྒྲུབས', 'སྐད', 'དགའ', 'རྒྱལ', 'ལྷ', 'བཀྲ', 'སཏྭ', 'ཧཱུྃ']
const ROLE_COLOR: Partial<Record<Role, string>> = {
  prefix: 'bg-sky-500/15 border-sky-500/50',
  superscript: 'bg-violet-500/15 border-violet-500/50',
  root: 'bg-saffron/25 border-saffron',
  subscript: 'bg-emerald-500/15 border-emerald-500/50',
  vowel: 'bg-rose-500/15 border-rose-500/50',
  suffix: 'bg-indigo-500/15 border-indigo-500/50',
  postsuffix: 'bg-teal-500/15 border-teal-500/50',
}

export default function Anatomy() {
  const { t } = useTranslation()
  const { L } = useLang()
  const [input, setInput] = useState(EXAMPLES[0])
  const syllables = input.split(/[་།\s]+/).filter(Boolean)
  return (
    <div className="space-y-4">
      <PageTitle back="/" sub={t('anatomy.intro')}>{t('anatomy.title')}</PageTitle>
      <label className="block">
        <span className="text-sm text-muted">{t('anatomy.input')}</span>
        <input lang="bo" className="tib mt-1 w-full rounded-xl border border-line bg-surface px-3 py-1" value={input} onChange={(e) => setInput(e.target.value)} />
      </label>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((e) => (
          <button key={e} type="button" className="btn" aria-pressed={input === e} onClick={() => setInput(e)}><Tib className="text-xl!">{e}</Tib></button>
        ))}
      </div>
      {syllables.map((s, i) => {
        const a = analyze(s)
        return (
          <article key={i} className="card p-4">
            <div className="mb-3 flex items-center gap-3">
              <Tib className="text-5xl! leading-normal">{s}</Tib>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs">{a.kind === 'native' ? t('anatomy.native') : t('anatomy.sanskrit')}</span>
            </div>
            <ol className="flex flex-wrap gap-2" aria-label={t('anatomy.parts')}>
              {a.parts.map((part) => ({ ...part, char: part.role === 'root' ? unstack(part.char) : part.char })).map((p, j) => (
                <li key={j} className={`flex min-w-20 flex-col items-center rounded-lg border px-2 py-1 text-center ${ROLE_COLOR[p.role] ?? 'border-line bg-surface-2'}`}>
                  <Tib className="tib-lg leading-tight">{/[ཱ-྄ྐ-ྼ]/.test(p.char) ? `◌${p.char}` : p.char}</Tib>
                  <span className="text-xs font-semibold">{L(ROLE_NAMES[p.role])}</span>
                  <span className="text-xs text-muted">{L(componentName(p.char))}</span>
                </li>
              ))}
            </ol>
          </article>
        )
      })}
      <section className="card space-y-2 p-4 text-sm">
        <h2 className="font-semibold">{t('anatomy.howTitle')}</h2>
        <p>{t('anatomy.how')}</p>
        <p className="text-muted">{t('anatomy.limits')}</p>
      </section>
    </div>
  )
}
