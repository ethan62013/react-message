import { useId } from 'react'

function NexusLogo({ className }: { className?: string }) {
  const rawId = useId().replace(/:/g, '')
  const gold = `nexus-gold-${rawId}`
  const purple = `nexus-purple-${rawId}`

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={gold} x1="22" y1="6" x2="50" y2="24">
          <stop offset="0%" stopColor="#FFE7A8" />
          <stop offset="100%" stopColor="#F5C16C" />
        </linearGradient>
        <linearGradient id={purple} x1="8" y1="12" x2="36" y2="56">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#AA3BFF" />
        </linearGradient>
      </defs>
      <path d="M10 14 28 6v42L10 54V14Z" fill={`url(#${purple})`} />
      <path d="M28 6 54 18 36 26 28 12V6Z" fill={`url(#${gold})`} />
      <path d="M36 26 54 18v36L36 58V26Z" fill="#FF7AD9" />
      <path d="M28 18 36 26v32l-8-6V18Z" fill="#7C3AED" />
    </svg>
  )
}

export default NexusLogo
