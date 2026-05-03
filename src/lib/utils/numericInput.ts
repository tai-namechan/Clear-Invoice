/**
 * 全角数字・記号を半角に変換し、数字以外の文字を除去（ハイフン・ピリオドは残す）
 */
export function toHalfWidthDigits(value: string): string {
    return value
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
      .replace(/[‐－―ー−]/g, '-')
      .replace(/．/g, '.')
      .replace(/[，、]/g, '')
  }
  
  /**
   * 数字のみ（小数点とマイナス除外）に正規化
   */
  export function toNumericOnly(value: string): string {
    return toHalfWidthDigits(value).replace(/[^0-9.]/g, '')
  }
  
  /**
   * 整数のみ（小数点も除外）
   */
  export function toIntegerOnly(value: string): string {
    return toHalfWidthDigits(value).replace(/[^0-9]/g, '')
  }
  
  /**
   * 電話番号・郵便番号用（数字とハイフンのみ）
   */
  export function toPhoneOrPostalFormat(value: string): string {
    return toHalfWidthDigits(value).replace(/[^0-9-]/g, '')
  }
