import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import { Button, Form, Input } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { resetPasswordRequest, sendCodeRequest } from '../../api/auth'
import { useApiNotify } from '../../api/notify'
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

function Forgot() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form] = Form.useForm<ForgotForm>()
  const notify = useApiNotify()
  const [submitting, setSubmitting] = useState(false)
  const [sending, setSending] = useState(false)
  const countdown = useCodeCountdown()

  async function handleSendCode() {
    try {
      const values = await form.validateFields(['email'])
      setSending(true)
      await sendCodeRequest(values.email.trim(), 'reset')
      countdown.start()
      notify.success(t('auth.forgot.sent'))
    } catch (err) {
      notify.fail(err, t('common.offline'))
    } finally {
      setSending(false)
    }
  }

  async function handleFinish(values: ForgotForm) {
    setSubmitting(true)
    try {
      await resetPasswordRequest({
        email: values.email.trim(),
        code: values.code.trim(),
        password: values.password,
      })
      notify.success(t('auth.forgot.done'))
      window.setTimeout(() => navigate('/login', { replace: true }), 1200)
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
      <h2>{t('auth.forgot.title')}</h2>
      <p className="login-hint">{t('auth.forgot.hint')}</p>
      <Form form={form} className="login-form" layout="vertical" requiredMark={false} onFinish={handleFinish}>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: t('auth.forgot.email') },
            { type: 'email', message: t('auth.forgot.email') },
          ]}
        >
          <Input size="large" prefix={<MailOutlined />} placeholder={t('auth.forgot.email')} autoComplete="email" />
        </Form.Item>
        <Form.Item name="code" rules={[{ required: true, message: t('auth.forgot.code') }]}>
          <Input
            size="large"
            prefix={<SafetyOutlined />}
            placeholder={t('auth.forgot.code')}
            suffix={
              <Button
                type="link"
                className="login-code-btn"
                disabled={countdown.running || sending}
                loading={sending}
                onClick={handleSendCode}
              >
                {countdown.running ? `${countdown.left}s` : t('auth.forgot.getCode')}
              </Button>
            }
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: t('auth.forgot.password') },
            {
              pattern: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
              message: t('auth.forgot.password'),
            },
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder={t('auth.forgot.password')}
            autoComplete="new-password"
            iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item
          name="confirm"
          dependencies={['password']}
          rules={[
            { required: true, message: t('auth.forgot.confirm') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error(t('auth.forgot.confirm')))
              },
            }),
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder={t('auth.forgot.confirm')}
            autoComplete="new-password"
            iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
          />
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
            {t('auth.forgot.submit')} <ArrowRightOutlined />
          </Button>
        </Form.Item>
      </Form>
      <button type="button" className="login-back" onClick={() => navigate('/login')}>
        <ArrowLeftOutlined /> {t('auth.forgot.back')}
      </button>
    </AuthLayout>
  )
}

export default Forgot
