import { apiFetch } from './http'

export type SysUser = {
  id: number
  username: string
  nickname: string
  status: number
  created_at: string
  created_by: number
}

export type LoginData = {
  token: string
  user: SysUser
}

type LoginResponse = {
  service: string
  status: string
  data: LoginData
}

export function loginRequest(username: string, password: string) {
  return apiFetch<LoginResponse>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}
