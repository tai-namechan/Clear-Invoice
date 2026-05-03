# Clear Invoice — プロジェクト指針

## アプリ概要
免税事業者向けのシンプルな見積書・請求書作成アプリ。スマホからの入力を主用途とし、PDFを生成して共有・保存する。インボイス制度には対応しない。消費税の表記もしない（金額のみ）。

業種は内装業（クロス・床CF等）。手書きフォーマット（コクヨ ウ-302/ウ-306）の代替。

キャッチコピー: 手書きを卒業し、自動化へ。

## 技術スタック
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Supabase（Auth + Postgres + Storage）
- @react-pdf/renderer（PDF生成）
- zod（バリデーション）
- Vercel（デプロイ）

## アーキテクチャ原則

### レイヤー分離（厳守）
依存方向は一方向: **画面 → Service → Repository → Supabase**

- `src/app/`（画面・APIルート）は Service だけを呼ぶ。Repository を直接呼ばない。Supabaseクライアントを直接使わない。
- `src/lib/services/`（Service層）にビジネスロジック・ルールを集約する。Repository を組み合わせて業務処理を実現する。
- `src/lib/repositories/`（Repository層）はDBアクセスのみ。バリデーションや業務判断はしない。Supabaseを叩くのはここだけ。
- 横断的な型は `src/types/` に置く。

### スナップショット方針（重要）
書類を作成・発行する瞬間に、自社情報を `issuer_snapshot`、取引先情報を `client_snapshot` に **JSON でコピー保存** する。
- PDF・詳細表示時は必ずスナップショットを参照する。`my_company` を直接参照しない。
- これにより、後から自社情報や取引先名を変えても過去書類の表示は影響を受けない。
- スナップショット作成は Service 層の責務。

### 日付の扱い
- DBは `date` 型（西暦）で保存。
- 画面・PDFの表示は **和暦**（例: 「令和8年3月31日」「R8年3月31日」）。
- 変換ユーティリティ `src/lib/utils/wareki.ts` で一元化。
- 入力フォームは西暦のdate inputで受け、表示時に和暦変換。

### バリデーション
- 入力は zod スキーマで検証する。
- スキーマは `src/lib/schemas/` に集約する。
- 同じスキーマをフォーム側とサーバーアクション側の両方で使う。

## 仕様

### 機能
- ユーザー認証（メール+パスワード、Supabase Auth）
- 自社情報の設定（1ユーザー1レコード、設定画面で編集）
  - 印影画像のアップロード（Supabase Storage `seals` バケット）
- 見積書の作成・編集・一覧・PDF生成
- 請求書の作成・編集・一覧・PDF生成
- 見積書と請求書は独立。互いに変換やリンクはしない。
- **取引先マスタは持たない。毎回手入力。**
- **品名マスタは持たない。毎回手入力。**
- 明細は「品名・数量・単位・単価・金額・備考」のみ。**月日・開始日・終了日・日別明細は持たない。**
- 消費税の表記なし。明細の金額と合計のみ。
- 書類番号は発行時に採番（見積書: `E-2026-0001`、請求書: `I-2026-0001`、年内連番）。
- **印鑑エリアは両書類のPDFに常に表示**。`my_company.seal_image_url` に画像があれば自動配置、なければ空欄（手押し用）。
- 生成PDFは Supabase Storage `documents` バケットに保存し、`document_files` テーブルで管理。

### UI / UX
- スマホ優先（モバイルファースト）。Tailwindの `sm:` `md:` でPC対応。
- 明細入力はカード型の縦積み。`+ 明細を追加` ボタン。
- 表示時の数値はカンマ区切り（`toLocaleString('ja-JP')`）。フォーム入力中はプレーン。
- 日付は和暦表示（例「令和8年3月31日」）。

