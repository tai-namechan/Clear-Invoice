/**
 * 数値を「1,234,567」形式の文字列にフォーマット
 */
export function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) return '0'
    return value.toLocaleString('ja-JP')
  }
  
  /**
   * 数値を「￥1,234,567」形式にフォーマット
   */
  export function formatYen(value: number | null | undefined): string {
    return `￥${formatCurrency(value)}`
  }
