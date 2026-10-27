import { Pagination } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import {
  createDoc,
  createSpace,
  deleteDoc,
  docFileURL,
  getDoc,
  listDocs,
  listSpaces,
  updateDoc,
  uploadDoc,
  type KbDocMeta,
  type KbSpace,
} from '../../api/kb'
import { ApiCode, ApiError } from '../../api/http'
import { useApiNotify } from '../../api/notify'
import './kb.css'

function KbPage() {
  const { t, i18n } = useTranslation()
  const notify = useApiNotify()
  const [spaces, setSpaces] = useState<KbSpace[]>([])
  const [spaceId, setSpaceId] = useState(0)
  const [spaceName, setSpaceName] = useState('')
  const [docs, setDocs] = useState<KbDocMeta[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [docId, setDocId] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [hasFile, setHasFile] = useState(false)
  const [saving, setSaving] = useState(false)
  const [params, setParams] = useSearchParams()
  const requestedDoc = Number(params.get('doc') || 0)
  const [detail, setDetail] = useState(requestedDoc > 0)

  useEffect(() => {
    let cancelled = false
    listSpaces()
      .then((res) => {
        if (cancelled) return
        const list = res.data ?? []
        setSpaces(list)
        if (!requestedDoc && list[0]) setSpaceId(list[0].id)
      })
      .catch((err) => notify.fail(err, t('common.offline')))
    return () => {
      cancelled = true
    }
  }, [notify, t, requestedDoc])

  useEffect(() => {
    if (!requestedDoc) return
    let cancelled = false
    getDoc(requestedDoc)
      .then((res) => {
        if (cancelled) return
        const doc = res.data
        if (!doc) return
        setSpaceId(doc.space_id)
        setDocId(doc.id)
        setTitle(doc.title)
        setBody(doc.body)
        setHasFile(Boolean(doc.object_key))
        setDetail(true)
      })
      .catch((err) => notify.fail(err, t('common.offline')))
    return () => {
      cancelled = true
    }
  }, [requestedDoc, notify, t])

  useEffect(() => {
    if (!spaceId) {
      setDocs([])
      setTotal(0)
      return
    }
    let cancelled = false
    listDocs(spaceId, page, pageSize)
      .then((res) => {
        if (cancelled || !res.data) return
        setDocs(res.data.list ?? [])
        setTotal(res.data.total)
      })
      .catch((err) => notify.fail(err, t('common.offline')))
    return () => {
      cancelled = true
    }
  }, [spaceId, page, pageSize, notify, t])

  async function refreshDocs(nextSpaceId: number, nextPage = page) {
    const res = await listDocs(nextSpaceId, nextPage, pageSize)
    const data = res.data
    setDocs(data?.list ?? [])
    setTotal(data?.total ?? 0)
    if (data && data.page !== page) setPage(data.page)
  }

  async function handleCreateSpace() {
    const name = spaceName.trim()
    if (!name) {
      notify.fail(new ApiError(ApiCode.BadRequest, 'name required'), t('common.offline'))
      return
    }
    try {
      const res = await createSpace(name)
      const sp = res.data
      if (!sp) return
      setSpaces((prev) => [...prev, sp])
      setSpaceId(sp.id)
      setSpaceName('')
      setPage(1)
      showList()
    } catch (err) {
      notify.fail(err, t('common.offline'))
    }
  }

  async function openDoc(id: number) {
    try {
      const res = await getDoc(id)
      const doc = res.data
      if (!doc) return
      setDocId(doc.id)
      setTitle(doc.title)
      setBody(doc.body)
      setHasFile(Boolean(doc.object_key))
      setDetail(true)
    } catch (err) {
      notify.fail(err, t('common.offline'))
    }
  }

  function showList() {
    setDetail(false)
    setDocId(0)
    setTitle('')
    setBody('')
    setHasFile(false)
    if (params.get('doc')) setParams({}, { replace: true })
  }

  function handleNewDoc() {
    setDocId(0)
    setTitle('')
    setBody('')
    setHasFile(false)
    setDetail(true)
  }

  async function handleSave() {
    if (!spaceId) return
    setSaving(true)
    try {
      const res = docId
        ? await updateDoc(docId, title, body)
        : await createDoc(spaceId, title, body)
      const doc = res.data
      if (doc) {
        setDocId(doc.id)
        setTitle(doc.title)
        setHasFile(Boolean(doc.object_key))
      }
      setPage(1)
      await refreshDocs(spaceId, 1)
      notify.success(t('workspace.kbSaved'))
    } catch (err) {
      notify.fail(err, t('common.offline'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!docId) return
    if (!window.confirm(t('workspace.kbDeleteConfirm'))) return
    try {
      await deleteDoc(docId)
      showList()
      const nextPage = docs.length === 1 && page > 1 ? page - 1 : page
      setPage(nextPage)
      await refreshDocs(spaceId, nextPage)
      notify.success(t('workspace.kbDeleted'))
    } catch (err) {
      notify.fail(err, t('common.offline'))
    }
  }

  async function handleFile(file: File) {
    const lower = file.name.toLowerCase()
    const textFile = lower.endsWith('.md') || lower.endsWith('.txt')
    if (textFile) {
      if (file.size > 1024 * 1024) {
        notify.fail(new ApiError(ApiCode.BadRequest, 'body too large'), t('common.offline'))
        return
      }
      const text = await file.text()
      setBody(text)
      if (!title.trim()) {
        setTitle(file.name.replace(/\.(md|txt)$/i, ''))
      }
      setDetail(true)
      return
    }
    if (!spaceId) {
      notify.fail(new ApiError(ApiCode.BadRequest, 'space not found'), t('common.offline'))
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      notify.fail(new ApiError(ApiCode.BadRequest, 'file too large'), t('common.offline'))
      return
    }
    setSaving(true)
    try {
      const res = await uploadDoc(spaceId, file)
      const doc = res.data
      if (doc) {
        setDocId(doc.id)
        setTitle(doc.title)
        setBody(doc.body)
        setHasFile(Boolean(doc.object_key))
      }
      setPage(1)
      await refreshDocs(spaceId, 1)
      notify.success(t('workspace.kbSaved'))
    } catch (err) {
      notify.fail(err, t('common.offline'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDownload() {
    if (!docId) return
    try {
      const res = await docFileURL(docId)
      if (res.data?.url) window.open(res.data.url, '_blank', 'noopener')
    } catch (err) {
      notify.fail(err, t('common.offline'))
    }
  }

  function handleSpace(id: number) {
    setSpaceId(id)
    setPage(1)
    showList()
  }

  function formatUpdated(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString(i18n.language)
  }

  const fileInput = (
    <label className="ws-btn">
      {t('workspace.kbUpload')}
      <input
        type="file"
        accept=".md,.txt,.pdf,.doc,.docx,.ppt,.pptx"
        hidden
        disabled={saving}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ''
        }}
      />
    </label>
  )

  if (detail) {
    return (
      <section className="kb-page kb-editor">
        <button type="button" className="kb-back" onClick={showList}>
          {t('workspace.kbBack')}
        </button>
        <input
          className="ws-input"
          value={title}
          placeholder={t('workspace.kbTitlePlaceholder')}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="ws-area"
          value={body}
          placeholder={t('workspace.kbBodyPlaceholder')}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="kb-actions">
          {fileInput}
          <button type="button" className="ws-btn" onClick={handleSave} disabled={!spaceId || saving}>
            {saving ? t('workspace.kbSaving') : t('workspace.kbSave')}
          </button>
          <button type="button" className="ws-btn" onClick={handleDelete} disabled={!docId}>
            {t('workspace.kbDelete')}
          </button>
          <button type="button" className="ws-btn" onClick={handleDownload} disabled={!hasFile}>
            {t('workspace.download')}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="kb-page">
      <h1 className="ws-title">{t('workspace.kbTitle')}</h1>
      <div className="kb-row">
        <select className="ws-input" value={spaceId || ''} onChange={(e) => handleSpace(Number(e.target.value))}>
          {spaces.length === 0 ? <option value="">{t('workspace.kbNoSpace')}</option> : null}
          {spaces.map((sp) => (
            <option key={sp.id} value={sp.id}>
              {sp.name}
            </option>
          ))}
        </select>
        <input
          className="ws-input"
          value={spaceName}
          placeholder={t('workspace.kbSpacePlaceholder')}
          onChange={(e) => setSpaceName(e.target.value)}
        />
        <button type="button" className="ws-btn" onClick={handleCreateSpace}>
          {t('workspace.kbAddSpace')}
        </button>
        <button type="button" className="ws-btn" onClick={handleNewDoc} disabled={!spaceId}>
          {t('workspace.kbNewDoc')}
        </button>
        {fileInput}
      </div>
      <div className="kb-list">
        {docs.map((doc) => (
          <button key={doc.id} type="button" className="kb-item" onClick={() => openDoc(doc.id)}>
            <strong>{doc.title}</strong>
            <span>{formatUpdated(doc.updated_at)}</span>
          </button>
        ))}
        {docs.length === 0 ? <p className="kb-empty">{t('workspace.kbNoDoc')}</p> : null}
      </div>
      {total > 0 ? (
        <div className="kb-pager">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            onChange={(next, size) => {
              setPage(size === pageSize ? next : 1)
              setPageSize(size)
            }}
          />
        </div>
      ) : null}
    </section>
  )
}

export default KbPage
