export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type ApiFetchInit = RequestInit & {
  token?: string | null
}

export async function apiFetch<T>(path: string, init: ApiFetchInit = {}): Promise<T> {
  const { token, headers, ...rest } = init
  const h = new Headers(headers)
  if (token) {
    h.set('Authorization', `Bearer ${token}`)
  }
  if (rest.body && !h.has('Content-Type')) {
    h.set('Content-Type', 'application/json')
  }

  const res = await fetch(`/api${path}`, { ...rest, headers: h })
  const json: unknown = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      json && typeof json === 'object' && 'error' in json && typeof json.error === 'string'
        ? json.error
        : `请求失败 (${res.status})`
    throw new ApiError(res.status, message)
  }
  return json as T
}
