'use client'

import { forwardRef, InputHTMLAttributes, useState, useEffect } from 'react'
import {
  toNumericOnly,
  toIntegerOnly,
  toPhoneOrPostalFormat,
} from '@/lib/utils/numericInput'

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label?: string
  error?: string
  hint?: string
  /**
   * 自動半角変換モード
   * - integer: 整数のみ（金額、数量など）
   * - decimal: 数字 + 小数点
   * - phone: 数字 + ハイフン
   * - none: 変換しない
   */
  numericMode?: 'integer' | 'decimal' | 'phone' | 'none'
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, id, className = '', numericMode, type, defaultValue, value, onChange, ...props },
    ref
  ) => {
    // numericMode が指定されているか、type が number/tel の場合は自動変換有効
    const autoMode: InputProps['numericMode'] =
      numericMode ??
      (type === 'tel'
        ? 'phone'
        : type === 'number'
        ? 'integer'
        : 'none')

    // 制御コンポーネントとして扱う（自動変換のため）
    const isControlled = value !== undefined
    const [internalValue, setInternalValue] = useState<string>(
      String(defaultValue ?? '')
    )

    useEffect(() => {
      if (!isControlled) {
        setInternalValue(String(defaultValue ?? ''))
      }
    }, [defaultValue, isControlled])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let next = e.target.value

      if (autoMode === 'integer') {
        next = toIntegerOnly(next)
      } else if (autoMode === 'decimal') {
        next = toNumericOnly(next)
      } else if (autoMode === 'phone') {
        next = toPhoneOrPostalFormat(next)
      }

      // 値を書き換えてから親に伝える
      e.target.value = next
      if (!isControlled) {
        setInternalValue(next)
      }
      onChange?.(e)
    }

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type={type === 'number' ? 'text' : type}
          inputMode={
            autoMode === 'integer' || autoMode === 'decimal'
              ? 'numeric'
              : autoMode === 'phone'
              ? 'tel'
              : props.inputMode
          }
          value={isControlled ? value : internalValue}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${className}`}
          {...props}
        />
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
