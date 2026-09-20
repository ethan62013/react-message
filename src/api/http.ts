import i18n from '../i18n'
import { readStoredToken } from './session'

export const ApiCode = {
  OK: 200,
  BadRequest: 400,
  TokenExpired: 40101,
  Internal: 500,
} as const

export type ApiResponse<T = unknown> = {
  code: number
  msg: string
  data?: T
}

export class ApiError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

type ApiFetchInit = RequestInit

function readEnvelope(json: unknown): ApiResponse {
  if (!json || typeof json !== 'object') {
    return { code: ApiCode.Internal, msg: i18n.t('common.requestFailed') }
  }
  const rec = json as Record<string, unknown>
  const code = typeof rec.code === 'number' ? rec.code : ApiCode.Internal
  const msg = typeof rec.msg === 'string' && rec.msg ? rec.msg : i18n.t('common.requestFailed')
  return { code, msg, data: rec.data }
}

export async function apiFetch<T>(path: string, init: ApiFetchInit = {}): Promise<ApiResponse<T>> {
  const { headers, ...rest } = init
  const h = new Headers(headers)
  const token = readStoredToken()
  if (token) {
    h.set('Authorization', `Bearer ${token}`)
  }
  if (rest.body && !h.has('Content-Type')) {
    h.set('Content-Type', 'application/json')
  }

  const res = await fetch(`/api${path}`, { ...rest, headers: h })
  const json: unknown = await res.json().catch(() => ({}))
  const envelope = readEnvelope(json)
  if (envelope.code !== ApiCode.OK) {
    throw new ApiError(envelope.code, envelope.msg)
  }
  return envelope as ApiResponse<T>
}