### PDF
- A4縦。
- 日本語フォントは Noto Sans JP の ttf を `public/fonts/` に配置して `Font.register()` で登録して使用。**PDFテンプレートでは必ずこのフォントを指定する**。標準フォントは使わない（文字化けの原因）。
- ttf の入手は信頼できる経路で配置する（fontsourceのwoff2をttfに変換、もしくは公式のttfを直接取得）。
- レイアウトはコクヨ ウ-302（請求書）/ウ-306（見積書）の手書きフォーマットを参考に、見やすく整える。
- ヘッダー: タイトル（「請求書」/「御見積書」）、日付（和暦）、書類番号、宛先（クライアント名 + 敬称）、自社情報（右上、印鑑エリア含む）。
- 「税込合計金額」（実態は税表記なしの単純合計）を大きく表示。
- 明細テーブル: 品名・数量・単位・単価・金額・備考。
- フッター: 振込先（自社情報スナップショットから）、備考。

### セキュリティ
- 全テーブルで RLS 有効。`user_id = auth.uid()` の行だけアクセス可。
- Storage（seals, documents バケット）も `{user_id}/...` のパス構造でユーザー分離。
- Repository では Server Component / Server Action / Route Handler 用の Supabaseクライアントを使い、Cookieベースで認証情報を引き継ぐ（`@supabase/ssr`）。
- API Route では必ず `auth.getUser()` で認証確認してから処理を行う。

## ディレクトリ構成
```
src/
  app/
    (auth)/
      login/page.tsx
      signup/page.tsx
    (app)/
      layout.tsx                  # ログイン必須レイアウト
      page.tsx                    # ダッシュボード
      estimates/
        page.tsx                  # 見積書一覧
        new/page.tsx              # 見積書作成
        [id]/page.tsx             # 詳細・編集
        [id]/pdf/route.ts         # PDF生成
      invoices/
        page.tsx                  # 請求書一覧
        new/page.tsx              # 請求書作成
        [id]/page.tsx             # 詳細・編集
        [id]/pdf/route.ts         # PDF生成
      settings/
        page.tsx                  # 自社情報設定
  components/
    ui/                           # ボタン、入力、カードなど汎用
    forms/                        # 書類フォーム
    pdf/                          # PDFテンプレート
  lib/
    supabase/
      client.ts                   # ブラウザ用クライアント
      server.ts                   # サーバー用クライアント
    repositories/
      myCompanyRepository.ts
      estimateRepository.ts
      invoiceRepository.ts
      documentItemRepository.ts
      documentFileRepository.ts
    services/
      myCompanyService.ts
      estimateService.ts
      invoiceService.ts
      documentNumberService.ts    # 書類番号採番
      pdfService.ts                # PDF生成・Storage保存
    schemas/
      myCompany.ts
      estimate.ts
      invoice.ts
    utils/
      wareki.ts                   # 西暦↔和暦変換
      currency.ts                 # 金額フォーマット
    pdf/
      EstimatePdf.tsx
      InvoicePdf.tsx
      registerFonts.ts            # Noto Sans JP 登録
  types/
    db.ts                         # DBの型
    domain.ts                     # ドメインの型
  middleware.ts                   # 認証ミドルウェア
```

## 文字化け対策
- ソースコード・HTMLはUTF-8。
- DBはUTF-8（Supabaseデフォルト）。
- **PDFは Noto Sans JP を必ず埋め込む**。`registerFonts.ts` でアプリ起動時に登録し、全 `<Text>` 要素で `style={{ fontFamily: 'NotoSansJP' }}` を指定。

## 実装の進め方
1. Supabaseクライアントの設定（`src/lib/supabase/`）と認証ミドルウェア
2. ログイン・サインアップ画面
3. 共通UIコンポーネント、和暦変換ユーティリティ
4. 自社情報の設定画面（my_companyのCRUD、印影アップロード）
5. 見積書の一覧・作成・編集
6. 見積書のPDF生成（fontの取得・配置含む）
7. 請求書（見積書をベースに調整）
8. ダッシュボード

## やらないこと（明示）
- インボイス対応・適格請求書発行事業者番号
- 消費税計算・税率別集計
- 開始日終了日・日別明細・月日列
- 取引先マスタ
- 品名マスタ
- 案件（プロジェクト）グルーピング
- 見積書から請求書への変換
- 印鑑のON/OFF切り替え（常に印鑑エリアあり、画像があれば表示）
- 印刷向けの細かい調整（PDFで完結）
