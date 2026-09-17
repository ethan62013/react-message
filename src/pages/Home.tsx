import { Link } from 'react-router'
import { useAppSelector } from '../store/hooks'
import { workspaceCopy } from '../workspace/copy'

function Home() {
  const user = useAppSelector((state) => state.auth.user)
  const language = useAppSelector((state) => state.sysSetting.sysLanguage)
  const t = workspaceCopy[language]
  const name = user?.nickname || user?.username || ''

  return (
    <div className="ws-hero">
      <h1 className="ws-title">
        {t.welcomeTitle}
        {name ? `，${name}` : ''}
      </h1>
      <p className="ws-sub">{t.welcomeHint}</p>
      <div className="ws-cards">
        <Link className="ws-card" to="/word">
          <strong>{t.wordNav}</strong>
          <span>{t.wordHint}</span>
          <em>{t.open} →</em>
        </Link>
        <Link className="ws-card" to="/image">
          <strong>{t.imageNav}</strong>
          <span>{t.imageHint}</span>
          <em>{t.open} →</em>
        </Link>
        <Link className="ws-card" to="/settings">
          <strong>{t.settingsNav}</strong>
          <span>{t.settingsHint}</span>
          <em>{t.open} →</em>
        </Link>
      </div>
    </div>
  )
}

export default Home
