/**
 * 西暦のDateを和暦の文字列に変換する
 */

type WarekiEra = {
    name: string       // 「令和」
    shortName: string  // 「R」
    startYear: number
    startMonth: number
    startDay: number
  }
  
  const ERAS: WarekiEra[] = [
    { name: '令和', shortName: 'R', startYear: 2019, startMonth: 5, startDay: 1 },
    { name: '平成', shortName: 'H', startYear: 1989, startMonth: 1, startDay: 8 },
    { name: '昭和', shortName: 'S', startYear: 1926, startMonth: 12, startDay: 25 },
  ]
  
  /**
   * Date または ISO日付文字列を和暦オブジェクトに変換
   */
  export function toWareki(input: Date | string | null | undefined): {
    era: string
    shortEra: string
    year: number
    month: number
    day: number
  } | null {
    if (!input) return null
  
    const date = typeof input === 'string' ? new Date(input) : input
    if (isNaN(date.getTime())) return null
  
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
  
    for (const era of ERAS) {
      const eraStart = new Date(era.startYear, era.startMonth - 1, era.startDay)
      if (date >= eraStart) {
        return {
          era: era.name,
          shortEra: era.shortName,
          year: year - era.startYear + 1,
          month,
          day,
        }
      }
    }
  
    return null
  }
  
  /**
   * 「令和8年3月31日」形式
   */
  export function formatWarekiLong(input: Date | string | null | undefined): string {
    const w = toWareki(input)
    if (!w) return ''
    const yearStr = w.year === 1 ? '元' : String(w.year)
    return `${w.era}${yearStr}年${w.month}月${w.day}日`
  }
  
  /**
   * 「R8.3.31」形式（コンパクト）
   */
  export function formatWarekiShort(input: Date | string | null | undefined): string {
    const w = toWareki(input)
    if (!w) return ''
    return `${w.shortEra}${w.year}.${w.month}.${w.day}`
  }
  
  /**
   * Dateを yyyy-MM-dd（input[type=date]用）に変換
   */
  export function toDateInputValue(input: Date | string | null | undefined): string {
    if (!input) return ''
    const date = typeof input === 'string' ? new Date(input) : input
    if (isNaN(date.getTime())) return ''
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
/**
 * "YYYY-MM" 形式の文字列を「令和8年5月」に変換
 */
export function formatWarekiYearMonth(input: string | null | undefined): string {
  if (!input) return ''
  // "2026-05" → Date化
  const [yStr, mStr] = input.split('-')
  if (!yStr || !mStr) return ''
  const date = new Date(parseInt(yStr, 10), parseInt(mStr, 10) - 1, 1)
  if (isNaN(date.getTime())) return ''
  const w = toWareki(date)
  if (!w) return ''
  const yearStr = w.year === 1 ? '元' : String(w.year)
  return `${w.era}${yearStr}年${w.month}月`
}
