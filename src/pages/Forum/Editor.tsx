import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { uploadForumImage } from '../../api/forum'
import { useApiNotify } from '../../api/notify'

export type ForumEditorHandle = {
  getHTML: () => string
}

type Props = {
  placeholder: string
  linkPrompt: string
  imageLabel: string
}

function meaningfulHTML(current: Editor) {
  if (current.isDestroyed) return ''
  const html = current.getHTML()
  const text = current.getText().replace(/\u200b/g, '').trim()
  if (text || /<img\b/i.test(html)) return html
  return ''
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const ForumEditor = forwardRef<ForumEditorHandle, Props>(function ForumEditor({ placeholder, linkPrompt, imageLabel }, ref) {
  const { t } = useTranslation()
  const notify = useApiNotify()
  const live = useRef<Editor | null>(null)
  const lastHtml = useRef('')
  const fileRef = useRef<HTMLInputElement>(null)

  function remember(current: Editor) {
    live.current = current
    lastHtml.current = meaningfulHTML(current)
  }

  const editor = useEditor({
    immediatelyRender: false,
    onCreate: ({ editor: current }) => {
      remember(current)
    },
    onUpdate: ({ editor: current }) => {
      remember(current)
    },
    onTransaction: ({ editor: current }) => {
      live.current = current
    },
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
        underline: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https'],
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    editorProps: {
      attributes: { class: 'ios-editor' },
    },
  })

  useImperativeHandle(ref, () => ({
    getHTML: () => {
      const current = editor && !editor.isDestroyed ? editor : live.current
      if (current) {
        const html = meaningfulHTML(current)
        if (html) return html
      }
      if (lastHtml.current) return lastHtml.current
      const typed = document.querySelector('.ios-editor')?.textContent?.replace(/\u200b/g, '').trim() ?? ''
      if (!typed || typed === placeholder) return ''
      return `<p>${escapeHtml(typed)}</p>`
    },
  }))

  async function insertImage(file: File) {
    const current = editor && !editor.isDestroyed ? editor : live.current
    if (!current || current.isDestroyed) return
    try {
      const res = await uploadForumImage(file)
      const url = res.data?.url
      if (!url) return
      current.chain().focus().setImage({ src: url }).run()
      remember(current)
    } catch (err) {
      notify.fail(err, t('common.offline'))
    }
  }

  return (
    <div className="ios-editor-wrap">
      <Toolbar editor={editor} linkPrompt={linkPrompt} imageLabel={imageLabel} onImage={() => fileRef.current?.click()} />
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) void insertImage(file)
        }}
      />
      <EditorContent editor={editor} />
    </div>
  )
})

function Toolbar({
  editor,
  linkPrompt,
  imageLabel,
  onImage,
}: {
  editor: Editor | null
  linkPrompt: string
  imageLabel: string
  onImage: () => void
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => {
      if (!current) return null
      return {
        bold: current.isActive('bold'),
        italic: current.isActive('italic'),
        strike: current.isActive('strike'),
        h2: current.isActive('heading', { level: 2 }),
        h3: current.isActive('heading', { level: 3 }),
        bullet: current.isActive('bulletList'),
        ordered: current.isActive('orderedList'),
        quote: current.isActive('blockquote'),
        link: current.isActive('link'),
      }
    },
  })

  function run(action: (current: Editor) => void) {
    if (!editor) return
    action(editor)
  }

  function toggleLink() {
    if (!editor) return
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const href = window.prompt(linkPrompt, 'https://')
    if (!href) return
    const trimmed = href.trim()
    if (!/^https?:\/\//i.test(trimmed)) return
    editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run()
  }

  const items = [
    { key: 'bold', label: 'B', on: state?.bold, run: (e: Editor) => e.chain().focus().toggleBold().run() },
    { key: 'italic', label: 'I', on: state?.italic, run: (e: Editor) => e.chain().focus().toggleItalic().run() },
    { key: 'strike', label: 'S', on: state?.strike, run: (e: Editor) => e.chain().focus().toggleStrike().run() },
    { key: 'h2', label: 'H2', on: state?.h2, run: (e: Editor) => e.chain().focus().toggleHeading({ level: 2 }).run() },
    { key: 'h3', label: 'H3', on: state?.h3, run: (e: Editor) => e.chain().focus().toggleHeading({ level: 3 }).run() },
    { key: 'bullet', label: '•', on: state?.bullet, run: (e: Editor) => e.chain().focus().toggleBulletList().run() },
    { key: 'ordered', label: '1.', on: state?.ordered, run: (e: Editor) => e.chain().focus().toggleOrderedList().run() },
    { key: 'quote', label: '”', on: state?.quote, run: (e: Editor) => e.chain().focus().toggleBlockquote().run() },
  ]

  return (
    <div className="ios-format-bar">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={item.on ? 'is-on' : undefined}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => run(item.run)}
        >
          {item.label}
        </button>
      ))}
      <button
        type="button"
        className={state?.link ? 'is-on' : undefined}
        onMouseDown={(event) => event.preventDefault()}
        onClick={toggleLink}
      >
        Link
      </button>
      <button type="button" className="is-media" onMouseDown={(event) => event.preventDefault()} onClick={onImage}>
        {imageLabel}
      </button>
    </div>
  )
}

export default ForumEditor
