import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generateWordRequest, type WordType } from '../../api/gen'
import { ApiCode, ApiError } from '../../api/http'
import { useApiNotify } from '../../api/notify'
import { useAppSelector } from '../../store/hooks'

function WordGen() {
  const { t } = useTranslation()
  const language = useAppSelector((state) => state.sysSetting.sysLanguage)
  const notify = useApiNotify()
  const [prompt, setPrompt] = useState('')
  const [type, setType] = useState<WordType>('copy')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)

  const types = useMemo(
    () =>
      [
        { id: 'copy' as const, label: t('workspace.typeCopy') },
        { id: 'mail' as const, label: t('workspace.typeMail') },
        { id: 'summary' as const, label: t('workspace.typeSummary') },
      ],
    [t],
  )

  async function handleGenerate() {
    if (!prompt.trim()) {
      notify.fail(new ApiError(ApiCode.BadRequest, 'prompt required'), t('common.offline'))
      return
    }
    setLoading(true)
    setCopied(false)
    try {
      const res = await generateWordRequest({
        prompt: prompt.trim(),
        type,
        lang: language,
      })
      setResult(res.data?.text ?? '')
    } catch (err) {
      notify.fail(err, t('common.offline'))
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
    notify.success(t('workspace.copied'))
  }

  return (
    <div>
      <h1 className="ws-title">{t('workspace.wordTitle')}</h1>
      <p className="ws-sub">{t('workspace.wordSub')}</p>
      <textarea
        className="ws-area"
        value={prompt}
        placeholder={t('workspace.wordPlaceholder')}
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
        {loading ? t('workspace.generating') : t('workspace.generate')}
      </button>
      <div className={`ws-result${result ? ' has-text' : ''}`}>
        {result ? (
          <button type="button" className="ws-copy" onClick={handleCopy}>
            {copied ? t('workspace.copied') : t('workspace.copy')}
          </button>
        ) : null}
        {result || t('workspace.resultEmpty')}
      </div>
    </div>
  )
}

export default WordGen
