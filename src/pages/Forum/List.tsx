import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { listPostsRequest, type ForumPost } from '../../api/forum'
import { useApiNotify } from '../../api/notify'
import { formatWhen } from './format'
import './forum.css'

function ForumList() {
  const { t, i18n } = useTranslation()
  const notify = useApiNotify()
  const [list, setList] = useState<ForumPost[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false
    setLoading(true)
    listPostsRequest(page)
      .then((res) => {
        if (cancel) return
        const next = res.data?.list ?? []
        setList((prev) => (page === 1 ? next : [...prev, ...next]))
        setTotal(res.data?.total ?? 0)
      })
      .catch((err: unknown) => {
        if (!cancel) notify.fail(err, t('common.offline'))
      })
      .finally(() => {
        if (!cancel) setLoading(false)
      })
    return () => {
      cancel = true
    }
  }, [page, notify, t])

  const hasMore = list.length < total

  return (
    <div className="ios-app">
      <header className="ios-nav">
        <h1>{t('workspace.forumTitle')}</h1>
        <span />
        <Link className="ios-compose" to="/forum/new">
          {t('workspace.forumCompose')}
        </Link>
      </header>
      {list.length === 0 ? (
        <div className="ios-empty">{loading ? t('workspace.forumLoading') : t('workspace.forumEmpty')}</div>
      ) : (
        <div className="ios-group">
          {list.map((post) => (
            <Link key={post.id} className="ios-cell" to={`/forum/${post.id}`}>
              <span className="ios-avatar" aria-hidden>
                {(post.author_name || t('workspace.forumAnonymous')).slice(0, 1)}
              </span>
              <div className="ios-cell-body">
                <div className="ios-cell-title">{post.title}</div>
                {post.excerpt ? <div className="ios-cell-sub">{post.excerpt}</div> : null}
                <div className="ios-cell-meta">
                  <span>{post.author_name || t('workspace.forumAnonymous')}</span>
                  <span>{formatWhen(post.created_at, i18n.language)}</span>
                  <span>{t('workspace.forumStats', { likes: post.like_count, comments: post.comment_count })}</span>
                </div>
              </div>
              {post.cover ? <img className="ios-thumb" src={post.cover} alt="" /> : null}
            </Link>
          ))}
        </div>
      )}
      {hasMore ? (
        <button type="button" className="ios-more" disabled={loading} onClick={() => setPage((n) => n + 1)}>
          {loading ? t('workspace.forumLoading') : t('workspace.forumMore')}
        </button>
      ) : null}
    </div>
  )
}

export default ForumList
