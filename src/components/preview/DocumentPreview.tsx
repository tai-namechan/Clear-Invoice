import { formatWarekiLong, formatWarekiYearMonth } from '@/lib/utils/wareki'
import { formatCurrency } from '@/lib/utils/currency'
import type { Estimate, Invoice, DocumentItem } from '@/types/db'

// すべて inline style で書く（html2canvas が oklch を解釈できないため、Tailwind カラークラス禁止）

const C = {
  black: '#111827',
  gray900: '#111827',
  gray700: '#374151',
  gray500: '#6b7280',
  gray300: '#d1d5db',
  gray200: '#e5e7eb',
  gray100: '#f3f4f6',
  gray50: '#f9fafb',
  white: '#ffffff',
  border: '#1f2937',       // テーブル外枠・ヘッダー罫線（濃いめ）
  borderLight: '#9ca3af', // データ行罫線（gray-400: PDFでも見える）
} as const

type Props =
  | { docType: 'estimate'; estimate: Estimate; items: DocumentItem[] }
  | { docType: 'invoice'; invoice: Invoice; items: DocumentItem[] }

export function DocumentPreview(props: Props) {
  const isEstimate = props.docType === 'estimate'
  const doc: Estimate | Invoice = isEstimate ? props.estimate : props.invoice
  const items: DocumentItem[] = props.items

  const issuer = doc.issuer_snapshot
  const title = isEstimate ? '御見積書' : '請求書'
  const totalLabel: string =
    !isEstimate && props.docType === 'invoice' ? props.invoice.total_label : '合計金額'
  const targetMonth: string | null = doc.target_month ?? null

  const bankLine = [
    issuer.bank_name,
    issuer.bank_branch,
    issuer.bank_account_type,
    issuer.bank_account_number,
    issuer.bank_account_holder ? `（${issuer.bank_account_holder}）` : null,
  ]
    .filter(Boolean)
    .join('　')

  return (
    <div
      className="a4-paper"
      style={{
        // width/padding を inline に置く → onclone でスタイルシート除去後も維持される
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm 18mm',
        boxSizing: 'border-box',
        backgroundColor: C.white,
        color: C.black,
        fontFamily: 'sans-serif',
        fontSize: '13px',
        lineHeight: '1.6',
      }}
    >
      {/* ── タイトル ── */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: C.black, margin: 0 }}>
          {title}
        </h1>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '6px',
            fontSize: '12px',
            color: C.gray700,
          }}
        >
          <span>書類番号：{doc.document_number}</span>
          <span>発行日：{formatWarekiLong(doc.issue_date)}</span>
          {targetMonth && <span>請求対象月：{formatWarekiYearMonth(targetMonth)}分</span>}
        </div>
      </div>

      {/* ── 取引先 ＋ 自社情報 ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: `1px solid ${C.gray300}`,
        }}
      >
        {/* 左: 取引先 */}
        <div style={{ flex: 1 }}>
          <div
            style={{ fontSize: '18px', fontWeight: 'bold', color: C.black, marginBottom: '4px' }}
          >
            {doc.client_snapshot.name}
            {doc.client_snapshot.honorific ? `　${doc.client_snapshot.honorific}` : ''}
          </div>
          {doc.client_snapshot.postal_code && (
            <div style={{ fontSize: '12px', color: C.gray700 }}>
              〒{doc.client_snapshot.postal_code}
            </div>
          )}
          {doc.client_snapshot.address && (
            <div style={{ fontSize: '12px', color: C.gray700, marginBottom: '8px' }}>
              {doc.client_snapshot.address}
            </div>
          )}
          {doc.subject && (
            <div style={{ marginTop: '8px', fontSize: '13px', color: C.black }}>
              <span style={{ color: C.gray700 }}>件名：</span>
              <strong>{doc.subject}</strong>
            </div>
          )}
        </div>

        {/* 右: 自社情報 + 印鑑 */}
        <div style={{ minWidth: '200px', textAlign: 'right', fontSize: '12px', color: C.gray700 }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: C.black, marginBottom: '2px' }}>
            {issuer.name}
          </div>
          {issuer.representative_name && <div>{issuer.representative_name}</div>}
          {issuer.postal_code && <div>〒{issuer.postal_code}</div>}
          {issuer.address && <div>{issuer.address}</div>}
          {issuer.tel && <div>TEL: {issuer.tel}</div>}
          {issuer.email && <div>{issuer.email}</div>}
          {/* 印鑑エリア */}
          <div
            style={{
              marginTop: '8px',
              marginLeft: 'auto',
              width: '60px',
              height: '60px',
              border: `1px solid ${C.gray300}`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              color: C.gray500,
            }}
          >
            印
          </div>
        </div>
      </div>

      {/* ── 合計金額 ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          backgroundColor: C.gray50,
          border: `1px solid ${C.gray300}`,
          borderRadius: '6px',
          marginBottom: '20px',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: '600', color: C.gray700 }}>
          {totalLabel}
        </span>
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: C.black }}>
          ¥{formatCurrency(doc.total)}
        </span>
      </div>

      {/* ── 明細テーブル ── */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '20px',
          fontSize: '12px',
          border: `1.5px solid ${C.border}`,
        }}
      >
        <thead>
          <tr style={{ backgroundColor: C.gray100 }}>
            {['品名', '数量', '単位', '単価', '金額', '備考'].map((h) => (
              <th
                key={h}
                style={{
                  padding: '8px 10px',
                  border: `1.5px solid ${C.border}`,
                  fontWeight: '700',
                  color: C.gray700,
                  textAlign: h === '品名' || h === '備考' ? 'left' : 'right',
                  whiteSpace: 'nowrap',
                  backgroundColor: C.gray100,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? C.white : C.gray50 }}>
              <td style={{ padding: '8px 10px', border: `1px solid ${C.borderLight}`, color: C.black }}>
                {item.name}
              </td>
              <td style={{ padding: '8px 10px', border: `1px solid ${C.borderLight}`, textAlign: 'right', color: C.black }}>
                {item.quantity}
              </td>
              <td style={{ padding: '8px 10px', border: `1px solid ${C.borderLight}`, color: C.gray700, textAlign: 'right' }}>
                {item.unit}
              </td>
              <td style={{ padding: '8px 10px', border: `1px solid ${C.borderLight}`, textAlign: 'right', color: C.black }}>
                ¥{formatCurrency(item.unit_price)}
              </td>
              <td style={{ padding: '8px 10px', border: `1px solid ${C.borderLight}`, textAlign: 'right', fontWeight: '600', color: C.black }}>
                ¥{formatCurrency(item.amount)}
              </td>
              <td style={{ padding: '8px 10px', border: `1px solid ${C.borderLight}`, color: C.gray500, fontSize: '11px' }}>
                {item.notes}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: C.gray100 }}>
            <td
              colSpan={4}
              style={{
                padding: '9px 10px',
                border: `1.5px solid ${C.border}`,
                textAlign: 'right',
                fontWeight: '700',
                color: C.gray700,
                backgroundColor: C.gray100,
              }}
            >
              {totalLabel}
            </td>
            <td
              style={{
                padding: '9px 10px',
                border: `1.5px solid ${C.border}`,
                textAlign: 'right',
                fontWeight: 'bold',
                color: C.black,
                fontSize: '14px',
                backgroundColor: C.gray100,
              }}
            >
              ¥{formatCurrency(doc.total)}
            </td>
            <td style={{ border: `1.5px solid ${C.border}`, backgroundColor: C.gray100 }} />
          </tr>
        </tfoot>
      </table>

      {/* ── フッター（振込先・備考） ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
        {bankLine && (
          <div
            style={{
              padding: '10px 14px',
              border: `1px solid ${C.gray300}`,
              borderRadius: '4px',
              backgroundColor: C.gray50,
            }}
          >
            <div style={{ fontWeight: '600', color: C.gray700, marginBottom: '4px' }}>振込先</div>
            <div style={{ color: C.gray900 }}>{bankLine}</div>
          </div>
        )}
        {doc.notes && (
          <div
            style={{
              padding: '10px 14px',
              border: `1px solid ${C.gray300}`,
              borderRadius: '4px',
            }}
          >
            <div style={{ fontWeight: '600', color: C.gray700, marginBottom: '4px' }}>備考</div>
            <div style={{ color: C.gray900, whiteSpace: 'pre-wrap' }}>{doc.notes}</div>
          </div>
        )}
      </div>
    </div>
  )
}
