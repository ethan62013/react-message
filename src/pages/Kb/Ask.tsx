import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { askKb, listSpaces, type KbCitation, type KbSpace } from '../../api/kb'
import { ApiCode, ApiError } from '../../api/http'
import { useApiNotify } from '../../api/notify'
import './kb.css'

function KbAskPage() {
  const { t } = useTranslation()
  const notify = useApiNotify()
  const [spaces, setSpaces] = useState<KbSpace[]>([])
  const [spaceId, setSpaceId] = useState(0)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [hit, setHit] = useState(true)
  const [citations, setCitations] = useState<KbCitation[]>([])
  const [asking, setAsking] = useState(false)

  useEffect(() => {
    let cancelled = false
    listSpaces()
      .then((res) => {
        if (cancelled) return
        const list = res.data ?? []
        setSpaces(list)
        if (list[0]) setSpaceId(list[0].id)
      })
      .catch((err) => notify.fail(err, t('common.offline')))
    return () => {
      cancelled = true
    }
  }, [notify, t])

  async function handleAsk() {
    if (!spaceId || !question.trim()) {
      notify.fail(new ApiError(ApiCode.BadRequest, 'question required'), t('common.offline'))
      return
    }
    setAsking(true)
    try {
      const res = await askKb(spaceId, question.trim())
      setHit(res.data?.hit ?? false)
      setAnswer(res.data?.answer ?? '')
      setCitations(res.data?.citations ?? [])
    } catch (err) {
      notify.fail(err, t('common.offline'))
    } finally {
      setAsking(false)
    }
  }

  return (
    <div className="kb-ask-layout">
      <section className="kb-ask">
        <h1 className="ws-title">{t('workspace.kbAsk')}</h1>
        <select className="ws-input" value={spaceId || ''} onChange={(e) => setSpaceId(Number(e.target.value))}>
          {spaces.length === 0 ? <option value="">{t('workspace.kbNoSpace')}</option> : null}
          {spaces.map((sp) => (
            <option key={sp.id} value={sp.id}>
              {sp.name}
            </option>
          ))}
        </select>
        <textarea
          className="ws-area"
          value={question}
          placeholder={t('workspace.kbAskPlaceholder')}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button type="button" className="ws-btn" onClick={handleAsk} disabled={!spaceId || asking}>
          {asking ? t('workspace.kbAsking') : t('workspace.kbAsk')}
        </button>
      </section>
      <section className="kb-ask">
        <div className="ws-result has-text">
          {hit ? answer || t('workspace.kbAnswerEmpty') : t('workspace.kbNoHit')}
        </div>
        {citations.map((cite) => (
          <Link key={`${cite.doc_id}-${cite.seq}`} className="kb-cite" to={`/kb?doc=${cite.doc_id}`}>
            <strong>
              {cite.title} #{cite.seq}
            </strong>
            <p>{cite.content}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}

export default KbAskPage
