import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useAppSelector } from '../store/hooks'

function Home() {
  const { t } = useTranslation()
  const user = useAppSelector((state) => state.auth.user)
  const name = user?.nickname || user?.username || ''

  return (
    <div className="ws-hero">
      <h1 className="ws-title">
        {name ? t('workspace.welcomeNamed', { name }) : t('workspace.welcomeTitle')}
      </h1>
      <p className="ws-sub">{t('workspace.welcomeHint')}</p>
      <div className="ws-cards">
        <Link className="ws-card" to="/word">
          <strong>{t('workspace.wordNav')}</strong>
          <span>{t('workspace.wordHint')}</span>
          <em>{t('workspace.open')} →</em>
        </Link>
        <Link className="ws-card" to="/image">
          <strong>{t('workspace.imageNav')}</strong>
          <span>{t('workspace.imageHint')}</span>
          <em>{t('workspace.open')} →</em>
        </Link>
        <Link className="ws-card" to="/settings">
          <strong>{t('workspace.settingsNav')}</strong>
          <span>{t('workspace.settingsHint')}</span>
          <em>{t('workspace.open')} →</em>
        </Link>
      </div>
    </div>
  )
}

export default Home
