import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function PageTitle({ children, back, sub }: { children: ReactNode; back?: string; sub?: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="mb-4">
      {back && (
        <Link to={back} className="mb-1 inline-block text-sm text-muted">
          ← {t('common.back')}
        </Link>
      )}
      <h1 className="text-2xl font-semibold leading-tight">{children}</h1>
      {sub && <div className="mt-1 text-muted">{sub}</div>}
    </div>
  )
}
