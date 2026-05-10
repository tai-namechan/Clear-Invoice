# UX改善リリース — 2026-05-10

コミット: `c8a47d9`  
ブランチ: `feature/5`

---

## 変更内容

### 1. 削除の高速化

**変更前の動作**
削除ボタンを押すと、サーバーアクション内で `redirect()` を実行していたため、ボタンが「削除中...」のまま「DB削除 → サーバーがリダイレクトレスポンス生成 → 一覧ページのサーバーサイドレンダリング完了」まで待ち続けていた。

**変更後の動作**
サーバーアクションはDB削除だけを行い `{ success: true }` を返す。クライアント側でレスポンスを受け取り次第 `router.push('/documents')` で即遷移する。

**対象ファイル**
- `src/app/(app)/estimates/actions.ts` — `deleteEstimateAction` から `redirect()` を削除、`revalidatePath('/documents')` を追加して `{ success: true }` を返すよう変更
- `src/app/(app)/invoices/actions.ts` — 同上（invoices版）
- `src/app/(app)/estimates/[id]/DeleteEstimateButton.tsx` — `useTransition` → `useState` + `async handleClick` + `router.push` に変更
- `src/app/(app)/invoices/[id]/DeleteInvoiceButton.tsx` — 同上（invoices版）

**ロールバック手順**
```ts
// actions.ts（estimate/invoice 両方）
// 削除: return { success: true as const }
// 復元: redirect('/estimates') or redirect('/invoices') を try の外に追加
// import { redirect } from 'next/navigation' も復元

// DeleteEstimateButton.tsx / DeleteInvoiceButton.tsx
// useState + router.push → useTransition + startTransition に戻す
```

---

### 2. 保存後の800ms人工待ちを廃止 → SavedToast

**変更前の動作**
保存成功後、フォーム上に「✓ 保存しました」トーストを表示し、`setTimeout(..., 800)` で800ms待ってからプレビューページへ遷移していた。

**変更後の動作**
保存成功後、即座に `/preview?saved=1` へ遷移。プレビューページ側で `SavedToast` コンポーネントが `?saved=1` を検知してトーストを表示し、URL から `saved` パラメータを削除する（リロードで再表示しない）。

**対象ファイル**
- `src/components/forms/EstimateForm.tsx` — `setTimeout` 削除、`router.push('/estimates/${id}/preview?saved=1')` に変更
- `src/components/forms/InvoiceForm.tsx` — 同上（invoices版）
- `src/components/ui/SavedToast.tsx` — 新規作成。`useSearchParams` で `?saved=1` を検知してトーストを3秒表示
- `src/app/(app)/estimates/[id]/preview/page.tsx` — `<Suspense><SavedToast /></Suspense>` を追加
- `src/app/(app)/invoices/[id]/preview/page.tsx` — 同上

**ロールバック手順**
```tsx
// EstimateForm.tsx / InvoiceForm.tsx
// 復元: setToast({ type: 'success', text: '保存しました' }) を追加し
//       setTimeout(() => router.push(`/.../${id}/preview`), 800) に戻す

// preview/page.tsx 両方
// <Suspense><SavedToast /></Suspense> の行を削除

// SavedToast.tsx は削除してよい
```

---

### 3. 見積書の振込先を非表示

**変更前の動作**
`DocumentPreview` コンポーネントが見積書・請求書を問わず振込先セクションを表示していた。

**変更後の動作**
`!isEstimate` 条件を追加し、見積書のプレビューでは振込先を表示しない。

**対象ファイル**
- `src/components/preview/DocumentPreview.tsx` — L261 の条件を `{bankLine &&` から `{!isEstimate && bankLine &&` に変更

**ロールバック手順**
```tsx
// DocumentPreview.tsx の該当行を元に戻す
{/* !isEstimate && */ bankLine && (
```

---

## 不具合が起きた場合の即時対応

```bash
# このコミット一つを丸ごと取り消す場合
git revert c8a47d9

# 特定ファイルだけ一つ前のコミットに戻す場合
git checkout 9b22223 -- src/components/preview/DocumentPreview.tsx
```
