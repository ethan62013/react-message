import { useMemo, useState } from 'react'
import { generateWordRequest, type WordType } from '../../api/gen'
import { ApiCode, ApiError } from '../../api/http'
import { useApiNotify } from '../../api/notify'
import { useAppSelector } from '../../store/hooks'
import { workspaceCopy } from '../../workspace/copy'

function WordGen() {
  const language = useAppSelector((state) => state.sysSetting.sysLanguage)
  const token = useAppSelector((state) => state.auth.token)
  const t = workspaceCopy[language]
  const notify = useApiNotify()
  const [prompt, setPrompt] = useState('')
  const [type, setType] = useState<WordType>('copy')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)

  const types = useMemo(
    () =>
      [
        { id: 'copy' as const, label: t.typeCopy },
        { id: 'mail' as const, label: t.typeMail },
        { id: 'summary' as const, label: t.typeSummary },
      ],
    [t],
  )

  async function handleGenerate() {
    if (!prompt.trim()) {
      notify.fail(new ApiError(ApiCode.BadRequest, 'prompt required'), t.wordOffline)
      return
    }
    if (!token) {
      notify.fail(null, t.wordOffline)
      return
    }
    setLoading(true)
    setCopied(false)
    try {
      const res = await generateWordRequest(
        { prompt: prompt.trim(), type, lang: language },
        token,
      )
      setResult(res.data?.text ?? '')
    } catch (err) {
      notify.fail(err, t.wordOffline)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
    notify.success(t.copied)
  }

  return (
    <div>
      <h1 className="ws-title">{t.wordTitle}</h1>
      <p className="ws-sub">{t.wordSub}</p>
      <textarea
        className="ws-area"
        value={prompt}
        placeholder={t.wordPlaceholder}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="ws-chips">
        {types.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`ws-chip${type === item.id ? ' is-active' : ''}`}
            onClick={() => setType(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="ws-btn ws-btn-block"
        disabled={loading}
        onClick={handleGenerate}
      >
        {loading ? t.generating : t.generate}
      </button>
      <div className={`ws-result${result ? ' has-text' : ''}`}>
        {result ? (
          <button type="button" className="ws-copy" onClick={handleCopy}>
            {copied ? t.copied : t.copy}
          </button>
        ) : null}
        {result || t.resultEmpty}
      </div>
    </div>
  )
}

export default WordGen
