"use client";

import { useEffect, useMemo, useState } from "react";

interface Item {
  id: string;
  label: string;
  category: string;
  count: number;
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
  { label: "パスポート", category: "必需品", count: 1 },
  { label: "航空券（スマホに入っている？）", category: "必需品", count: 1 },
  { label: "クレジットカード", category: "必需品", count: 2 },
  { label: "現金（JPY / EUR）", category: "必需品", count: 1 },
  { label: "現金（DKK）", category: "必需品", count: 1 },
  { label: "海外旅行保険", category: "必需品", count: 1 },
  // 衣類
  { label: "半袖トップス", category: "衣類", count: 4 },
  { label: "長袖トップス", category: "衣類", count: 2 },
  { label: "パンツ", category: "衣類", count: 2 },
  { label: "下着", category: "衣類", count: 10 },
  { label: "靴下", category: "衣類", count: 10 },
  { label: "軽いジャケット / ライトコート", category: "衣類", count: 1 },
  { label: "折りたたみ傘", category: "衣類", count: 1 },
  { label: "歩きやすい靴", category: "衣類", count: 1 },
  { label: "パジャマ / ルームウェア", category: "衣類", count: 1 },
  { label: "コンサート用の小綺麗な服", category: "衣類", count: 1 },
  // 電子機器
  { label: "スマホ + 充電ケーブル", category: "電子機器", count: 1 },
  { label: "モバイルバッテリー", category: "電子機器", count: 1 },
  { label: "C/F タイプ変換プラグ", category: "電子機器", count: 2 },
  { label: "延長タップ", category: "電子機器", count: 1 },
  { label: "イヤホン", category: "電子機器", count: 1 },
  { label: "カメラ + 予備バッテリー", category: "電子機器", count: 1 },
  // 洗面用具
  { label: "歯ブラシ・歯磨き粉", category: "洗面用具", count: 1 },
  { label: "シャンプー・コンディショナー（旅行サイズ）", category: "洗面用具", count: 1 },
  { label: "髭剃り", category: "洗面用具", count: 1 },
  { label: "スキンケア / 化粧品", category: "洗面用具", count: 1 },
  { label: "タオル", category: "洗面用具", count: 1 },
  { label: "ウェットティッシュ", category: "洗面用具", count: 1 },
  // 書類
  { label: "パスポートのコピー（別保管）", category: "書類", count: 1 },
  { label: "予約確認書（ホテル・列車）", category: "書類", count: 1 },
  { label: "カード紛失時の連絡先メモ", category: "書類", count: 1 },
  { label: "PDF チケット（Vivaldi / Musikverein）", category: "書類", count: 1 },
  // その他
  { label: "常備薬・痛み止め・胃薬", category: "その他", count: 1 },
  { label: "マスク", category: "その他", count: 5 },
  { label: "エコバッグ / 折りたたみバッグ（お土産用）", category: "その他", count: 1 },
  { label: "ガイドブック or メモ", category: "その他", count: 1 },
  { label: "日焼け止め", category: "その他", count: 1 },
  { label: "サングラス", category: "その他", count: 1 },
];

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadItems(): Item[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("pakliste");
    if (raw) {
      const parsed = JSON.parse(raw) as Array<Partial<Item>>;
      // Migrate: older entries may be missing `count`
      return parsed.map((p) => ({
        id: p.id ?? makeId(),
        label: p.label ?? "",
        category: p.category ?? "その他",
        count: typeof p.count === "number" && p.count > 0 ? p.count : 1,
        checked: !!p.checked,
      }));
    }
  } catch {}
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
  const [newCount, setNewCount] = useState(1);
  const [newCategory, setNewCategory] =
    useState<(typeof CATEGORIES)[number]>("その他");

  useEffect(() => {
    setItems(loadItems());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveItems(items);
  }, [items, mounted]);

  const toggle = (id: string) =>
    setItems((xs) =>
      xs.map((x) => (x.id === id ? { ...x, checked: !x.checked } : x)),
    );

  const bump = (id: string, delta: number) =>
    setItems((xs) =>
      xs.map((x) =>
        x.id === id ? { ...x, count: Math.max(1, x.count + delta) } : x,
      ),
    );

  const remove = (id: string) =>
    setItems((xs) => xs.filter((x) => x.id !== id));

  const add = () => {
    const label = newLabel.trim();
    if (!label) return;
    setItems((xs) => [
      ...xs,
      {
        id: makeId(),
        label,
        category: newCategory,
        count: Math.max(1, newCount),
        checked: false,
      },
    ]);
    setNewLabel("");
    setNewCount(1);
  };

  const resetToPresets = () => {
    if (
      !window.confirm(
        "リセットすると入力済みのチェックと自分で追加した項目が消えます。よろしいですか？",
      )
    )
      return;
    setItems(
      PRESET_ITEMS.map((p) => ({ ...p, id: makeId(), checked: false })),
    );
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
                  <li
                    key={it.id}
                    className="flex items-center gap-2 py-1.5 pl-3 pr-1"
                  >
                    <button
                      onClick={() => toggle(it.id)}
                      aria-label="チェック"
                      className="shrink-0 py-2"
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded border ${
                          it.checked
                            ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--midnight)]"
                            : "border-[rgba(212,168,75,0.5)] bg-transparent"
                        }`}
                      >
                        {it.checked && <span className="text-xs">✓</span>}
                      </span>
                    </button>
                    <button
                      onClick={() => toggle(it.id)}
                      className="min-w-0 flex-1 py-2 text-left"
                    >
                      <span
                        className={`block break-words text-sm leading-snug ${
                          it.checked
                            ? "text-[var(--cream-soft)] line-through opacity-60"
                            : "text-[var(--cream)]"
                        }`}
                      >
                        {it.label}
                      </span>
                    </button>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => bump(it.id, -1)}
                        disabled={it.count <= 1}
                        aria-label="減らす"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(212,168,75,0.35)] text-[var(--cream)] disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="min-w-[1.25rem] text-center font-title text-[12px] tracking-widest text-[var(--gold)]">
                        {it.count}
                      </span>
                      <button
                        onClick={() => bump(it.id, +1)}
                        aria-label="増やす"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(212,168,75,0.35)] text-[var(--cream)]"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => remove(it.id)}
                      aria-label="削除"
                      className="shrink-0 px-1.5 py-2 text-[var(--cream-soft)] opacity-50 hover:text-[var(--burgundy)] hover:opacity-100"
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
              className="flex items-center gap-2"
            >
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="持って行くもの"
                className="flex-1 rounded-full border border-[rgba(212,168,75,0.4)] bg-[var(--midnight)] px-4 py-2 text-sm text-[var(--cream)] placeholder:text-[var(--cream-soft)] focus:border-[var(--gold)] focus:outline-none"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setNewCount((n) => Math.max(1, n - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(212,168,75,0.35)] text-[var(--cream)]"
                >
                  −
                </button>
                <span className="min-w-[1.5rem] text-center font-title text-[12px] text-[var(--gold)]">
                  {newCount}
                </span>
                <button
                  type="button"
                  onClick={() => setNewCount((n) => n + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(212,168,75,0.35)] text-[var(--cream)]"
                >
                  +
                </button>
              </div>
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
