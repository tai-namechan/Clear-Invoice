/**
 * Supabaseのテーブル構造に対応する型
 */

export type MyCompany = {
    id: string
    user_id: string
    name: string
    representative_name: string | null
    postal_code: string | null
    address: string | null
    tel: string | null
    email: string | null
    bank_name: string | null
    bank_branch: string | null
    bank_account_type: string | null
    bank_account_number: string | null
    bank_account_holder: string | null
    created_at: string
    updated_at: string
  }
  
  export type Estimate = {
    id: string
    user_id: string
    document_number: string
    issue_date: string
    target_month: string | null
    client_name: string
    client_honorific: string | null
    client_postal_code: string | null
    client_address: string | null
    subject: string | null
    subtotal: number
    total: number
    notes: string | null
    issuer_snapshot: IssuerSnapshot
    client_snapshot: ClientSnapshot
    created_at: string
    updated_at: string
  }

  export type Invoice = {
    id: string
    user_id: string
    document_number: string
    issue_date: string
    target_month: string | null     // ← due_date を削除し、これを追加
    client_name: string
    client_honorific: string | null
    client_postal_code: string | null
    client_address: string | null
    subject: string | null
    subtotal: number
    total: number
    notes: string | null
    total_label: string             // ← 追加
    issuer_snapshot: IssuerSnapshot
    client_snapshot: ClientSnapshot
    created_at: string
    updated_at: string
  }
  
  export type DocumentItem = {
    id: string
    document_type: 'estimate' | 'invoice'
    document_id: string
    sort_order: number
    name: string
    quantity: number
    unit: string | null
    unit_price: number
    amount: number
    notes: string | null
  }
  
  export type DocumentFile = {
    id: string
    user_id: string
    document_type: 'estimate' | 'invoice'
    document_id: string
    storage_path: string
    file_name: string
    generated_at: string
  }
  
  /**
   * スナップショット（JSONとして保存される構造）
   */
  
  export type IssuerSnapshot = {
    name: string
    representative_name: string | null
    postal_code: string | null
    address: string | null
    tel: string | null
    email: string | null
    bank_name: string | null
    bank_branch: string | null
    bank_account_type: string | null
    bank_account_number: string | null
    bank_account_holder: string | null
  }
  
  export type ClientSnapshot = {
    name: string
    honorific: string | null
    postal_code: string | null
    address: string | null
  }
