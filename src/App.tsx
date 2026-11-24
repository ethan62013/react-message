import {
  BookOutlined,
  CommentOutlined,
  FileTextOutlined,
  HomeOutlined,
  PictureOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN'
import { useEffect } from 'react'
import { getUserRequest } from './api/users'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import './App.css'
import NexusLogo from './pages/Login/NexusLogo'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { clearSession, setSession } from './store/slices/authSlice'
import { setSysLanguage, type SysLanguage } from './store/slices/sysSetting'

const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#007aff',
    colorInfo: '#007aff',
    colorBgContainer: '#ffffff',
    colorBorder: 'rgba(60, 60, 67, 0.18)',
    colorText: '#1c1c1e',
    colorTextPlaceholder: 'rgba(60, 60, 67, 0.45)',
    borderRadius: 10,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Segoe UI", sans-serif',
  },
}

export function RootLayout() {
  const { sysLanguage } = useAppSelector((state) => state.sysSetting)
  const { i18n } = useTranslation()
  const location = useLocation()
  const isAuthPage = ['/login', '/register', '/forgot'].includes(location.pathname)

  useEffect(() => {
    document.documentElement.lang = sysLanguage
    document.documentElement.dataset.page = isAuthPage ? 'login' : 'app'
    if (i18n.language !== sysLanguage) {
      void i18n.changeLanguage(sysLanguage)
    }
  }, [sysLanguage, isAuthPage, i18n])

  return (
    <ConfigProvider
      locale={sysLanguage === 'zh-CN' ? zhCN : enUS}
      button={{ autoInsertSpace: false }}
      theme={{
        token: {
          colorPrimary: '#aa3bff',
          borderRadius: 8,
          fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
        },
      }}
    >
      <AntdApp message={{ top: 72 }}>
        <Outlet />
      </AntdApp>
    </ConfigProvider>
  )
}

const navItems = [
  { to: '/admin', icon: <HomeOutlined />, labelKey: 'welcomeNav' as const, end: true },
  { to: '/admin/users', icon: <TeamOutlined />, labelKey: 'usersNav' as const, end: false },
  { to: '/admin/word', icon: <FileTextOutlined />, labelKey: 'wordNav' as const, end: false },
  { to: '/admin/image', icon: <PictureOutlined />, labelKey: 'imageNav' as const, end: false },
  { to: '/admin/kb', icon: <BookOutlined />, labelKey: 'kbNav' as const, end: true },
  { to: '/admin/kb/ask', icon: <CommentOutlined />, labelKey: 'kbAskNav' as const, end: true },
  { to: '/admin/settings', icon: <SettingOutlined />, labelKey: 'settingsNav' as const, end: false },
]

function WorkspaceHeader() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { sysLanguage } = useAppSelector((state) => state.sysSetting)
  const user = useAppSelector((state) => state.auth.user)
  const token = useAppSelector((state) => state.auth.token)
  const displayName = user?.nickname || user?.username || ''

  useEffect(() => {
    if (!token || !user?.id) return
    let cancel = false
    getUserRequest(user.id)
      .then((res) => {
        if (cancel || !res.data) return
        if (res.data.is_admin !== user.is_admin) {
          dispatch(setSession({ token, user: res.data }))
        }
      })
      .catch(() => {})
    return () => {
      cancel = true
    }
  }, [dispatch, token, user?.id, user?.is_admin])

  function handleLogout() {
    dispatch(clearSession())
    navigate('/login', { replace: true })
  }

  function handleLanguage(next: SysLanguage) {
    dispatch(setSysLanguage(next))
  }

  return (
    <header className="workspace-header">
      <Link to="/forum" className="workspace-brand">
        <NexusLogo className="login-logo-sm" />
        <span>NEXUS</span>
      </Link>
      <p className="workspace-tag">{t('workspace.tagline')}</p>
      <div className="workspace-user">
        <NavLink
          to="/admin"
          className={({ isActive }) => `workspace-admin${isActive ? ' is-active' : ''}`}
        >
          {t('workspace.adminEntry')}
        </NavLink>
        <span className="workspace-avatar" aria-hidden>
          {(displayName || 'N').slice(0, 1)}
        </span>
        <span className="workspace-name">{displayName}</span>
        <div className="workspace-langs">
          <button
            type="button"
            className={sysLanguage === 'zh-CN' ? 'is-active' : undefined}
            onClick={() => handleLanguage('zh-CN')}
          >
            {t('common.zh')}
          </button>
          <span>|</span>
          <button
            type="button"
            className={sysLanguage === 'en-US' ? 'is-active' : undefined}
            onClick={() => handleLanguage('en-US')}
          >
            {t('common.en')}
          </button>
        </div>
        <button type="button" className="workspace-logout" onClick={handleLogout}>
          {t('workspace.logout')}
        </button>
      </div>
    </header>
  )
}

function Shell({ admin }: { admin?: boolean }) {
  const { t } = useTranslation()

  return (
    <ConfigProvider theme={lightTheme}>
      <section className="workspace">
        <WorkspaceHeader />
        <div className={admin ? 'workspace-body' : 'workspace-body is-forum'}>
          {admin ? (
            <aside className="workspace-nav">
              <p className="workspace-nav-title">{t('workspace.adminEntry')}</p>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `workspace-nav-item${isActive ? ' is-active' : ''}`
                  }
                >
                  {item.icon}
                  <span>{t(`workspace.${item.labelKey}`)}</span>
                </NavLink>
              ))}
            </aside>
          ) : null}
          <main className="workspace-main">
            <Outlet />
          </main>
        </div>
      </section>
    </ConfigProvider>
  )
}

export function ForumShell() {
  return <Shell />
}

export function AdminShell() {
  return <Shell admin />
}
