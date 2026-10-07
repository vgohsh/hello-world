import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="py-10 text-center">
      <p className="mb-4">{t('common.notFound')}</p>
      <Link className="btn" to="/">{t('common.home')}</Link>
    </div>
  )
}
