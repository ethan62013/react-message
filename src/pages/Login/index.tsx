import {
  ArrowRightOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  MailOutlined,
} from '@ant-design/icons'
import { Button, Checkbox, Form, Input } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { loginRequest } from '../../api/auth'
import { useApiNotify } from '../../api/notify'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setSession } from '../../store/slices/authSlice'
import AuthLayout from './AuthLayout'
import NexusLogo from './NexusLogo'

const REMEMBER_KEY = 'login.rememberEmail'

type LoginForm = {
  email: string
  password: string
  remember: boolean
}

const copy = {
  'zh-CN': {
    title: '登录',
    hint: '使用系统账号进入工作台',
    email: '请输入邮箱地址',
    password: '请输入密码',
    remember: '记住我',
    forgot: '忘记密码?',
    submit: '登录',
    register: '立即注册',
    noAccount: '没有账号？',
    offline: '无法连接服务器，请确认后台已启动',
  },
  'en-US': {
    title: 'Sign in',
    hint: 'Use your system account to enter the workspace',
    email: 'Enter email',
    password: 'Enter password',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    submit: 'Sign in',
    register: 'Create account',
    noAccount: 'No account?',
    offline: 'Cannot reach the server. Please confirm the backend is running.',
  },
} as const

function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [form] = Form.useForm<LoginForm>()
  const language = useAppSelector((state) => state.sysSetting.sysLanguage)
  const t = copy[language]
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
        notify.fail(null, t.offline)
        return
      }
      dispatch(setSession(res.data))
      navigate('/', { replace: true })
    } catch (err) {
      notify.fail(err, t.offline)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout tagline="PEOPLE · IDEAS · A BRIGHTER TOMORROW">
      <div className="login-card-brand">
        <NexusLogo className="login-logo" />
        <span>NEXUS</span>
      </div>
      <h2>{t.title}</h2>
      <p className="login-hint">{t.hint}</p>
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
            { required: true, message: t.email },
            { type: 'email', message: t.email },
          ]}
        >
          <Input
            size="large"
            prefix={<MailOutlined />}
            placeholder={t.email}
            autoComplete="email"
          />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: t.password }]}>
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder={t.password}
            autoComplete="current-password"
            iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <div className="login-row">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>{t.remember}</Checkbox>
          </Form.Item>
          <Button type="link" className="login-forgot" onClick={() => navigate('/forgot')}>
            {t.forgot}
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
            {t.submit} <ArrowRightOutlined />
          </Button>
        </Form.Item>
      </Form>
      <p className="login-switch">
        {t.noAccount}
        <button type="button" onClick={() => navigate('/register')}>
          {t.register}
        </button>
      </p>
    </AuthLayout>
  )
}

export default Login
