import { useTranslation } from 'react-i18next'

export function UnverifiedBadge({ notes }: { notes?: string[] }) {
  const { t } = useTranslation()
  return (
    <details className="rounded-xl border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
      <summary className="cursor-pointer font-medium">⚠ {t('badge.unverified')}</summary>
      <p className="mt-1">{t('badge.unverifiedBody')}</p>
      {notes && notes.length > 0 && (
        <ul className="mt-1 list-disc pl-5" lang="en">
          {notes.map((n) => <li key={n}>{n}</li>)}
        </ul>
      )}
    </details>
  )
}

export function PlaceholderVoiceBadge() {
  const { t } = useTranslation()
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-warn/40 bg-warn/10 px-2 py-0.5 text-xs text-warn" title={t('badge.placeholderVoiceBody')}>
      🔈 {t('badge.placeholderVoice')}
    </span>
  )
}
