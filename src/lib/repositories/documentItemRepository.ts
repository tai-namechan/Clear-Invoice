import type { SupabaseClient } from '@supabase/supabase-js'
import type { DocumentItem } from '@/types/db'

type DocumentType = 'estimate' | 'invoice'

type CreateDocumentItemPayload = {
  sort_order: number
  name: string
  quantity: number
  unit: string | null
  unit_price: number
  amount: number
  notes: string | null
}

export const documentItemRepository = {
  async findByDocument(
    supabase: SupabaseClient,
    documentType: DocumentType,
    documentId: string
  ): Promise<DocumentItem[]> {
    const { data, error } = await supabase
      .from('document_items')
      .select('*')
      .eq('document_type', documentType)
      .eq('document_id', documentId)
      .order('sort_order', { ascending: true })

    if (error) throw new Error(`明細の取得に失敗しました: ${error.message}`)
    return (data ?? []) as DocumentItem[]
  },

  async bulkCreate(
    supabase: SupabaseClient,
    documentType: DocumentType,
    documentId: string,
    items: CreateDocumentItemPayload[]
  ): Promise<void> {
    if (items.length === 0) return

    const rows = items.map((item) => ({
      document_type: documentType,
      document_id: documentId,
      ...item,
    }))

    const { error } = await supabase.from('document_items').insert(rows)

    if (error) throw new Error(`明細の保存に失敗しました: ${error.message}`)
  },

  async deleteByDocument(
    supabase: SupabaseClient,
    documentType: DocumentType,
    documentId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('document_items')
      .delete()
      .eq('document_type', documentType)
      .eq('document_id', documentId)

    if (error) throw new Error(`明細の削除に失敗しました: ${error.message}`)
  },

  /**
   * 全置き換え（編集時に既存を消して新規挿入）
   */
  async replaceForDocument(
    supabase: SupabaseClient,
    documentType: DocumentType,
    documentId: string,
    items: CreateDocumentItemPayload[]
  ): Promise<void> {
    await this.deleteByDocument(supabase, documentType, documentId)
    await this.bulkCreate(supabase, documentType, documentId, items)
  },
}
