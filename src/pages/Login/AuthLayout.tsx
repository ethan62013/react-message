import { GlobalOutlined } from '@ant-design/icons'
import { ConfigProvider, theme } from 'antd'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
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
  tagline,
  centered = false,
  children,
}: AuthLayoutProps) {
  const { t } = useTranslation()
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
          <p className="login-chrome-tag">{tagline ?? t('auth.tagline')}</p>
        </header>
        <div className={centered ? 'login-layout login-layout-center' : 'login-layout'}>
          {centered ? null : (
            <div className="login-hero">
              <p className="login-kicker">{t('auth.heroKicker')}</p>
              <h1 className="login-wordmark">NEXUS</h1>
              <p className="login-welcome">{t('auth.heroWelcome')}</p>
              <p className="login-continue">{t('auth.heroContinue')}</p>
              <p className="login-hero-foot">
                {t('auth.heroFoot1')}
                <br />
                {t('auth.heroFoot2')}
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
                {t('common.zh')}
              </button>
              <button
                type="button"
                className={language === 'en-US' ? 'is-active' : undefined}
                onClick={() => handleLanguage('en-US')}
              >
                {t('common.en')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </ConfigProvider>
  )
}

export default AuthLayout
