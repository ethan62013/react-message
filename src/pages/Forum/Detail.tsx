import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'
import {
  commentPostRequest,
  deletePostRequest,
  getPostRequest,
  likePostRequest,
  type ForumComment,
  type ForumPostDetail,
} from '../../api/forum'
import { useApiNotify } from '../../api/notify'
import { useAppSelector } from '../../store/hooks'
import { formatWhen } from './format'
import './forum.css'

function ForumDetail() {
  const { t, i18n } = useTranslation()
  const notify = useApiNotify()
  const navigate = useNavigate()
  const params = useParams()
  const id = Number(params.id)
  const isAdmin = useAppSelector((state) => state.auth.user?.is_admin)
  const [post, setPost] = useState<ForumPostDetail | null>(null)
  const [draft, setDraft] = useState('')
  const [sheet, setSheet] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(id) || id < 1) return
    let cancel = false
    getPostRequest(id)
      .then((res) => {
        if (!cancel) setPost(res.data ?? null)
      })
      .catch((err: unknown) => {
        if (!cancel) notify.fail(err, t('common.offline'))
      })
    return () => {
      cancel = true
    }
  }, [id, notify, t])

  async function toggleLike() {
    if (!post || busy) return
    setBusy(true)
    try {
      const res = await likePostRequest(post.id)
      if (!res.data) return
      setPost({ ...post, liked: res.data.liked, like_count: res.data.like_count })
    } catch (err) {
      notify.fail(err, t('common.offline'))
    } finally {
      setBusy(false)
    }
  }

  async function sendComment() {
    if (!post) return
    const content = draft.trim()
    if (!content) return
    setBusy(true)
    try {
      const res = await commentPostRequest(post.id, content)
      const comment = res.data
      setDraft('')
      setPost({
        ...post,
        comment_count: post.comment_count + 1,
        comments: comment ? [...post.comments, comment] : post.comments,
      })
    } catch (err) {
      notify.fail(err, t('common.offline'))
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!post) return
    setBusy(true)
    try {
      await deletePostRequest(post.id)
      notify.success(t('workspace.forumDeleted'))
      navigate('/forum', { replace: true })
    } catch (err) {
      notify.fail(err, t('common.offline'))
      setBusy(false)
      setSheet(false)
    }
  }

  if (!post) {
    return (
      <div className="ios-app">
        <header className="ios-nav">
          <Link className="ios-nav-action" to="/forum">{t('workspace.forumBack')}</Link>
        </header>
        <div className="ios-empty">{t('workspace.forumLoading')}</div>
      </div>
    )
  }

  return (
    <div className="ios-app">
      <header className="ios-nav">
        <Link className="ios-nav-action" to="/forum">{t('workspace.forumBack')}</Link>
      </header>
      <article className="ios-card ios-article">
        {post.cover ? <img className="ios-cover" src={post.cover} alt="" /> : null}
        <div className="ios-article-body">
        <h2>{post.title}</h2>
        <p className="ios-byline">
          <span>{post.author_name || t('workspace.forumAnonymous')}</span>
          <span>{formatWhen(post.created_at, i18n.language)}</span>
        </p>
        <div className="ios-prose" dangerouslySetInnerHTML={{ __html: post.content }} />
        <div className="ios-actions">
          <button type="button" className={post.liked ? 'ios-like is-on' : 'ios-like'} disabled={busy} onClick={() => void toggleLike()}>
            <span aria-hidden>{post.liked ? '♥' : '♡'}</span>
            {t('workspace.forumLike', { count: post.like_count })}
          </button>
          {isAdmin ? (
            <button type="button" className="ios-text-danger" onClick={() => setSheet(true)}>
              {t('workspace.forumDelete')}
            </button>
          ) : null}
        </div>
        </div>
      </article>
      <section className="ios-section">
        <h3>{t('workspace.forumComments', { count: post.comment_count })}</h3>
        {post.comments.length === 0 ? (
          <div className="ios-empty ios-empty-inline">{t('workspace.forumNoComments')}</div>
        ) : (
          <div className="ios-group">
            {post.comments.map((comment) => (
              <CommentRow key={comment.id} comment={comment} language={i18n.language} />
            ))}
          </div>
        )}
        <form
          className="ios-composer"
          onSubmit={(event) => {
            event.preventDefault()
            void sendComment()
          }}
        >
          <input
            value={draft}
            maxLength={1000}
            placeholder={t('workspace.forumCommentPlaceholder')}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit" disabled={busy || !draft.trim()}>
            {t('workspace.forumSend')}
          </button>
        </form>
      </section>
      {sheet ? (
        <div className="ios-sheet-mask" onClick={() => setSheet(false)}>
          <div className="ios-sheet" onClick={(event) => event.stopPropagation()}>
            <p>{t('workspace.forumDeleteConfirm')}</p>
            <button type="button" className="is-danger" disabled={busy} onClick={() => void remove()}>
              {t('workspace.forumDelete')}
            </button>
            <button type="button" onClick={() => setSheet(false)}>
              {t('workspace.forumCancel')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CommentRow({ comment, language }: { comment: ForumComment; language: string }) {
  return (
    <div className="ios-comment">
      <div className="ios-comment-top">
        <strong>{comment.author_name}</strong>
        <span>{formatWhen(comment.created_at, language)}</span>
      </div>
      <p>{comment.content}</p>
    </div>
  )
}

export default ForumDetail
