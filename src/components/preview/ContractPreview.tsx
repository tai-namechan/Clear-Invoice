import type { Contract } from '@/types/db'

// すべて inline style で書く（html2canvas が oklch を解釈できないため、Tailwind カラークラス禁止）

const C = {
  black: '#111827',
  gray700: '#374151',
  gray500: '#6b7280',
  gray300: '#d1d5db',
  gray200: '#e5e7eb',
  gray999: '#999999',
  white: '#ffffff',
} as const

const LINE = '＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿'
const LINE_SHORT = '＿＿＿＿＿＿＿'
const LINE_NUM = '＿＿'

const articleHeadStyle: React.CSSProperties = {
  fontWeight: 'bold',
  marginTop: '7px',
  marginBottom: '1px',
  fontSize: '9.5px',
}

const bodyStyle: React.CSSProperties = {
  margin: '0 0 1px 1em',
  fontSize: '9.5px',
  lineHeight: '1.65',
}

const indentStyle: React.CSSProperties = {
  margin: '0 0 1px 2em',
  fontSize: '9.5px',
  lineHeight: '1.65',
}

type Props = {
  contract: Contract
}

export function ContractPreview({ contract }: Props) {
  const issuer = contract.issuer_snapshot
  const addressLine = [
    issuer.postal_code ? `〒${issuer.postal_code}` : null,
    issuer.address,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className="a4-paper"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm 18mm',
        boxSizing: 'border-box',
        backgroundColor: C.white,
        color: C.black,
        fontFamily: 'sans-serif',
        fontSize: '9.5px',
        lineHeight: '1.65',
      }}
    >
      {/* ── タイトル ── */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h1
          style={{
            fontSize: '15px',
            fontWeight: 'bold',
            color: C.black,
            margin: '0 0 4px',
            letterSpacing: '0.05em',
          }}
        >
          クロス貼替工事契約書
        </h1>
        <div style={{ fontSize: '8.5px', color: C.gray500 }}>
          書類番号：{contract.document_number}
        </div>
      </div>

      <div
        style={{
          borderTop: `1px solid ${C.gray300}`,
          marginBottom: '8px',
        }}
      />

      {/* ── 前文 ── */}
      <p style={{ margin: '0 0 6px', fontSize: '9.5px' }}>
        本契約は、下記条件に基づきクロス貼替工事について締結する。
      </p>

      {/* ── 第1条 ── */}
      <p style={articleHeadStyle}>第1条（工事内容）</p>
      <p style={bodyStyle}>
        甲（依頼者）は乙（施工者）に対し、下記工事を依頼し、乙はこれを請け負う。
      </p>
      <p style={indentStyle}>工事内容：事務所内クロス貼替工事</p>
      <p style={indentStyle}>施工場所：{LINE}</p>
      <p style={indentStyle}>施工範囲：壁・天井（別紙または現地確認内容による）</p>
      <p style={indentStyle}>使用材料：{LINE}（品番・メーカー等）</p>

      {/* ── 第2条 ── */}
      <p style={articleHeadStyle}>第2条（工期）</p>
      <p style={bodyStyle}>
        施工期間は、令和{LINE_NUM}年{LINE_NUM}月{LINE_NUM}日から令和{LINE_NUM}年{LINE_NUM}月{LINE_NUM}日までとする。
      </p>
      <p style={bodyStyle}>
        ただし、天候・材料入荷遅延・予期せぬ現場状況等により変更となる場合がある。
      </p>

      {/* ── 第3条 ── */}
      <p style={articleHeadStyle}>第3条（工事代金）</p>
      <p style={bodyStyle}>
        工事代金は金{LINE_SHORT}円（税込／税別）とする。
      </p>

      {/* ── 第4条 ── */}
      <p style={articleHeadStyle}>第4条（支払方法）</p>
      <p style={bodyStyle}>
        甲は乙に対し、工事完了後{LINE_NUM}日以内に下記方法で支払う。
      </p>
      <p style={indentStyle}>支払方法：現金・振込（振込手数料は甲負担）</p>
      <p style={indentStyle}>振込先：{LINE}</p>

      {/* ── 第5条 ── */}
      <p style={articleHeadStyle}>第5条（追加工事）</p>
      <p style={bodyStyle}>
        現地状況により下地補修・追加施工等が必要となった場合、甲乙協議のうえ別途費用を定める。
      </p>

      {/* ── 第6条 ── */}
      <p style={articleHeadStyle}>第6条（施工不良等）</p>
      <p style={bodyStyle}>
        乙の施工不良による剥がれ、著しい浮き等が認められた場合、乙は施工完了後{LINE_NUM}日以内に限り無償補修を行う。
      </p>
      <p style={bodyStyle}>
        ただし、建物の動き・湿気・既存下地不良等、施工以外の要因による不具合は除く。
      </p>

      {/* ── 第7条 ── */}
      <p style={articleHeadStyle}>第7条（キャンセル）</p>
      <p style={bodyStyle}>
        工事着手後のキャンセルについては、既発生費用（材料費・人工費等）を甲が負担するものとする。
      </p>

      {/* ── 締め文 ── */}
      <p
        style={{
          margin: '8px 0 6px',
          fontSize: '9.5px',
        }}
      >
        本契約の証として、本書2通を作成し、甲乙署名捺印のうえ各1通保有する。
      </p>

      {/* ── 日付欄 ── */}
      <p
        style={{
          textAlign: 'center',
          margin: '6px 0 10px',
          fontSize: '9.5px',
        }}
      >
        令和{LINE_NUM}年{LINE_NUM}月{LINE_NUM}日
      </p>

      {/* ── 署名欄 ── */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          fontSize: '9.5px',
          marginBottom: '12px',
        }}
      >
        {/* 甲（依頼者） */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>【甲（依頼者）】</div>
          <div style={{ marginBottom: '4px' }}>氏名：{LINE}</div>
          <div style={{ marginBottom: '4px' }}>住所：{LINE}</div>
          <div style={{ marginBottom: '4px' }}>　　　{LINE}</div>
          <div style={{ marginBottom: '4px' }}>署名：{LINE}</div>
        </div>

        {/* 乙（施工者） */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>【乙（施工者）】</div>
          <div style={{ marginBottom: '4px' }}>氏名（会社名）：{issuer.name}</div>
          <div style={{ marginBottom: '4px' }}>住所：{addressLine}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span>署名：{LINE_SHORT}</span>
            {/* 押印用四角枠 */}
            <div
              style={{
                width: '44px',
                height: '44px',
                border: `1px solid ${C.gray500}`,
                flexShrink: 0,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── 注意書き ── */}
      <div
        style={{
          borderTop: `1px solid ${C.gray200}`,
          paddingTop: '6px',
          fontSize: '8px',
          color: C.gray999,
        }}
      >
        ※本契約書は印紙税法上の課税文書です。契約金額に応じて収入印紙の貼付が必要です。
      </div>
    </div>
  )
}
