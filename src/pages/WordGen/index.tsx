import { useMemo, useState } from 'react'
import { useAppSelector } from '../../store/hooks'
import { workspaceCopy } from '../../workspace/copy'

type WordType = 'copy' | 'mail' | 'summary'

function mockDraft(prompt: string, type: WordType, zh: boolean) {
  const topic = prompt.trim() || (zh ? '未命名主题' : 'Untitled topic')
  if (type === 'mail') {
    return zh
      ? `主题：关于「${topic}」\n\n您好，\n\n围绕「${topic}」，我整理了如下要点：请先明确目标受众，再给出可执行的下一步。如需补充材料，随时告诉我。\n\n此致`
      : `Subject: About "${topic}"\n\nHi,\n\nHere is a short draft around "${topic}". Please confirm the audience, then we can lock next steps.\n\nThanks`
  }
  if (type === 'summary') {
    return zh
      ? `摘要：「${topic}」\n1. 核心观点需在开头一句说清。\n2. 用 2–3 个论据支撑。\n3. 结尾给出可执行建议。`
      : `Summary: "${topic}"\n1. State the core idea in one sentence.\n2. Support it with 2–3 points.\n3. End with a concrete next step.`
  }
  return zh
    ? `【${topic}】\n用更轻的语气把价值讲清楚：先点出痛点，再给出解决方案，最后用一句行动召唤收束。适合投放在官网或社媒简介。`
    : `["${topic}"]\nLead with the pain, then the fix, then a single call to action. Fits a landing section or social bio.`
}

function WordGen() {
  const language = useAppSelector((state) => state.sysSetting.sysLanguage)
  const t = workspaceCopy[language]
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
    setLoading(true)
    setCopied(false)
    await new Promise((r) => setTimeout(r, 700))
    setResult(mockDraft(prompt, type, language === 'zh-CN'))
    setLoading(false)
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
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
