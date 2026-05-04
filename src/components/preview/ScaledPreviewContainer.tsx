'use client'

import { useRef, useEffect, useState } from 'react'

const A4_WIDTH_PX = 794 // 210mm at 96dpi

export function ScaledPreviewContainer({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [scaledHeight, setScaledHeight] = useState<number | undefined>()

  useEffect(() => {
    const update = () => {
      const outer = outerRef.current
      const inner = innerRef.current
      if (!outer || !inner) return
      const newScale = Math.min(1, outer.offsetWidth / A4_WIDTH_PX)
      setScale(newScale)
      setScaledHeight(newScale < 1 ? inner.scrollHeight * newScale : undefined)
    }

    update()
    const ro = new ResizeObserver(update)
    if (outerRef.current) ro.observe(outerRef.current)
    if (innerRef.current) ro.observe(innerRef.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={outerRef}
      style={{
        width: '100%',
        height: scaledHeight !== undefined ? `${scaledHeight}px` : undefined,
        overflow: 'hidden',
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: `${A4_WIDTH_PX}px`,
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  )
}
