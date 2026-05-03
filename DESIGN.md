# Clear Invoice — 設計書

> 免税事業者向けのシンプルな見積書・請求書作成アプリ
> キャッチコピー: 手書きを卒業し、自動化へ。

最終更新: 2026-05-02

---

## 1. プロジェクト概要

### 1.1 目的
手書き（コクヨ ウ-302/ウ-306 等の複写式伝票）で行っている見積書・請求書の作成を、スマホからの入力で完結させ、PDFとして共有・保存できるようにする。

### 1.2 想定ユーザー
- 免税事業者（個人事業主・小規模事業者）
- 業種: 内装業（クロス・床CF施工等）。ただし汎用的に使える設計
- 主な利用シーン: 現場や移動中にスマホから入力 → 取引先にPDFを共有

### 1.3 やらないこと（明示）
- インボイス制度対応・適格請求書発行事業者番号
- 消費税計算・税率別集計
- 月日列・開始日/終了日・日別明細
- 取引先マスタ・品名マスタ
- 案件（プロジェクト）グルーピング
- 見積書 → 請求書の自動変換
- 印鑑のON/OFF切り替え（常に印鑑エリアあり、画像があれば表示）
- 印刷物向けの細かい調整（PDFで完結）

---

## 2. 技術スタック

| 領域 | 採用技術 |
|---|---|
| フロントエンド | Next.js 16 (App Router) + TypeScript |
| スタイル | Tailwind CSS v4 |
| バックエンド (BaaS) | Supabase（Auth + Postgres + Storage） |
| PDF生成 | @react-pdf/renderer |
| バリデーション | zod |
| デプロイ | Vercel |
| 開発支援 | Claude Code |

---

## 3. アーキテクチャ

### 3.1 レイヤー構成（厳守）

依存方向は一方向: **画面 → Service → Repository → Supabase**

```
src/app/  (画面・APIルート)        ← Service だけを呼ぶ
       ↓
src/lib/services/  (ビジネスロジック)  ← Repository を組み合わせる
       ↓
src/lib/repositories/  (DBアクセス)   ← Supabaseを叩くのはここだけ
       ↓
   Supabase
```

#### 各層の責務

**画面層 (`src/app/`)**
- UIの組み立て、フォームの状態管理
- Service層を呼んで処理を依頼
- Repositoryやsupabaseクライアントを直接呼ばない

**Service層 (`src/lib/services/`)**
- ビジネスルールの集約
  - 「自社情報未設定なら発行できない」
  - 「発行時にスナップショットを作成する」
  - 「書類番号を採番する」
- Repositoryを組み合わせて業務処理を実現
- バリデーションは zod スキーマを呼んで実施

**Repository層 (`src/lib/repositories/`)**
- DBアクセスのみ
- バリデーション・業務判断は持たない
- Supabaseクライアントを使うのはこの層だけ

### 3.2 スナップショット方針（重要）

書類を作成・発行する瞬間に、**自社情報** と **取引先情報** を JSON でテーブルにコピー保存する。

| カラム | 内容 |
|---|---|
| `issuer_snapshot` | 発行時点の自社情報全部（住所、振込先、印影URL等） |
| `client_snapshot` | 発行時点の取引先情報全部（名前、住所、敬称等） |

**理由:**
- 後から自社情報や取引先名を変えても、過去書類の表示は当時のまま保たれる
- 取引履歴としての正確性が担保される

**ルール:**
- PDF生成・詳細表示時はスナップショットを参照する。`my_company` を直接参照しない
- スナップショット作成は Service層 の責務

### 3.3 日付の扱い

- **DB保存**: `date` 型（西暦、ISO 8601 / `YYYY-MM-DD`）
- **画面・PDF表示**: 和暦（例「令和8年3月31日」「R8年3月31日」）
- **入力UI**: HTML の `<input type="date">` で西暦受付、表示時に和暦変換

変換ユーティリティ `src/lib/utils/wareki.ts` で一元管理。

理由:
- 改元時に表示だけ切り替えればよく、データ移行不要
- ソート・期限計算が普通の `date` 演算でできる
- 他システム連携・エクスポートが容易

### 3.4 バリデーション

- すべての入力を zod スキーマで検証
- スキーマは `src/lib/schemas/` に集約
- 同じスキーマをフォーム側とサーバーアクション側の両方で使う（フロント/バック整合性の担保）

---

## 4. 機能要件

### 4.1 認証
- メールアドレス + パスワード（Supabase Auth）
- サインアップ後、メール確認は任意（開発段階では無効でも可）
- 未ログイン時は `/login` にリダイレクト（`middleware.ts`）

