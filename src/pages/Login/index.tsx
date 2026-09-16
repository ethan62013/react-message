import {
  ArrowRightOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  GlobalOutlined,
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Alert, Button, Checkbox, ConfigProvider, Form, Input, theme } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { loginRequest } from '../../api/auth'
import { ApiError } from '../../api/http'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setSession } from '../../store/slices/authSlice'
import { setSysLanguage, type SysLanguage } from '../../store/slices/sysSetting'
import NexusLogo from './NexusLogo'
import './index.css'

const REMEMBER_KEY = 'login.rememberUsername'

type LoginForm = {
  username: string
  password: string
  remember: boolean
}

const copy = {
  'zh-CN': {
    title: '登录',
    hint: '使用系统账号进入工作台',
    username: '请输入用户名',
    password: '请输入密码',
    remember: '记住我',
    forgot: '忘记密码?',
    submit: '登录',
    forgotMsg: '请联系系统管理员重置密码',
  },
  'en-US': {
    title: 'Sign in',
    hint: 'Use your system account to enter the workspace',
    username: 'Enter username',
    password: 'Enter password',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    submit: 'Sign in',
    forgotMsg: 'Please contact an administrator to reset your password',
  },
} as const

function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [form] = Form.useForm<LoginForm>()
  const language = useAppSelector((state) => state.sysSetting.sysLanguage)
  const t = copy[language]
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      form.setFieldsValue({ username: saved, remember: true })
    }
  }, [form])

  async function handleFinish(values: LoginForm) {
    setError(null)
    setSubmitting(true)
    try {
      const res = await loginRequest(values.username.trim(), values.password)
      if (values.remember) {
        localStorage.setItem(REMEMBER_KEY, values.username.trim())
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }
      dispatch(setSession(res.data))
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(language === 'zh-CN' ? '用户名或密码错误' : 'Invalid username or password')
      } else if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(
          language === 'zh-CN'
            ? '无法连接服务器，请确认后台已启动'
            : 'Cannot reach the server. Please confirm the backend is running.',
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleLanguage(next: SysLanguage) {
    dispatch(setSysLanguage(next))
  }

  return (
    <ConfigProvider
      theme={{
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
      }}
    >
      <section className="login-page">
        <div className="login-bg" />
        <header className="login-chrome">
          <div className="login-chrome-brand">
            <NexusLogo className="login-logo-sm" />
            <span>NEXUS</span>
          </div>
          <p className="login-chrome-tag">PEOPLE · IDEAS · A BRIGHTER TOMORROW</p>
        </header>

        <div className="login-layout">
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

          <div className="login-card">
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
                name="username"
                rules={[{ required: true, message: t.username }]}
              >
                <Input
                  size="large"
                  prefix={<UserOutlined />}
                  placeholder={t.username}
                  autoComplete="username"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: t.password }]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder={t.password}
                  autoComplete="current-password"
                  iconRender={(visible) =>
                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>
              <div className="login-row">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>{t.remember}</Checkbox>
                </Form.Item>
                <Button
                  type="link"
                  className="login-forgot"
                  onClick={() => setError(t.forgotMsg)}
                >
                  {t.forgot}
                </Button>
              </div>
              {error ? (
                <Alert className="login-error" type="error" message={error} showIcon />
              ) : null}
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

export default Login
