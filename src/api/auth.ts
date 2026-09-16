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

type OkResponse<T = unknown> = {
  service: string
  status: string
  data: T
}

export function loginRequest(email: string, password: string) {
  return apiFetch<OkResponse<LoginData>>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function sendCodeRequest(email: string, scene: 'register' | 'reset') {
  return apiFetch<{ service: string; status: string }>('/auth/code', {
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
  return apiFetch<OkResponse<LoginData>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function resetPasswordRequest(body: {
  email: string
  code: string
  password: string
}) {
  return apiFetch<{ service: string; status: string }>('/auth/reset', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
