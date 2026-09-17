import { DownloadOutlined } from '@ant-design/icons'
import { useMemo, useState } from 'react'
import { useAppSelector } from '../../store/hooks'
import { workspaceCopy } from '../../workspace/copy'

type StyleId = 'real' | 'oil' | 'illust'
type RatioId = '16:9' | '1:1' | '9:16'

function hashString(value: string) {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mockImage(seed: string, ratio: RatioId, style: StyleId) {
  const [w, h] = ratio === '1:1' ? [720, 720] : ratio === '9:16' ? [540, 960] : [960, 540]
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const n = hashString(seed)
  const palettes = {
    real: ['#07060c', '#1b1240', '#3b1d6e', '#22d3ee'],
    oil: ['#140c28', '#4c1d95', '#aa3bff', '#f5c16c'],
    illust: ['#0b1020', '#312e81', '#ff2d95', '#7dd3fc'],
  }[style]
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, palettes[0])
  g.addColorStop(0.45, palettes[1])
  g.addColorStop(1, palettes[2])
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  ctx.globalAlpha = 0.55
  for (let i = 0; i < 80; i += 1) {
    const x = ((n * (i + 3)) % w) + (i % 7) * 9
    const y = ((n * (i + 11)) % h) + (i % 5) * 6
    const r = 40 + (i % 12) * 8
    const orb = ctx.createRadialGradient(x, y, 0, x, y, r)
    orb.addColorStop(0, palettes[3])
    orb.addColorStop(1, 'transparent')
    ctx.fillStyle = orb
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  ctx.globalAlpha = 1
  ctx.fillStyle = '#edebf7'
  for (let i = 0; i < 120; i += 1) {
    const x = (n * (i + 19) + i * 97) % w
    const y = (n * (i + 41) + i * 53) % h
    ctx.globalAlpha = 0.35 + (i % 5) * 0.12
    ctx.fillRect(x, y, i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1)
  }
  ctx.globalAlpha = 1
  return canvas.toDataURL('image/jpeg', 0.86)
}

function ImageGen() {
  const language = useAppSelector((state) => state.sysSetting.sysLanguage)
  const t = workspaceCopy[language]
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<StyleId>('real')
  const [ratio, setRatio] = useState<RatioId>('16:9')
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const styles = useMemo(
    () =>
      [
        { id: 'real' as const, label: t.styleReal },
        { id: 'oil' as const, label: t.styleOil },
        { id: 'illust' as const, label: t.styleIllust },
      ],
    [t],
  )

  const ratios: RatioId[] = ['16:9', '1:1', '9:16']
  const thumbClass =
    ratio === '1:1' ? ' is-square' : ratio === '9:16' ? ' is-portrait' : ''

  async function handleGenerate() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    const base = `${prompt}|${style}|${ratio}|${Date.now()}`
    setImages([0, 1, 2, 3].map((i) => mockImage(`${base}-${i}`, ratio, style)))
    setLoading(false)
  }

  return (
    <div>
      <h1 className="ws-title">{t.imageTitle}</h1>
      <div className="ws-image-layout">
        <div>
          <input
            className="ws-input"
            value={prompt}
            placeholder={t.imagePlaceholder}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="ws-chips">
            {styles.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`ws-chip${style === item.id ? ' is-active' : ''}`}
                onClick={() => setStyle(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="ws-chips">
            {ratios.map((item) => (
              <button
                key={item}
                type="button"
                className={`ws-chip${ratio === item ? ' is-active' : ''}`}
                onClick={() => setRatio(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="ws-btn ws-btn-block"
            disabled={loading}
            onClick={handleGenerate}
          >
            {loading ? t.generating : t.generateImage}
          </button>
        </div>
        <div className="ws-image-grid">
          {(images.length ? images : [null, null, null, null]).map((src, i) => (
            <div className={`ws-thumb${thumbClass}`} key={src ?? `empty-${i}`}>
              {src ? <img src={src} alt="" /> : null}
              {src ? (
                <a href={src} download={`nexus-${i + 1}.jpg`} title={t.download}>
                  <DownloadOutlined />
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ImageGen
