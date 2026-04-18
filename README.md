# Europe Trip 2026

Copenhagen → Prague → Vienna → Salzburg の旅程マップ。

## スタック

- Next.js 14 (App Router, TypeScript)
- React Leaflet + OpenStreetMap（地図API課金なし）
- Tailwind CSS
- Google Sheets API（オプション、service account）

## ローカル実行

```bash
npm install
npm run dev
```

http://localhost:3000

## データの持ち方

- **`data/trip.json`**: デフォルトのデータ。環境変数未設定時はこちらを使用。
- **Google Sheets**: `GOOGLE_SHEET_ID` と `GOOGLE_SERVICE_ACCOUNT_JSON` が設定されていれば、`/api/trip` がSheetから読み込み（60秒キャッシュ）。

右上に `source: local` / `source: sheet` と表示されます。

## Google Sheets を非公開DBとして使う

スマホから予約情報を編集したい場合の推奨セットアップ：

### 1. Sheet を作成

スプレッドシートを作成し、以下のタブを用意。1行目はヘッダー。

**`trip` タブ**
| title | travelers | start | end |
| ---- | -------- | ----- | --- |
| ヨーロッパ旅行 2026 GW | Ryu Ozaki, Yoko Ozaki | 2026-04-25 | 2026-05-05 |

**`flights` タブ**
`id, traveler, airline, flightNumbers, from_city, from_airport, from_lat, from_lng, to_city, to_airport, to_lat, to_lng, departure, arrival, bookingRef, class, stops, checkedBag, duration, note`

**`trains` タブ**
`id, traveler, operator, trainNumber, from_city, from_station, from_lat, from_lng, to_city, to_station, to_lat, to_lng, departure, arrival, bookingRef, seats, class, cancellation, ticketNumbers, ticketCodes`

**`hotels` タブ**
`id, name, city, address, lat, lng, checkIn, checkOut, nights, bookingRef, rating, beds, note, price, contact`

**`events` タブ**
`id, name, city, venue, address, lat, lng, date, time, duration, note`

**`itinerary` タブ**
`date, city, events`（events はカンマ区切りのID）

カンマ区切りが必要な列: `travelers`, `flightNumbers`, `stops`, `ticketNumbers`, `ticketCodes`, `events`。

### 2. サービスアカウント作成

1. [Google Cloud Console](https://console.cloud.google.com/) → プロジェクト作成
2. APIs & Services → Google Sheets API を有効化
3. IAM → Service Accounts → 新規作成
4. 作ったアカウントの Keys → Add Key → JSON でDL
5. Sheet の共有設定で、そのService Accountのメール（`xxx@xxx.iam.gserviceaccount.com`）を **閲覧者** として追加

### 3. 環境変数

Vercelプロジェクト → Settings → Environment Variables:

- `GOOGLE_SHEET_ID` … SheetのURLの `/d/<ID>/edit` 部分
- `GOOGLE_SERVICE_ACCOUNT_JSON` … DLしたJSONファイルの中身をそのまま（1行でも可）

ローカルは `.env.local` に同じものを置く（.gitignore 済み）。

### 4. データ更新フロー

1. スマホの Google Sheets アプリで行を編集/追加
2. Webアプリをリロード → 60秒以内にSheetの内容が反映
3. Sheetはリンク公開不要。共有はRyu/Yokoの個人アカウントのみ

## アクセス制限（Basic認証）

`BASIC_AUTH_USER` と `BASIC_AUTH_PASS` をVercel環境変数に設定すると、
全ページにBasic認証がかかります（middleware経由）。未設定なら公開状態。

ブラウザから初回アクセス時にID/PWダイアログが出ます。パスワードは
ブラウザが覚えるので、Yoko/Aoi に共有したら2回目以降は自動入力。

## Vercel にデプロイ

```bash
npm i -g vercel
vercel
```

無料枠で運用可能。環境変数を忘れずに設定。
