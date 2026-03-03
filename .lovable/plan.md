
# フレンドコード（ユーザーID）で友達追加できるようにする

## 概要
現在の連絡先システムは、名前と関係性を手入力するだけの「メモ帳」状態。これを、各ユーザーに固有のフレンドコード（例: `SL-A3X9K2`）を割り振り、コードを入力して実際のユーザー同士を紐づけるシステムに改修する。

## 仕組み

```text
ユーザーA (コード: SL-A3X9K2)
    |
    | Bのコードを入力して友達追加
    v
ユーザーB (コード: SL-M7P4R1)
    |
    | 自動的に双方向の紐づけ（AがBを追加したらBにもAが表示される）
    v
被災時: お互いの位置情報・避難状況がリアルタイムで見える
```

## 変更内容

### 1. データベース変更

**profiles テーブルにフレンドコードを追加:**
- `friend_code` カラム（TEXT, UNIQUE, NOT NULL）を追加
- 既存ユーザー含め、サインアップ時に自動生成（例: `SL-` + ランダム6文字英数字）
- `handle_new_user()` トリガー関数を更新してコード自動発行

**contacts テーブルを改修:**
- `contact_user_id` カラム（UUID）を追加 — 追加された相手ユーザーのID
- 友達追加時に双方向レコードを作成（AがBを追加 → A→BとB→Aの2行）

**RLSポリシー:**
- profiles: フレンドコードで他ユーザーを検索できるようSELECTポリシーを追加（friend_codeカラムのみ）
- contacts: 既存ポリシーはそのまま（自分のcontactsのみ操作可能）

### 2. フレンドコード生成関数

データベース関数 `generate_friend_code()` を作成。`SL-` + ランダム6文字の英数字大文字を生成し、ユニーク制約で衝突を防ぐ。

### 3. フロントエンド変更

**設定画面（Settings.tsx）:**
- アカウントセクションに自分のフレンドコードを表示
- コピーボタン付き（タップでクリップボードにコピー）

**連絡先画面（Contacts.tsx）:**
- 「追加」ダイアログを改修:
  - フレンドコード入力欄（例: `SL-A3X9K2`）
  - 関係性の選択
  - コード入力 → ユーザー検索 → 名前を表示して確認 → 追加
- 名前はprofilesのdisplay_nameを自動取得（手入力不要）

**ContactCard.tsx:**
- contact_user_idが紐づいている場合、相手のprofileからdisplay_nameを表示

**useContacts.ts:**
- `useAddContact` をフレンドコードベースに改修
- フレンドコードからユーザーを検索する `useSearchByFriendCode` フックを新規作成
- contactsクエリでprofilesをJOINして相手の最新display_nameを取得

### 4. 技術的な詳細

- フレンドコード検索用にprofilesに新しいSELECTポリシーを追加（`friend_code`での検索のみ許可）
- 双方向追加はEdge Functionで処理（RLSを迂回して相手側のレコードも作成する必要があるため、SECURITY DEFINER関数を使用）
- 既存の手動追加済みcontacts（contact_user_idがNULL）はそのまま残し、後方互換性を維持
