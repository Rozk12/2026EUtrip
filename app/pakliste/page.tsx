"use client";

import { useEffect, useMemo, useState } from "react";

interface Item {
  id: string;
  label: string;
  category: string;
  checked: boolean;
}

const CATEGORIES = [
  "必需品",
  "衣類",
  "電子機器",
  "洗面用具",
  "書類",
  "その他",
] as const;

const PRESET_ITEMS: Omit<Item, "id" | "checked">[] = [
  // 必需品
  { label: "パスポート", category: "必需品" },
  { label: "航空券（スマホに入っている？）", category: "必需品" },
  { label: "クレジットカード × 2", category: "必需品" },
  { label: "現金（JPY / EUR）", category: "必需品" },
  { label: "現金（DKK）", category: "必需品" },
  { label: "海外旅行保険", category: "必需品" },
  // 衣類（4月末〜5月の欧州、朝晩涼しい）
  { label: "半袖トップス × 3-4", category: "衣類" },
  { label: "長袖トップス × 2", category: "衣類" },
  { label: "パンツ × 2", category: "衣類" },
  { label: "下着 × 滞在日数分", category: "衣類" },
  { label: "靴下 × 滞在日数分", category: "衣類" },
  { label: "軽いジャケット / ライトコート", category: "衣類" },
  { label: "折りたたみ傘", category: "衣類" },
  { label: "歩きやすい靴", category: "衣類" },
  { label: "パジャマ / ルームウェア", category: "衣類" },
  { label: "コンサート用の小綺麗な服", category: "衣類" },
  // 電子機器
  { label: "スマホ + 充電ケーブル", category: "電子機器" },
  { label: "モバイルバッテリー", category: "電子機器" },
  { label: "C/F タイプ変換プラグ", category: "電子機器" },
  { label: "延長タップ（複数機器用）", category: "電子機器" },
  { label: "イヤホン", category: "電子機器" },
  { label: "カメラ + 予備バッテリー", category: "電子機器" },
  // 洗面用具
  { label: "歯ブラシ・歯磨き粉", category: "洗面用具" },
  { label: "シャンプー・コンディショナー（旅行サイズ）", category: "洗面用具" },
  { label: "髭剃り", category: "洗面用具" },
  { label: "スキンケア / 化粧品", category: "洗面用具" },
  { label: "タオル", category: "洗面用具" },
  { label: "ウェットティッシュ", category: "洗面用具" },
  // 書類
  { label: "パスポートのコピー（別保管）", category: "書類" },
  { label: "予約確認書（ホテル・列車）", category: "書類" },
  { label: "カード紛失時の連絡先メモ", category: "書類" },
  { label: "PDF チケット（Vivaldi / Musikverein）", category: "書類" },
  // その他
  { label: "常備薬・痛み止め・胃薬", category: "その他" },
  { label: "マスク数枚", category: "その他" },
  { label: "エコバッグ / 折りたたみバッグ（お土産用）", category: "その他" },
  { label: "ガイドブック or メモ", category: "その他" },
  { label: "日焼け止め", category: "その他" },
  { label: "サングラス", category: "その他" },
];

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadItems(): Item[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("pakliste");
    if (raw) return JSON.parse(raw);
  } catch {}
  // First-time: seed with presets
  return PRESET_ITEMS.map((p) => ({
    ...p,
    id: makeId(),
    checked: false,
  }));
}

function saveItems(items: Item[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("pakliste", JSON.stringify(items));
  } catch {}
}

