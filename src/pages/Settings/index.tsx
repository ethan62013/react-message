import { Form, Input, Switch } from 'antd'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setSysLanguage, setTheme, type SysLanguage } from '../../store/slices/sysSetting'
import { workspaceCopy } from '../../workspace/copy'

type PasswordForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

function Settings() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const { sysLanguage, theme } = useAppSelector((state) => state.sysSetting)
  const t = workspaceCopy[sysLanguage]
  const [message, setMessage] = useState('')
  const [form] = Form.useForm<PasswordForm>()

  function handleLanguage(next: SysLanguage) {
    dispatch(setSysLanguage(next))
    setMessage(t.saved)
  }

  function handleTheme(checked: boolean) {
    dispatch(setTheme(checked ? 'dark' : 'light'))
    setMessage(t.saved)
  }

  async function handlePassword(values: PasswordForm) {
    if (values.newPassword !== values.confirmPassword) {
      setMessage(t.passwordMismatch)
      return
    }
    setMessage(t.passwordDemo)
    form.resetFields()
  }

  return (
    <div>
      <h1 className="ws-title">{t.settingsTitle}</h1>
      <p className="ws-sub">&nbsp;</p>
      <div className="ws-settings">
        <section className="ws-box">
          <h3>{t.account}</h3>
          <div className="ws-kv">
            <span>{t.nickname}</span>
            <b>{user?.nickname || user?.username || '—'}</b>
            <span>{t.email}</span>
            <b>{user?.email || '—'}</b>
          </div>
        </section>
        <div className="ws-settings-row">
          <section className="ws-box">
            <h3>{t.language}</h3>
            <div className="ws-chips">
              <button
                type="button"
                className={`ws-chip${sysLanguage === 'zh-CN' ? ' is-active' : ''}`}
                onClick={() => handleLanguage('zh-CN')}
              >
                中文
              </button>
              <button
                type="button"
                className={`ws-chip${sysLanguage === 'en-US' ? ' is-active' : ''}`}
                onClick={() => handleLanguage('en-US')}
              >
                English
              </button>
            </div>
          </section>
          <section className="ws-box">
            <h3>{t.appearance}</h3>
            <div className="ws-kv">
              <span>{t.darkTheme}</span>
              <Switch checked={theme === 'dark'} onChange={handleTheme} />
            </div>
          </section>
        </div>
        <section className="ws-box">
          <h3>{t.security}</h3>
          <Form form={form} className="ws-form" layout="vertical" onFinish={handlePassword}>
            <Form.Item
              name="currentPassword"
              rules={[{ required: true, message: t.currentPassword }]}
            >
              <Input.Password placeholder={t.currentPassword} />
            </Form.Item>
            <Form.Item name="newPassword" rules={[{ required: true, message: t.newPassword }]}>
              <Input.Password placeholder={t.newPassword} />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              rules={[{ required: true, message: t.confirmPassword }]}
            >
              <Input.Password placeholder={t.confirmPassword} />
            </Form.Item>
            <button type="submit" className="ws-btn">
              {t.changePassword}
            </button>
          </Form>
        </section>
        {message ? <p className="ws-alert">{message}</p> : null}
      </div>
    </div>
  )
}

export default Settings
