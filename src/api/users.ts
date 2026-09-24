import { apiFetch } from './http'
import type { SysUser } from './auth'

export type UserPage = {
  list: SysUser[]
  total: number
  page: number
  page_size: number
}

export type UserWriteBody = {
  username: string
  nickname: string
  email: string
  org?: string
  password?: string
}

export function listUsersRequest(page: number, pageSize: number) {
  const q = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  })
  return apiFetch<UserPage>(`/users?${q.toString()}`)
}

export function createUserRequest(body: UserWriteBody) {
  return apiFetch<SysUser>('/users/add', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateUserRequest(id: number, body: UserWriteBody) {
  return apiFetch<SysUser>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function deleteUserRequest(id: number) {
  return apiFetch(`/users/${id}`, { method: 'DELETE' })
}

export function setUserStatusRequest(id: number, status: 0 | 1) {
  return apiFetch<SysUser>(`/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}
