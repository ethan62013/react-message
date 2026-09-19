import { App } from 'antd'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearSession } from '../store/slices/authSlice'
import { ApiCode, ApiError } from './http'

const textByMsg = {
  'zh-CN': {
    'invalid email': '邮箱格式不正确',
    'invalid or expired code': '验证码错误或已过期',
    'password must be at least 8 characters and include letters and digits':
      '密码至少 8 位，且包含字母和数字',
    'email already registered': '该邮箱已注册',
    'email not registered': '该邮箱尚未注册',
    'please wait before requesting another code': '发送太频繁，请稍后再试',
    'user not found': '账号不存在',
    'invalid email or password': '邮箱或密码错误',
    'token expired': '登录已过期，请重新登录',
    'invalid id': '无效的编号',
    'email and password required': '请输入邮箱和密码',
    'nickname required': '请输入姓名',
    'prompt required': '请输入提示词',
    'invalid style': '无效的风格',
    'invalid ratio': '无效的比例',
  },
  'en-US': {
    'invalid email': 'Invalid email address',
    'invalid or expired code': 'Invalid or expired code',
    'password must be at least 8 characters and include letters and digits':
      'Password must be 8+ characters with letters and digits',
    'email already registered': 'This email is already registered',
    'email not registered': 'This email is not registered',
    'please wait before requesting another code': 'Please wait before requesting another code',
    'user not found': 'Account not found',
    'invalid email or password': 'Invalid email or password',
    'token expired': 'Session expired. Please sign in again.',
    'invalid id': 'Invalid id',
    'email and password required': 'Email and password required',
    'nickname required': 'Nickname required',
    'prompt required': 'Please enter a prompt',
    'invalid style': 'Invalid style',
    'invalid ratio': 'Invalid ratio',
  },
} as const

const titles = {
  'zh-CN': { hint: '提示', error: '出错了' },
  'en-US': { hint: 'Notice', error: 'Something went wrong' },
} as const

export function useApiNotify() {
  const { message, modal } = App.useApp()
  const language = useAppSelector((state) => state.sysSetting.sysLanguage)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return useMemo(() => {
    function label(msg: string) {
      const table = textByMsg[language] as Record<string, string>
      return table[msg] ?? msg
    }

    return {
      success(text: string) {
        message.success(text)
      },
      fail(err: unknown, offline: string) {
        if (err && typeof err === 'object' && 'errorFields' in err) {
          return
        }
        if (!(err instanceof ApiError)) {
          message.error(offline)
          return
        }
        const text = label(err.message)
        if (err.code === ApiCode.TokenExpired) {
          dispatch(clearSession())
          modal.warning({
            title: titles[language].hint,
            content: text,
            onOk: () => navigate('/login', { replace: true }),
          })
          return
        }
        if (err.code === ApiCode.Internal) {
          modal.error({ title: titles[language].error, content: text })
          return
        }
        message.error(text)
      },
    }
  }, [dispatch, language, message, modal, navigate])
}
