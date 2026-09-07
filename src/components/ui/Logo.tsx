import Link from 'next/link'

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
  const textSize = size === 'sm' ? 'text-base' : 'text-lg'

  return (
    <Link href="/" className="flex items-center gap-2.5 min-w-0">
      <span
        className={`${iconSize} rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-600/20`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[18px] h-[18px] text-white"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="13" y2="17" />
        </svg>
      </span>
      <span className={`${textSize} font-bold text-gray-900 tracking-tight truncate`}>
        Clear Invoice
      </span>
    </Link>
  )
}
