import { HTMLAttributes } from 'react'

export function Card({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
