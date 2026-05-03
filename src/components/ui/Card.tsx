import { HTMLAttributes } from 'react'

export function Card({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
