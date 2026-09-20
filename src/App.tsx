import {
  FileTextOutlined,
  HomeOutlined,
  PictureOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import './App.css'
import { authTheme } from './pages/Login/AuthLayout'
import NexusLogo from './pages/Login/NexusLogo'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { clearSession } from './store/slices/authSlice'
import { setSysLanguage, type SysLanguage } from './store/slices/sysSetting'

const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    ...authTheme.token,
    colorText: '#2f303a',
    colorTextPlaceholder: 'rgba(47, 48, 58, 0.45)',
    colorBgContainer: 'rgba(255,255,255,0.86)',
    colorBorder: 'rgba(47, 48, 58, 0.12)',
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
      <AntdApp>
        <Outlet />
      </AntdApp>
    </ConfigProvider>
  )
}

const navItems = [
  { to: '/', icon: <HomeOutlined />, labelKey: 'welcomeNav' as const, end: true },
  { to: '/word', icon: <FileTextOutlined />, labelKey: 'wordNav' as const, end: false },
  { to: '/image', icon: <PictureOutlined />, labelKey: 'imageNav' as const, end: false },
  { to: '/settings', icon: <SettingOutlined />, labelKey: 'settingsNav' as const, end: false },
]

function App() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { sysLanguage, theme: appTheme } = useAppSelector((state) => state.sysSetting)
  const user = useAppSelector((state) => state.auth.user)
  const displayName = user?.nickname || user?.username || ''

  function handleLogout() {
    dispatch(clearSession())
    navigate('/login', { replace: true })
  }

  function handleLanguage(next: SysLanguage) {
    dispatch(setSysLanguage(next))
  }

  return (
    <ConfigProvider theme={appTheme === 'light' ? lightTheme : authTheme}>
      <section className={`workspace ${appTheme === 'light' ? 'is-light' : ''}`}>
        <div className="login-bg" />
        <header className="workspace-header">
          <div className="workspace-brand">
            <NexusLogo className="login-logo-sm" />
            <span>NEXUS</span>
          </div>
          <p className="workspace-tag">{t('workspace.tagline')}</p>
          <div className="workspace-user">
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
        <div className="workspace-body">
          <aside className="workspace-nav">
            <p className="workspace-nav-title">{t('workspace.bench')}</p>
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
          <main className="workspace-main">
            <Outlet />
          </main>
        </div>
      </section>
    </ConfigProvider>
  )
}

export default App
