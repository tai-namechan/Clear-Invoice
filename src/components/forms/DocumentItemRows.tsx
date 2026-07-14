'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils/currency'
import { toSignedIntegerOnly } from '@/lib/utils/numericInput'

export type ItemRow = {
    name: string
    quantity: string
    unit: string
    unit_price: string
    notes: string
}

const emptyRow: ItemRow = { name: '', quantity: '1', unit: '', unit_price: '0', notes: '' }

type Props = {
    initial?: ItemRow[]
}

export function DocumentItemRows({ initial }: Props) {
    const [rows, setRows] = useState<ItemRow[]>(
        initial && initial.length > 0 ? initial : [{ ...emptyRow }]
    )

    const updateRow = (idx: number, field: keyof ItemRow, value: string) => {
        setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)))
    }

    const addRow = () => {
        setRows((prev) => [...prev, { ...emptyRow }])
    }

    const removeRow = (idx: number) => {
        setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev))
    }

    const calcAmount = (row: ItemRow) => {
        const q = parseFloat(row.quantity) || 0
        const p = parseFloat(row.unit_price) || 0
        return Math.round(q * p)
    }

    const total = rows.reduce((sum, r) => sum + calcAmount(r), 0)

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {rows.map((row, idx) => (
                    <div
                        key={idx}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">明細 #{idx + 1}</span>
                            {rows.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeRow(idx)}
                                    className="text-xs text-red-600 hover:text-red-700"
                                >
                                    削除
                                </button>
                            )}
                        </div>

                        <Input
                            name={`item_name_${idx}`}
                            label="品名"
                            value={row.name}
                            onChange={(e) => updateRow(idx, 'name', e.target.value)}
                            required
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                name={`item_quantity_${idx}`}
                                label="数量"
                                type="number"
                                inputMode="decimal"
                                numericMode="decimal" 
                                step="0.01"
                                value={row.quantity}
                                onChange={(e) => updateRow(idx, 'quantity', e.target.value)}
                            />
                            <Input
                                name={`item_unit_${idx}`}
                                label="単位"
                                placeholder="m²、式 など"
                                value={row.unit}
                                onChange={(e) => updateRow(idx, 'unit', e.target.value)}
                            />
                        </div>

                        <Input
                            name={`item_unit_price_${idx}`}
                            label="単価（円）"
                            type="text"
                            inputMode="numeric"
                            value={row.unit_price}
                            onChange={(e) =>
                                updateRow(idx, 'unit_price', toSignedIntegerOnly(e.target.value))
                            }
                        />

                        <Input
                            name={`item_notes_${idx}`}
                            label="備考"
                            value={row.notes}
                            onChange={(e) => updateRow(idx, 'notes', e.target.value)}
                        />

                        <div className="text-right">
                            <span className="text-xs text-gray-500">小計: </span>
                            <span className="text-base font-medium text-gray-900">
                                ￥{formatCurrency(calcAmount(row))}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <Button type="button" variant="secondary" onClick={addRow} className="w-full">
                + 明細を追加
            </Button>

            <div className="bg-gray-900 text-white rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm">合計</span>
                <span className="text-xl font-bold">￥{formatCurrency(total)}</span>
            </div>

            {/* 件数を hidden で送信 */}
            <input type="hidden" name="item_count" value={rows.length} />
        </div>
    )
}
