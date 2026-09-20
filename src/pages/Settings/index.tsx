import { Form, Input, Switch } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setSysLanguage, setTheme, type SysLanguage } from '../../store/slices/sysSetting'

type PasswordForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

function Settings() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const { sysLanguage, theme } = useAppSelector((state) => state.sysSetting)
  const [message, setMessage] = useState('')
  const [form] = Form.useForm<PasswordForm>()

  function handleLanguage(next: SysLanguage) {
    dispatch(setSysLanguage(next))
    setMessage(t('workspace.saved'))
  }

  function handleTheme(checked: boolean) {
    dispatch(setTheme(checked ? 'dark' : 'light'))
    setMessage(t('workspace.saved'))
  }

  async function handlePassword(values: PasswordForm) {
    if (values.newPassword !== values.confirmPassword) {
      setMessage(t('workspace.passwordMismatch'))
      return
    }
    setMessage(t('workspace.passwordDemo'))
    form.resetFields()
  }

  return (
    <div>
      <h1 className="ws-title">{t('workspace.settingsTitle')}</h1>
      <p className="ws-sub">&nbsp;</p>
      <div className="ws-settings">
        <section className="ws-box">
          <h3>{t('workspace.account')}</h3>
          <div className="ws-kv">
            <span>{t('workspace.nickname')}</span>
            <b>{user?.nickname || user?.username || '—'}</b>
            <span>{t('workspace.email')}</span>
            <b>{user?.email || '—'}</b>
          </div>
        </section>
        <div className="ws-settings-row">
          <section className="ws-box">
            <h3>{t('workspace.language')}</h3>
            <div className="ws-chips">
              <button
                type="button"
                className={`ws-chip${sysLanguage === 'zh-CN' ? ' is-active' : ''}`}
                onClick={() => handleLanguage('zh-CN')}
              >
                {t('common.zh')}
              </button>
              <button
                type="button"
                className={`ws-chip${sysLanguage === 'en-US' ? ' is-active' : ''}`}
                onClick={() => handleLanguage('en-US')}
              >
                {t('common.en')}
              </button>
            </div>
          </section>
          <section className="ws-box">
            <h3>{t('workspace.appearance')}</h3>
            <div className="ws-kv">
              <span>{t('workspace.darkTheme')}</span>
              <Switch checked={theme === 'dark'} onChange={handleTheme} />
            </div>
          </section>
        </div>
        <section className="ws-box">
          <h3>{t('workspace.security')}</h3>
          <Form form={form} className="ws-form" layout="vertical" onFinish={handlePassword}>
            <Form.Item
              name="currentPassword"
              rules={[{ required: true, message: t('workspace.currentPassword') }]}
            >
              <Input.Password placeholder={t('workspace.currentPassword')} />
            </Form.Item>
            <Form.Item name="newPassword" rules={[{ required: true, message: t('workspace.newPassword') }]}>
              <Input.Password placeholder={t('workspace.newPassword')} />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              rules={[{ required: true, message: t('workspace.confirmPassword') }]}
            >
              <Input.Password placeholder={t('workspace.confirmPassword')} />
            </Form.Item>
            <button type="submit" className="ws-btn">
              {t('workspace.changePassword')}
            </button>
          </Form>
        </section>
        {message ? <p className="ws-alert">{message}</p> : null}
      </div>
    </div>
  )
}

export default Settings
