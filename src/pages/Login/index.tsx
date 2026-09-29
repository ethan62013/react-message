import {
  ArrowRightOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import { Button, Checkbox, Form, Input } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { captchaRequest, loginRequest } from '../../api/auth'
import { useApiNotify } from '../../api/notify'
import { useAppDispatch } from '../../store/hooks'
import { setSession } from '../../store/slices/authSlice'
import AuthLayout from './AuthLayout'
import NexusLogo from './NexusLogo'

const REMEMBER_KEY = 'login.rememberEmail'

type LoginForm = {
  email: string
  password: string
  captcha: string
  remember: boolean
}

function Login() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [form] = Form.useForm<LoginForm>()
  const notify = useApiNotify()
  const [submitting, setSubmitting] = useState(false)
  const [captchaId, setCaptchaId] = useState('')
  const [captchaImage, setCaptchaImage] = useState('')
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const captchaSeq = useRef(0)

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      form.setFieldsValue({ email: saved, remember: true })
    }
  }, [form])

  async function loadCaptcha() {
    const seq = ++captchaSeq.current
    setCaptchaLoading(true)
    try {
      const res = await captchaRequest()
      if (seq !== captchaSeq.current) {
        return
      }
      if (!res.data?.id || !res.data.image) {
        notify.fail(null, t('common.offline'))
        return
      }
      setCaptchaId(res.data.id)
      setCaptchaImage(res.data.image)
    } catch (err) {
      if (seq === captchaSeq.current) {
        notify.fail(err, t('common.offline'))
      }
    } finally {
      if (seq === captchaSeq.current) {
        setCaptchaLoading(false)
      }
    }
  }

  useEffect(() => {
    void loadCaptcha()
    // 只在进入登录页时拉一次。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function resetCaptchaField() {
    form.setFieldValue('captcha', '')
    void loadCaptcha()
  }

  async function handleFinish(values: LoginForm) {
    if (!captchaId) {
      void loadCaptcha()
      return
    }
    setSubmitting(true)
    try {
      const res = await loginRequest(
        values.email.trim(),
        values.password,
        captchaId,
        values.captcha.trim(),
      )
      if (values.remember) {
        localStorage.setItem(REMEMBER_KEY, values.email.trim())
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }
      if (!res.data) {
        notify.fail(null, t('common.offline'))
        resetCaptchaField()
        return
      }
      dispatch(setSession(res.data))
      navigate('/', { replace: true })
    } catch (err) {
      notify.fail(err, t('common.offline'))
      if (!(err && typeof err === 'object' && 'errorFields' in err)) {
        resetCaptchaField()
      }
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
        <div className="login-captcha-row">
          <Form.Item
            className="login-captcha-field"
            name="captcha"
            rules={[{ required: true, message: t('auth.login.captcha') }]}
          >
            <Input
              size="large"
              prefix={<SafetyOutlined />}
              placeholder={t('auth.login.captcha')}
              autoComplete="off"
              inputMode="numeric"
              maxLength={4}
            />
          </Form.Item>
          <button
            type="button"
            className="login-captcha-btn"
            title={t('auth.login.captchaRefresh')}
            aria-label={t('auth.login.captchaRefresh')}
            disabled={captchaLoading}
            onClick={() => void loadCaptcha()}
          >
            {captchaImage ? <img src={captchaImage} alt="" /> : null}
          </button>
        </div>
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
            disabled={!captchaId}
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
