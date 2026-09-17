import { Link } from 'react-router'
import { useAppSelector } from '../store/hooks'
import { workspaceCopy } from '../workspace/copy'

function NotFound() {
  const language = useAppSelector((state) => state.sysSetting.sysLanguage)
  const t = workspaceCopy[language]

  return (
    <div>
      <h1 className="ws-title">404</h1>
      <p className="ws-sub">{t.notFound}</p>
      <Link className="ws-card" to="/" style={{ display: 'inline-flex', width: 'auto' }}>
        {t.backHome} →
      </Link>
    </div>
  )
}

export default NotFound
