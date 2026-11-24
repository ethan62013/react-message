import { apiFetch } from './http'

export type ForumPost = {
  id: number
  title: string
  cover?: string
  excerpt?: string
  author_id: number
  author_name: string
  like_count: number
  comment_count: number
  created_at: string
}

export type ForumComment = {
  id: number
  post_id: number
  author_id: number
  author_name: string
  content: string
  created_at: string
}

export type ForumPostDetail = ForumPost & {
  content: string
  liked: boolean
  comments: ForumComment[]
}

export type ForumPage = {
  list: ForumPost[]
  total: number
  page: number
  page_size: number
}

export type LikeResult = {
  liked: boolean
  like_count: number
}

export function listPostsRequest(page: number, pageSize = 20) {
  const q = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  })
  return apiFetch<ForumPage>(`/forum/posts?${q.toString()}`)
}

export function uploadForumImage(file: File) {
  const body = new FormData()
  body.append('file', file)
  return apiFetch<{ url: string }>('/forum/images', { method: 'POST', body })
}

export function createPostRequest(title: string, content: string, cover = '') {
  return apiFetch<ForumPostDetail>('/forum/posts', {
    method: 'POST',
    body: JSON.stringify({ title, content, cover }),
  })
}

export function getPostRequest(id: number) {
  return apiFetch<ForumPostDetail>(`/forum/posts/${id}`)
}

export function deletePostRequest(id: number) {
  return apiFetch(`/forum/posts/${id}`, { method: 'DELETE' })
}

export function commentPostRequest(id: number, content: string) {
  return apiFetch<ForumComment>(`/forum/posts/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export function likePostRequest(id: number) {
  return apiFetch<LikeResult>(`/forum/posts/${id}/like`, { method: 'POST' })
}
