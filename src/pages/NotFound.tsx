import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

function NotFound() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="ws-title">404</h1>
      <p className="ws-sub">{t('workspace.notFound')}</p>
      <Link className="ws-card" to="/" style={{ display: 'inline-flex', width: 'auto' }}>
        {t('workspace.backHome')} →
      </Link>
    </div>
  )
}

export default NotFound
