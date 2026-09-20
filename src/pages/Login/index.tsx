import {
  ArrowRightOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  MailOutlined,
} from '@ant-design/icons'
import { Button, Checkbox, Form, Input } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { loginRequest } from '../../api/auth'
import { useApiNotify } from '../../api/notify'
import { useAppDispatch } from '../../store/hooks'
import { setSession } from '../../store/slices/authSlice'
import AuthLayout from './AuthLayout'
import NexusLogo from './NexusLogo'

const REMEMBER_KEY = 'login.rememberEmail'

type LoginForm = {
  email: string
  password: string
  remember: boolean
}

function Login() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [form] = Form.useForm<LoginForm>()
  const notify = useApiNotify()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      form.setFieldsValue({ email: saved, remember: true })
    }
  }, [form])

  async function handleFinish(values: LoginForm) {
    setSubmitting(true)
    try {
      const res = await loginRequest(values.email.trim(), values.password)
      if (values.remember) {
        localStorage.setItem(REMEMBER_KEY, values.email.trim())
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }
      if (!res.data) {
        notify.fail(null, t('common.offline'))
        return
      }
      dispatch(setSession(res.data))
      navigate('/', { replace: true })
    } catch (err) {
      notify.fail(err, t('common.offline'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout tagline={t('auth.loginTagline')}>
      <div className="login-card-brand">
        <NexusLogo className="login-logo" />
        <span>NEXUS</span>
      </div>
      <h2>{t('auth.login.title')}</h2>
      <p className="login-hint">{t('auth.login.hint')}</p>
      <Form
        form={form}
        className="login-form"
        layout="vertical"
        requiredMark={false}
        initialValues={{ remember: false }}
        onFinish={handleFinish}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: t('auth.login.email') },
            { type: 'email', message: t('auth.login.email') },
          ]}
        >
          <Input
            size="large"
            prefix={<MailOutlined />}
            placeholder={t('auth.login.email')}
            autoComplete="email"
          />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: t('auth.login.password') }]}>
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder={t('auth.login.password')}
            autoComplete="current-password"
            iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <div className="login-row">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>{t('auth.login.remember')}</Checkbox>
          </Form.Item>
          <Button type="link" className="login-forgot" onClick={() => navigate('/forgot')}>
            {t('auth.login.forgot')}
          </Button>
        </div>
        <Form.Item>
          <Button
            className="login-submit"
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={submitting}
          >
            {t('auth.login.submit')} <ArrowRightOutlined />
          </Button>
        </Form.Item>
      </Form>
      <p className="login-switch">
        {t('auth.login.noAccount')}
        <button type="button" onClick={() => navigate('/register')}>
          {t('auth.login.register')}
        </button>
      </p>
    </AuthLayout>
  )
}

export default Login
