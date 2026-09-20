import { App } from 'antd'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import apiCopy from '../i18n/locales/zh-CN/api'
import { useAppDispatch } from '../store/hooks'
import { clearSession } from '../store/slices/authSlice'
import { ApiCode, ApiError } from './http'

type ApiErrorKey = keyof typeof apiCopy.errors

export function useApiNotify() {
  const { message, modal } = App.useApp()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return useMemo(() => {
    function label(msg: string) {
      if (Object.hasOwn(apiCopy.errors, msg)) {
        return t(`api.errors.${msg as ApiErrorKey}`)
      }
      return msg
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
            title: t('api.hint'),
            content: text,
            onOk: () => navigate('/login', { replace: true }),
          })
          return
        }
        if (err.code === ApiCode.Internal) {
          modal.error({ title: t('api.error'), content: text })
          return
        }
        message.error(text)
      },
    }
  }, [dispatch, message, modal, navigate, t])
}
