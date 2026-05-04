'use client'

import { useState, useEffect } from 'react'

type Props = {
  documentNumber: string
  docType: 'estimate' | 'invoice'
  clientName: string
  issueDate: string
}

export function PreviewActions({ documentNumber, docType, clientName, issueDate }: Props) {
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const docLabel = docType === 'invoice' ? '請求書' : '見積書'
  const datePart = issueDate.replace(/-/g, '')
  const safeName = clientName.replace(/[\\/:*?"<>|]/g, '_')
  const filename = `${safeName} ${docLabel}${datePart}`

  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)
  const [canShareFiles, setCanShareFiles] = useState(false)
  const [sharingPdf, setSharingPdf] = useState(false)

  useEffect(() => {
    const probe = new File([''], 'probe.pdf', { type: 'application/pdf' })
    setCanShareFiles(!!navigator.canShare?.({ files: [probe] }))
  }, [])

  async function generatePdfBlob(): Promise<Blob> {
    const { default: jsPDF } = await import('jspdf')
    const { default: html2canvas } = await import('html2canvas')

    const el = document.querySelector<HTMLElement>('.a4-paper')
    if (!el) throw new Error('プレビュー要素が見つかりません')

    const canvas = await html2canvas(el, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        clonedDoc
          .querySelectorAll('link[rel="stylesheet"], style')
          .forEach((s) => s.remove())
        // ScaledPreviewContainer のtransform/overflow をリセットし
        // html2canvas がフルサイズでキャプチャできるようにする
        const a4 = clonedDoc.querySelector<HTMLElement>('.a4-paper')
        if (a4) {
          const inner = a4.parentElement
          if (inner) {
            inner.style.transform = 'none'
            const outer = inner.parentElement
            if (outer) {
              outer.style.height = 'auto'
              outer.style.overflow = 'visible'
            }
          }
        }
      },
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.85)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = (canvas.height * pdfW) / canvas.width
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)
    return pdf.output('blob')
  }

  const handleDownload = async () => {
    setDownloadingPdf(true)
    try {
      const blob = await generatePdfBlob()
      const url = URL.createObjectURL(blob)
      if (isIOS) {
        window.location.href = url
      } else {
        const a = document.createElement('a')
        a.href = url
        a.download = `${filename}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(url), 10000)
      }
    } catch (e) {
      console.error(e)
      alert('PDFのダウンロードに失敗しました')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const handleShare = async () => {
    setSharingPdf(true)
    try {
      const blob = await generatePdfBlob()
      const file = new File([blob], `${filename}.pdf`, { type: 'application/pdf' })
      await navigator.share({ files: [file], title: filename })
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
      console.error(e)
      alert('PDFの共有に失敗しました')
    } finally {
      setSharingPdf(false)
    }
  }

  const handlePrint = () => {
    const original = document.title
    document.title = filename
    window.print()
    document.title = original
  }

  return (
    <div className="no-print flex flex-wrap gap-2">
      {/* PDFを共有（Web Share API対応端末のみ表示） */}
      {canShareFiles && (
        <button
          type="button"
          onClick={handleShare}
          disabled={sharingPdf || downloadingPdf}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
        >
          {sharingPdf ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          )}
          {sharingPdf ? '生成中...' : 'PDFを共有'}
        </button>
      )}

      {/* PDFダウンロード */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloadingPdf}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-60"
      >
        {downloadingPdf ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )}
        {downloadingPdf ? '生成中...' : 'PDFダウンロード'}
      </button>

      {/* 印刷 */}
      <button
        type="button"
        onClick={handlePrint}
        disabled={downloadingPdf}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition disabled:opacity-60"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        印刷
      </button>
    </div>
  )
}
