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
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { registerRequest, sendCodeRequest } from '../../api/auth'
import { useApiNotify } from '../../api/notify'
import { useAppDispatch } from '../../store/hooks'
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

function Register() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [form] = Form.useForm<RegisterForm>()
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
      notify.success(t('auth.register.sent'))
    } catch (err) {
      notify.fail(err, t('common.offline'))
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
    <AuthLayout centered>
      <div className="login-card-brand">
        <NexusLogo className="login-logo" />
        <span>NEXUS</span>
      </div>
      <h2>{t('auth.register.title')}</h2>
      <p className="login-hint">{t('auth.register.hint')}</p>
      <Form
        form={form}
        className="login-form"
        layout="vertical"
        requiredMark={false}
        onFinish={handleFinish}
      >
        <Form.Item name="nickname" rules={[{ required: true, message: t('auth.register.nickname') }]}>
          <Input size="large" prefix={<UserOutlined />} placeholder={t('auth.register.nickname')} />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: t('auth.register.email') },
            { type: 'email', message: t('auth.register.email') },
          ]}
        >
          <Input size="large" prefix={<MailOutlined />} placeholder={t('auth.register.email')} autoComplete="email" />
        </Form.Item>
        <Form.Item name="org">
          <Input size="large" prefix={<BankOutlined />} placeholder={t('auth.register.org')} />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: t('auth.register.password') },
            {
              pattern: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
              message: t('auth.register.password'),
            },
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder={t('auth.register.password')}
            autoComplete="new-password"
            iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item
          name="confirm"
          dependencies={['password']}
          rules={[
            { required: true, message: t('auth.register.confirm') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error(t('auth.register.confirm')))
              },
            }),
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder={t('auth.register.confirm')}
            autoComplete="new-password"
            iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item name="code" rules={[{ required: true, message: t('auth.register.code') }]}>
          <Input
            size="large"
            prefix={<SafetyOutlined />}
            placeholder={t('auth.register.code')}
            suffix={
              <Button
                type="link"
                className="login-code-btn"
                disabled={countdown.running || sending}
                loading={sending}
                onClick={handleSendCode}
              >
                {countdown.running ? `${countdown.left}s` : t('auth.register.getCode')}
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
                v ? Promise.resolve() : Promise.reject(new Error(t('auth.register.agree'))),
            },
          ]}
        >
          <Checkbox>
            <span className="login-agree">{t('auth.register.agree')}</span>
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
            {t('auth.register.submit')} <ArrowRightOutlined />
          </Button>
        </Form.Item>
      </Form>
      <p className="login-switch">
        {t('auth.register.hasAccount')}
        <button type="button" onClick={() => navigate('/login')}>
          {t('auth.register.login')}
        </button>
      </p>
    </AuthLayout>
  )
}

export default Register
