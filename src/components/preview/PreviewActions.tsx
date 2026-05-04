'use client'

import { useState } from 'react'

type Props = {
  documentNumber: string
  docType: 'estimate' | 'invoice'
}

export function PreviewActions({ documentNumber, docType }: Props) {
  const [openingPdf, setOpeningPdf] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const prefix = docType === 'invoice' ? 'invoice' : 'estimate'
  const filename = `${prefix}_${documentNumber}`

  const isBusy = openingPdf || downloadingPdf

  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)

  async function generatePdfDataUri(): Promise<string> {
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
      },
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.85)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = (canvas.height * pdfW) / canvas.width
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)
    return pdf.output('datauristring')
  }

  const handleOpenPdf = async () => {
    // ポップアップブロック回避のため async 前に同期でウィンドウを開く
    // iOS は blob URL を別タブで開けないため data URI を使う
    const win = isIOS ? null : window.open('about:blank', '_blank')
    setOpeningPdf(true)
    try {
      const dataUri = await generatePdfDataUri()
      if (win) {
        win.location.href = dataUri
      } else {
        // iOS: 現在のタブで PDF を開く（Safari の共有メニューから保存可能）
        window.location.href = dataUri
      }
    } catch (e) {
      console.error(e)
      win?.close()
      alert('PDFの生成に失敗しました')
    } finally {
      setOpeningPdf(false)
    }
  }

  const handleDownload = async () => {
    setDownloadingPdf(true)
    try {
      const dataUri = await generatePdfDataUri()
      if (isIOS) {
        // iOS は download 属性が効かないため PDF を開いて共有メニューから保存
        window.location.href = dataUri
      } else {
        const a = document.createElement('a')
        a.href = dataUri
        a.download = `${filename}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    } catch (e) {
      console.error(e)
      alert('PDFのダウンロードに失敗しました')
    } finally {
      setDownloadingPdf(false)
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
      {/* PDFを開く */}
      <button
        type="button"
        onClick={handleOpenPdf}
        disabled={isBusy}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-60"
      >
        {openingPdf ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        )}
        {openingPdf ? '生成中...' : 'PDFを開く'}
      </button>

      {/* PDFダウンロード */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={isBusy}
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
        disabled={isBusy}
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