### 4.2 自社情報の設定（`/settings`）
- 1ユーザー1レコード
- 入力項目:
  - 会社名・屋号
  - 代表者名
  - 郵便番号
  - 住所
  - 電話番号
  - メールアドレス
  - 振込先（銀行名、支店名、口座種別、口座番号、口座名義）
  - 印影画像（任意、Storageの `seals` バケットにアップロード）

### 4.3 見積書（`/estimates`）
- 一覧画面（新しい順）
- 作成画面（`/estimates/new`）
- 詳細・編集画面（`/estimates/[id]`）
- PDFダウンロード（`/estimates/[id]/pdf`）

### 4.4 請求書（`/invoices`）
- 一覧画面（新しい順）
- 作成画面（`/invoices/new`）
- 詳細・編集画面（`/invoices/[id]`）
- PDFダウンロード（`/invoices/[id]/pdf`）

### 4.5 ダッシュボード（`/`）
- 最近の見積書・請求書を数件ずつ表示
- 自社情報未設定時は設定への誘導

### 4.6 共通仕様
- 取引先・品名は **毎回手入力**（マスタなし）
- 明細は「品名・数量・単位・単価・金額・備考」のみ
- 消費税は表記しない（明細金額・合計のみ）
- 書類番号は発行時に自動採番
  - 見積書: `E-{YYYY}-{NNNN}` 例: `E-2026-0001`
  - 請求書: `I-{YYYY}-{NNNN}` 例: `I-2026-0001`
- 印鑑エリアはPDFに常に表示。印影画像があれば自動配置、なければ空欄（手押し用）

---

## 5. データベース設計

### 5.1 テーブル一覧

| 系統 | テーブル | 役割 |
|---|---|---|
| Auth | `auth.users` | Supabase Authが自動管理 |
| Setting | `my_company` | 自社情報（1ユーザー1件） |
| Transactions | `estimates` | 見積書ヘッダ |
| Transactions | `invoices` | 請求書ヘッダ |
| Transactions | `document_items` | 明細（見積・請求共通） |
| File | `document_files` | 生成済PDFの参照 |

**スナップショットは別テーブルではなく、`estimates`/`invoices` の JSON カラムとして持つ。**

### 5.2 テーブル定義

#### my_company（Setting系）

```sql
create table my_company (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  name text not null,
  representative_name text,
  postal_code text,
  address text,
  tel text,
  email text,
  bank_name text,
  bank_branch text,
  bank_account_type text,
  bank_account_number text,
  bank_account_holder text,
  seal_image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

#### estimates（Transactions系）

```sql
create table estimates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_number text not null,
  issue_date date not null,
  client_name text not null,
  client_honorific text default '様',
  client_postal_code text,
  client_address text,
  subject text,
  subtotal numeric(12,0) not null default 0,
  total numeric(12,0) not null default 0,
  notes text,
  issuer_snapshot jsonb not null,
  client_snapshot jsonb not null,
  status text not null default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

#### invoices（Transactions系）

```sql
create table invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_number text not null,
  issue_date date not null,
  due_date date,
  client_name text not null,
  client_honorific text default '御中',
  client_postal_code text,
  client_address text,
  subject text,
  subtotal numeric(12,0) not null default 0,
  total numeric(12,0) not null default 0,
  notes text,
  issuer_snapshot jsonb not null,
  client_snapshot jsonb not null,
  status text not null default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

#### document_items（見積・請求共通）

```sql
create table document_items (
  id uuid primary key default gen_random_uuid(),
  document_type text not null check (document_type in ('estimate', 'invoice')),
  document_id uuid not null,
  sort_order int not null default 0,
  name text not null,
  quantity numeric(12,2) not null default 1,
  unit text,
  unit_price numeric(12,0) not null default 0,
  amount numeric(12,0) not null default 0,
  notes text
);
```

#### document_files（File系）

```sql
create table document_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null check (document_type in ('estimate', 'invoice')),
  document_id uuid not null,
  storage_path text not null,
  file_name text not null,
  generated_at timestamptz default now()
);
```

### 5.3 RLS（Row Level Security）

すべてのテーブルでRLSを有効化。`user_id = auth.uid()` の行のみアクセス可能。
`document_items` は親書類（estimates/invoices）の所有者を遡って判定。

### 5.4 Supabase Storage

| バケット | 用途 | 公開 |
|---|---|---|
| `seals` | 印影画像 | 非公開 |
| `documents` | 生成PDF | 非公開 |

パス構造: `{user_id}/...` でユーザー分離（Storage RLSで保護）。

---

## 6. ディレクトリ構成

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
        page.tsx
        new/page.tsx
        [id]/page.tsx
        [id]/pdf/route.ts
      invoices/
        page.tsx
        new/page.tsx
        [id]/page.tsx
        [id]/pdf/route.ts
      settings/
        page.tsx
  components/
    ui/                           # ボタン、入力、カード等
    forms/                        # 書類フォーム
    pdf/                          # PDFテンプレート
  lib/
    supabase/
      client.ts                   # ブラウザ用
      server.ts                   # サーバー用
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
      wareki.ts                   # 西暦↔和暦
      currency.ts                 # 金額フォーマット
    pdf/
      EstimatePdf.tsx
      InvoicePdf.tsx
      registerFonts.ts            # Noto Sans JP登録
  types/
    db.ts
    domain.ts
  middleware.ts
public/
  fonts/
    NotoSansJP-Regular.ttf
    NotoSansJP-Bold.ttf
```

