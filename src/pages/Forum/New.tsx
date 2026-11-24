import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { createPostRequest, uploadForumImage } from '../../api/forum'
import { useApiNotify } from '../../api/notify'
import ForumEditor, { type ForumEditorHandle } from './Editor'
import './forum.css'

function ForumNew() {
  const { t } = useTranslation()
  const notify = useApiNotify()
  const navigate = useNavigate()
  const editorRef = useRef<ForumEditorHandle>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [cover, setCover] = useState('')
  const [coverBusy, setCoverBusy] = useState(false)
  const [saving, setSaving] = useState(false)

  async function pickCover(file: File) {
    setCoverBusy(true)
    try {
      const res = await uploadForumImage(file)
      if (res.data?.url) setCover(res.data.url)
    } catch (err) {
      notify.fail(err, t('common.offline'))
    } finally {
      setCoverBusy(false)
    }
  }

  async function publish() {
    const content = editorRef.current?.getHTML() ?? ''
    setSaving(true)
    try {
      const res = await createPostRequest(title.trim(), content, cover)
      const id = res.data?.id
      notify.success(t('workspace.forumPublished'))
      navigate(id ? `/forum/${id}` : '/forum', { replace: true })
    } catch (err) {
      notify.fail(err, t('common.offline'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="ios-app ios-write">
      <header className="ios-write-bar">
        <Link className="ios-write-back" to="/forum">
          <span aria-hidden>‹</span>
          {t('workspace.forumBack')}
        </Link>
        <button type="button" className="ios-compose" disabled={saving || coverBusy} onClick={() => void publish()}>
          {saving ? t('workspace.forumPublishing') : t('workspace.forumPublish')}
        </button>
      </header>
      <section className="ios-write-sheet">
        <div className="ios-cover-slot">
          <button type="button" className="ios-cover-pick" onClick={() => coverRef.current?.click()}>
            {cover ? <img src={cover} alt="" /> : <span>{coverBusy ? t('workspace.forumCoverBusy') : t('workspace.forumCover')}</span>}
          </button>
          {cover ? (
            <button type="button" className="ios-cover-clear" aria-label={t('workspace.forumCover')} onClick={() => setCover('')}>
              ×
            </button>
          ) : null}
          <input
            ref={coverRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) void pickCover(file)
            }}
          />
        </div>
        <input
          className="ios-write-title"
          value={title}
          maxLength={120}
          placeholder={t('workspace.forumTitlePlaceholder')}
          onChange={(event) => setTitle(event.target.value)}
        />
        <ForumEditor
          ref={editorRef}
          placeholder={t('workspace.forumBodyPlaceholder')}
          linkPrompt={t('workspace.forumLinkPrompt')}
          imageLabel={t('workspace.forumImage')}
        />
      </section>
    </div>
  )
}

export default ForumNew
