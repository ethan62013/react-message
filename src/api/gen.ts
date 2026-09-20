import { apiFetch } from './http'

export type WordType = 'copy' | 'mail' | 'summary'
export type ImageStyle = 'real' | 'oil' | 'illust'
export type ImageRatio = '16:9' | '1:1' | '9:16'

export function generateWordRequest(body: {
  prompt: string
  type: WordType
  lang: string
}) {
  return apiFetch<{ text: string; type: WordType }>('/gen/word', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function generateImageRequest(body: {
  prompt: string
  style: ImageStyle
  ratio: ImageRatio
}) {
  return apiFetch<{ urls: string[]; style: ImageStyle; ratio: ImageRatio }>('/gen/image', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
