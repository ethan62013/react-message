import {
  ArrowRightOutlined,
  BankOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Button, Checkbox, Form, Input } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { registerRequest, sendCodeRequest } from '../../api/auth'
import { useApiNotify } from '../../api/notify'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setSession } from '../../store/slices/authSlice'
import AuthLayout from '../Login/AuthLayout'
import NexusLogo from '../Login/NexusLogo'
import { useCodeCountdown } from '../Login/useCodeCountdown'
import '../Login/index.css'

type RegisterForm = {
  nickname: string
  email: string
  org?: string
  password: string
  confirm: string
  code: string
  agree: boolean
}

const copy = {
  'zh-CN': {
    title: '注册',
    hint: '创建你的账号，开启高效协作',
    nickname: '请输入你的姓名',
    email: '请输入邮箱地址',
    org: '请输入所属组织（可选）',
    password: '设置登录密码（8位以上，包含字母和数字）',
    confirm: '确认密码',
    code: '请输入验证码',
    getCode: '获取验证码',
    agree: '我已阅读并同意《用户协议》和《隐私政策》',
    submit: '注册',
    hasAccount: '已有账号？',
    login: '立即登录',
    sent: '验证码已发送，请查收邮箱',
    offline: '无法连接服务器，请确认后台已启动',
  },
  'en-US': {
    title: 'Sign up',
    hint: 'Create your account and start collaborating',
    nickname: 'Your name',
    email: 'Email address',
    org: 'Organization (optional)',
    password: 'Password (8+ chars, letters and digits)',
    confirm: 'Confirm password',
    code: 'Verification code',
    getCode: 'Get code',
    agree: 'I agree to the Terms and Privacy Policy',
    submit: 'Sign up',
    hasAccount: 'Already have an account?',
    login: 'Sign in',
    sent: 'Code sent. Please check your inbox.',
    offline: 'Cannot reach the server.',
  },
} as const

function Register() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [form] = Form.useForm<RegisterForm>()
  const language = useAppSelector((state) => state.sysSetting.sysLanguage)
  const t = copy[language]
  const notify = useApiNotify()
  const [submitting, setSubmitting] = useState(false)
  const [sending, setSending] = useState(false)
  const countdown = useCodeCountdown()

  async function handleSendCode() {
    try {
      const email = await form.validateFields(['email'])
      setSending(true)
      await sendCodeRequest(email.email.trim(), 'register')
      countdown.start()
      notify.success(t.sent)
    } catch (err) {
      notify.fail(err, t.offline)
    } finally {
      setSending(false)
    }
  }

  async function handleFinish(values: RegisterForm) {
    setSubmitting(true)
    try {
      const res = await registerRequest({
        nickname: values.nickname.trim(),
        email: values.email.trim(),
        org: values.org?.trim(),
        password: values.password,
        code: values.code.trim(),
      })
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
    <AuthLayout centered>
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
        onFinish={handleFinish}
      >
        <Form.Item name="nickname" rules={[{ required: true, message: t.nickname }]}>
          <Input size="large" prefix={<UserOutlined />} placeholder={t.nickname} />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: t.email },
            { type: 'email', message: t.email },
          ]}
        >
          <Input size="large" prefix={<MailOutlined />} placeholder={t.email} autoComplete="email" />
        </Form.Item>
        <Form.Item name="org">
          <Input size="large" prefix={<BankOutlined />} placeholder={t.org} />
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
          name="agree"
          valuePropName="checked"
          rules={[
            {
              validator: (_, v) =>
                v ? Promise.resolve() : Promise.reject(new Error(t.agree)),
            },
          ]}
        >
          <Checkbox>
            <span className="login-agree">{t.agree}</span>
          </Checkbox>
        </Form.Item>
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
        {t.hasAccount}
        <button type="button" onClick={() => navigate('/login')}>
          {t.login}
        </button>
      </p>
    </AuthLayout>
  )
}

export default Register
