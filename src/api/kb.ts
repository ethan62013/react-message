import { apiFetch } from './http'

export type KbSpace = {
  id: number
  name: string
  created_at: string
}

export type KbDocMeta = {
  id: number
  space_id: number
  title: string
  updated_at: string
}

export type KbDoc = KbDocMeta & {
  body: string
  object_key?: string
}

export type KbDocPage = {
  list: KbDocMeta[]
  total: number
  page: number
  page_size: number
}

export type KbCitation = {
  doc_id: number
  title: string
  seq: number
  content: string
  score: number
}

export type KbAsk = {
  hit: boolean
  answer: string
  citations: KbCitation[]
}

export function listSpaces() {
  return apiFetch<KbSpace[]>('/kb/spaces')
}

export function createSpace(name: string) {
  return apiFetch<KbSpace>('/kb/spaces', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function listDocs(spaceId: number, page = 1, pageSize = 10) {
  const q = new URLSearchParams({
    spaceId: String(spaceId),
    page: String(page),
    page_size: String(pageSize),
  })
  return apiFetch<KbDocPage>(`/kb/docs?${q.toString()}`)
}

export function getDoc(id: number) {
  return apiFetch<KbDoc>(`/kb/docs/${id}`)
}

export function createDoc(spaceId: number, title: string, body: string) {
  return apiFetch<KbDoc>('/kb/docs', {
    method: 'POST',
    body: JSON.stringify({ space_id: spaceId, title, body }),
  })
}

export function updateDoc(id: number, title: string, body: string) {
  return apiFetch<KbDoc>(`/kb/docs/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, body }),
  })
}

export function deleteDoc(id: number) {
  return apiFetch(`/kb/docs/${id}`, { method: 'DELETE' })
}

export function docFileURL(id: number) {
  return apiFetch<{ url: string }>(`/kb/docs/${id}/file`)
}

export function uploadDoc(spaceId: number, file: File) {
  const body = new FormData()
  body.set('space_id', String(spaceId))
  body.set('file', file)
  return apiFetch<KbDoc>('/kb/upload', { method: 'POST', body })
}

export function askKb(spaceId: number, question: string) {
  return apiFetch<KbAsk>('/kb/ask', {
    method: 'POST',
    body: JSON.stringify({ space_id: spaceId, question }),
  })
}
