# Europe Trip 2026

Copenhagen → Prague → Vienna → Salzburg の旅程マップ。

## スタック

- Next.js 14 (App Router, TypeScript)
- React Leaflet + OpenStreetMap（地図API課金なし）
- Tailwind CSS

## ローカル実行

```bash
npm install
npm run dev
```

http://localhost:3000 にアクセス。

## 旅程データの更新

`data/trip.json` を編集すると地図と一覧に即反映されます。構造：

- `flights` / `trains`: `from` と `to` にそれぞれ座標。2点ピン＋点線を自動描画。
- `hotels`: `checkIn` 〜 `checkOut` の各日にピン表示。
- `events`: 単日イベント（コンサート等）。
- `itinerary`: 日付順の全体スケジュール（左カラムのタブに対応）。

## Vercel にデプロイ

```bash
npm i -g vercel
vercel
```

既定設定でビルド・デプロイされます。無料枠内で運用可能。