export default function PaklistePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [mounted, setMounted] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newCategory, setNewCategory] =
    useState<(typeof CATEGORIES)[number]>("その他");

  useEffect(() => {
    setItems(loadItems());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveItems(items);
  }, [items, mounted]);

  const toggle = (id: string) => {
    setItems((xs) =>
      xs.map((x) => (x.id === id ? { ...x, checked: !x.checked } : x)),
    );
  };

  const remove = (id: string) => {
    setItems((xs) => xs.filter((x) => x.id !== id));
  };

  const add = () => {
    const label = newLabel.trim();
    if (!label) return;
    setItems((xs) => [
      ...xs,
      { id: makeId(), label, category: newCategory, checked: false },
    ]);
    setNewLabel("");
  };

  const resetToPresets = () => {
    if (
      !window.confirm(
        "リセットすると入力済みのチェックと自分で追加した項目が消えます。よろしいですか？",
      )
    )
      return;
    const fresh = PRESET_ITEMS.map((p) => ({
      ...p,
      id: makeId(),
      checked: false,
    }));
    setItems(fresh);
  };

  const byCategory = useMemo(() => {
    const map: Record<string, Item[]> = {};
    for (const c of CATEGORIES) map[c] = [];
    for (const it of items) {
      (map[it.category] ?? (map[it.category] = [])).push(it);
    }
    return map;
  }, [items]);

  const total = items.length;
  const done = items.filter((i) => i.checked).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <main
      className="min-h-[100dvh] bg-[var(--midnight)] px-4 text-[var(--cream)]"
      style={{
        paddingTop: "calc(1.5rem + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(6rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="mx-auto w-full max-w-md">
        <header className="mb-5 text-center">
          <div className="chevron-label">PAKLISTE</div>
          <h1 className="mt-1 font-deco text-3xl text-[var(--gold)]">
            持ち物リスト
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--night)]">
              <div
                className="h-full bg-[var(--gold)] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-title text-[11px] tracking-widest text-[var(--cream-soft)]">
              {done} / {total}
            </span>
          </div>
        </header>

        {CATEGORIES.map((cat) => {
          const list = byCategory[cat] ?? [];
          if (list.length === 0) return null;
          return (
            <section key={cat} className="mb-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="chevron-label">{cat}</span>
                <span className="text-[10px] italic text-[var(--cream-soft)]">
                  {list.filter((i) => i.checked).length} / {list.length}
                </span>
              </div>
              <ul className="divide-y divide-[rgba(212,168,75,0.15)] rounded-2xl border border-[rgba(212,168,75,0.25)] bg-[var(--night)]">
                {list.map((it) => (
                  <li key={it.id} className="flex items-center">
                    <button
                      onClick={() => toggle(it.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left"
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          it.checked
                            ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--midnight)]"
                            : "border-[rgba(212,168,75,0.5)] bg-transparent"
                        }`}
                      >
                        {it.checked && <span className="text-xs">✓</span>}
                      </span>
                      <span
                        className={`min-w-0 flex-1 text-sm ${
                          it.checked
                            ? "text-[var(--cream-soft)] line-through opacity-60"
                            : "text-[var(--cream)]"
                        }`}
                      >
                        {it.label}
                      </span>
                    </button>
                    <button
                      onClick={() => remove(it.id)}
                      aria-label="削除"
                      className="px-3 py-3 text-[var(--cream-soft)] opacity-50 hover:text-[var(--burgundy)] hover:opacity-100"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {/* Add form */}
        <section className="mb-5">
          <div className="mb-2 chevron-label">ADD ITEM</div>
          <div className="rounded-2xl border border-[rgba(212,168,75,0.3)] bg-[var(--night)] p-3">
            <div className="mb-2 flex flex-wrap gap-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewCategory(c)}
                  className={`rounded-full px-3 py-1 text-[11px] transition ${
                    newCategory === c
                      ? "bg-[var(--gold)] text-[var(--midnight)]"
                      : "border border-[rgba(212,168,75,0.4)] text-[var(--cream-soft)]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                add();
              }}
              className="flex gap-2"
            >
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="持って行くもの"
                className="flex-1 rounded-full border border-[rgba(212,168,75,0.4)] bg-[var(--midnight)] px-4 py-2 text-sm text-[var(--cream)] placeholder:text-[var(--cream-soft)] focus:border-[var(--gold)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newLabel.trim()}
                className="rounded-full bg-[var(--gold)] px-4 py-2 font-title text-[11px] tracking-[0.3em] text-[var(--midnight)] disabled:opacity-50"
              >
                追加
              </button>
            </form>
          </div>
        </section>

        <div className="mt-6 flex flex-col items-center gap-2">
          <button
            onClick={resetToPresets}
            className="rounded-full border border-[rgba(212,168,75,0.3)] px-4 py-2 text-[11px] italic text-[var(--cream-soft)] hover:border-[var(--burgundy)] hover:text-[var(--burgundy)]"
          >
            プリセットに戻す
          </button>
          <a
            href="/"
            className="mt-2 text-xs italic text-[var(--cream-soft)] underline"
          >
            ← 旅程マップに戻る
          </a>
        </div>
      </div>
    </main>
  );
}
