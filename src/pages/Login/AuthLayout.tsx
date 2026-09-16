import { GlobalOutlined } from '@ant-design/icons'
import { ConfigProvider, theme } from 'antd'
import type { ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setSysLanguage, type SysLanguage } from '../../store/slices/sysSetting'
import NexusLogo from './NexusLogo'
import './index.css'

type AuthLayoutProps = {
  tagline?: string
  centered?: boolean
  children: ReactNode
}

export const authTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#AA3BFF',
    colorInfo: '#22D3EE',
    colorBgContainer: 'rgba(255,255,255,0.06)',
    colorBorder: 'rgba(237,235,247,0.16)',
    colorText: '#EDEBF7',
    colorTextPlaceholder: 'rgba(237,235,247,0.45)',
    borderRadius: 14,
    fontFamily: "'Outfit', system-ui, 'Segoe UI', sans-serif",
  },
}

function AuthLayout({
  tagline = 'CONNECT · COLLABORATE · BUILD TOMORROW',
  centered = false,
  children,
}: AuthLayoutProps) {
  const dispatch = useAppDispatch()
  const language = useAppSelector((state) => state.sysSetting.sysLanguage)

  function handleLanguage(next: SysLanguage) {
    dispatch(setSysLanguage(next))
  }

  return (
    <ConfigProvider theme={authTheme}>
      <section className="login-page">
        <div className="login-bg" />
        <header className="login-chrome">
          <div className="login-chrome-brand">
            <NexusLogo className="login-logo-sm" />
            <span>NEXUS</span>
          </div>
          <p className="login-chrome-tag">{tagline}</p>
        </header>
        <div className={centered ? 'login-layout login-layout-center' : 'login-layout'}>
          {centered ? null : (
            <div className="login-hero">
              <p className="login-kicker">CONNECT BEYOND BOUNDARIES</p>
              <h1 className="login-wordmark">NEXUS</h1>
              <p className="login-welcome">Welcome back.</p>
              <p className="login-continue">Sign in to continue.</p>
              <p className="login-hero-foot">
                SAME PEOPLE
                <br />
                BRIGHTER POSSIBILITIES
              </p>
            </div>
          )}
          <div className="login-card">
            {children}
            <div className="login-langs">
              <GlobalOutlined />
              <button
                type="button"
                className={language === 'zh-CN' ? 'is-active' : undefined}
                onClick={() => handleLanguage('zh-CN')}
              >
                中文
              </button>
              <button
                type="button"
                className={language === 'en-US' ? 'is-active' : undefined}
                onClick={() => handleLanguage('en-US')}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </section>
    </ConfigProvider>
  )
}

export default AuthLayout