---

## 7. PDF設計

### 7.1 共通要件
- A4縦
- 日本語フォント: **Noto Sans JP** (ttf) を `public/fonts/` から `Font.register()` で登録
- すべての `<Text>` で `fontFamily: 'NotoSansJP'` を指定（標準フォントは使わない）

### 7.2 レイアウト方針
コクヨ ウ-302（請求書）/ ウ-306（見積書）の手書きフォーマットを参考に、以下を含める。

**ヘッダー部:**
- 左上: タイトル（「請求書」または「御見積書」）、発行日（和暦）、書類番号
- 中央左: 宛先（client_name + 敬称）、宛先住所
- 右上: 自社情報（snapshot から: 会社名・代表者名・住所・電話番号）
- 印鑑エリア: 自社情報の右下に常に確保。`seal_image_url` があれば印影を表示、なければ空欄

**金額サマリー:**
- 「税込合計金額」の見出し（実態は税別記載なしの単純合計）と、合計額を大きく表示

**明細テーブル:**
- 列: 品名 / 数量 / 単位 / 単価 / 金額 / 備考
- 行は明細件数分。空欄行は埋めない（手書き伝票と異なり、必要な行だけ表示）

**フッター:**
- 振込先（snapshot から: 銀行名・支店名・口座種別・口座番号・口座名義）
- 備考（notes）

### 7.3 生成フロー
1. 画面から「PDFダウンロード」「PDFを保存」をリクエスト
2. APIルートで `pdfService.generate()` を呼ぶ
3. Service が必要なデータ（書類本体・明細・スナップショット）を取得
4. `@react-pdf/renderer` で PDF バッファを生成
5. Supabase Storage `documents/{user_id}/...` にアップロード
6. `document_files` にメタデータ保存
7. レスポンスとしてPDFを返す

---

## 8. 文字化け対策

| レイヤー | 対策 |
|---|---|
| ソースコード・HTML | UTF-8 |
| DB | UTF-8（Supabaseデフォルト） |
| PDF | **Noto Sans JP を必ず埋め込む**（最重要） |

---

## 9. セキュリティ

- 全テーブルで RLS 有効
- Storage（`seals`, `documents`）は `{user_id}/` 配下のみアクセス可
- API Route では必ず `auth.getUser()` で認証確認後に処理
- `service_role` キーはクライアント側で使わない（今回のアプリでは使う必要がない）
- `.env.local` は Git 管理から除外

---

## 10. 実装の進め方

優先順位順:

1. **Supabaseクライアントの設定** + 認証ミドルウェア
2. **ログイン・サインアップ画面**
3. **共通UIコンポーネント・和暦変換ユーティリティ**
4. **自社情報設定画面**（印影アップロード含む）
5. **見積書: 一覧 → 作成 → 詳細・編集**
6. **見積書のPDF生成**（フォント取得・配置含む）
7. **請求書**（見積書をベースに調整）
8. **ダッシュボード**
9. **デプロイ（Vercel）**

各ステップで動作確認してから次に進む。

---

## 11. 拡張余地（将来的に検討可）

現バージョンには含めないが、後で追加しやすい構造を持つもの:

- 取引先マスタ（`clients` テーブル追加 → 既存スナップショット方針と整合）
- 品名マスタ（`items` テーブル追加）
- 案件（プロジェクト）グルーピング
- 見積書 → 請求書への自動変換
- 売上集計・月次レポート
- 取引先別 PDF 一括ダウンロード
- LINE / メール送信連携
