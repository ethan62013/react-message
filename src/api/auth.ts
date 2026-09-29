import { apiFetch } from './http'

export type SysUser = {
  id: number
  username: string
  nickname: string
  email: string
  org?: string
  status: number
  created_at: string
  created_by: number
}

export type LoginData = {
  token: string
  user: SysUser
}

export type CaptchaData = {
  id: string
  image: string
}

export function captchaRequest() {
  return apiFetch<CaptchaData>('/auth/captcha')
}

export function loginRequest(email: string, password: string, captchaId: string, captchaCode: string) {
  return apiFetch<LoginData>('/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      captcha_id: captchaId,
      captcha_code: captchaCode,
    }),
  })
}

export function sendCodeRequest(email: string, scene: 'register' | 'reset') {
  return apiFetch('/auth/code', {
    method: 'POST',
    body: JSON.stringify({ email, scene }),
  })
}

export function registerRequest(body: {
  email: string
  code: string
  nickname: string
  org?: string
  password: string
}) {
  return apiFetch<LoginData>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function resetPasswordRequest(body: {
  email: string
  code: string
  password: string
}) {
  return apiFetch('/auth/reset', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
