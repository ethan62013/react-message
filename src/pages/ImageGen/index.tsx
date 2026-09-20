import { DownloadOutlined } from '@ant-design/icons'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generateImageRequest, type ImageRatio, type ImageStyle } from '../../api/gen'
import { ApiCode, ApiError } from '../../api/http'
import { useApiNotify } from '../../api/notify'

function ImageGen() {
  const { t } = useTranslation()
  const notify = useApiNotify()
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<ImageStyle>('real')
  const [ratio, setRatio] = useState<ImageRatio>('16:9')
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const styles = useMemo(
    () =>
      [
        { id: 'real' as const, label: t('workspace.styleReal') },
        { id: 'oil' as const, label: t('workspace.styleOil') },
        { id: 'illust' as const, label: t('workspace.styleIllust') },
      ],
    [t],
  )

  const ratios: ImageRatio[] = ['16:9', '1:1', '9:16']
  const thumbClass =
    ratio === '1:1' ? ' is-square' : ratio === '9:16' ? ' is-portrait' : ''

  async function handleGenerate() {
    if (!prompt.trim()) {
      notify.fail(new ApiError(ApiCode.BadRequest, 'prompt required'), t('common.offline'))
      return
    }
    setLoading(true)
    try {
      const res = await generateImageRequest({
        prompt: prompt.trim(),
        style,
        ratio,
      })
      setImages(res.data?.urls ?? [])
    } catch (err) {
      notify.fail(err, t('common.offline'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="ws-title">{t('workspace.imageTitle')}</h1>
      <div className="ws-image-layout">
        <div>
          <input
            className="ws-input"
            value={prompt}
            placeholder={t('workspace.imagePlaceholder')}
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
            {loading ? t('workspace.generating') : t('workspace.generateImage')}
          </button>
        </div>
        <div className="ws-image-grid">
          {(images.length ? images : [null, null, null, null]).map((src, i) => (
            <div className={`ws-thumb${thumbClass}`} key={src ?? `empty-${i}`}>
              {src ? <img src={src} alt="" /> : null}
              {src ? (
                <a href={src} target="_blank" rel="noreferrer" download={`nexus-${i + 1}.png`} title={t('workspace.download')}>
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
