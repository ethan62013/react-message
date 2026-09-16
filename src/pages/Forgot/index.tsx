import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import { Alert, Button, Form, Input } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { resetPasswordRequest, sendCodeRequest } from '../../api/auth'
import { ApiError } from '../../api/http'
import { useAppSelector } from '../../store/hooks'
import AuthLayout from '../Login/AuthLayout'
import NexusLogo from '../Login/NexusLogo'
import { useCodeCountdown } from '../Login/useCodeCountdown'
import '../Login/index.css'

type ForgotForm = {
  email: string
  code: string
  password: string
  confirm: string
}

const copy = {
  'zh-CN': {
    title: '忘记密码',
    hint: '请输入注册邮箱，验证通过后设置新密码',
    email: '请输入邮箱地址',
    code: '请输入验证码',
    getCode: '获取验证码',
    password: '设置新密码（8位以上，包含字母和数字）',
    confirm: '确认新密码',
    submit: '重置密码',
    back: '返回登录',
    sent: '验证码已发送，请查收邮箱',
    done: '密码已重置，请使用新密码登录',
    offline: '无法连接服务器，请确认后台已启动',
  },
  'en-US': {
    title: 'Forgot password',
    hint: 'Enter your email, then set a new password after verification',
    email: 'Email address',
    code: 'Verification code',
    getCode: 'Get code',
    password: 'New password (8+ chars, letters and digits)',
    confirm: 'Confirm new password',
    submit: 'Reset password',
    back: 'Back to sign in',
    sent: 'Code sent. Please check your inbox.',
    done: 'Password updated. Please sign in.',
    offline: 'Cannot reach the server.',
  },
} as const

function Forgot() {
  const navigate = useNavigate()
  const [form] = Form.useForm<ForgotForm>()
  const language = useAppSelector((state) => state.sysSetting.sysLanguage)
  const t = copy[language]
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sending, setSending] = useState(false)
  const countdown = useCodeCountdown()

  async function handleSendCode() {
    setError(null)
    setInfo(null)
    try {
      const values = await form.validateFields(['email'])
      setSending(true)
      await sendCodeRequest(values.email.trim(), 'reset')
      countdown.start()
      setInfo(t.sent)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else if (err && typeof err === 'object' && 'errorFields' in err) {
        return
      } else {
        setError(t.offline)
      }
    } finally {
      setSending(false)
    }
  }

  async function handleFinish(values: ForgotForm) {
    setError(null)
    setInfo(null)
    setSubmitting(true)
    try {
      await resetPasswordRequest({
        email: values.email.trim(),
        code: values.code.trim(),
        password: values.password,
      })
      setInfo(t.done)
      window.setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(t.offline)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout centered>
      <div className="login-card-brand">
        <NexusLogo className="login-logo" />
        <span>NEXUS</span>
      </div>
      <h2>{t.title}</h2>
      <p className="login-hint">{t.hint}</p>
      <Form form={form} className="login-form" layout="vertical" requiredMark={false} onFinish={handleFinish}>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: t.email },
            { type: 'email', message: t.email },
          ]}
        >
          <Input size="large" prefix={<MailOutlined />} placeholder={t.email} autoComplete="email" />
        </Form.Item>
        <Form.Item name="code" rules={[{ required: true, message: t.code }]}>
          <Input
            size="large"
            prefix={<SafetyOutlined />}
            placeholder={t.code}
            suffix={
              <Button
                type="link"
                className="login-code-btn"
                disabled={countdown.running || sending}
                loading={sending}
                onClick={handleSendCode}
              >
                {countdown.running ? `${countdown.left}s` : t.getCode}
              </Button>
            }
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: t.password },
            {
              pattern: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
              message: t.password,
            },
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder={t.password}
            autoComplete="new-password"
            iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item
          name="confirm"
          dependencies={['password']}
          rules={[
            { required: true, message: t.confirm },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error(t.confirm))
              },
            }),
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder={t.confirm}
            autoComplete="new-password"
            iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        {error ? <Alert className="login-error" type="error" message={error} showIcon /> : null}
        {info ? <Alert className="login-error" type="success" message={info} showIcon /> : null}
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
      <button type="button" className="login-back" onClick={() => navigate('/login')}>
        <ArrowLeftOutlined /> {t.back}
      </button>
    </AuthLayout>
  )
}

export default Forgot
