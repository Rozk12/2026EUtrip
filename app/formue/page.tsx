"use client";

import { useEffect, useMemo, useState } from "react";

/* ------------------------------------------------------------------ *
 * 資産管理（Formue）— 旅の現金・カード・貯蓄を通貨横断で管理し、
 * 総資産を円換算で表示する。収支の記録で残高が自動で増減する。
 * データはすべて localStorage（"formue-assets" / "formue-tx"）に保存。
 * FX レートは /valuta と同じ多段フェッチ + フォールバック方式。
 * ------------------------------------------------------------------ */

type Currency = "JPY" | "EUR" | "DKK" | "CZK";

interface CurrencyDef {
  code: Currency;
  name: string;
  flag: string;
  symbol: string;
}

const CURRENCIES: CurrencyDef[] = [
  { code: "JPY", name: "日本円", flag: "🇯🇵", symbol: "¥" },
  { code: "EUR", name: "ユーロ", flag: "🇪🇺", symbol: "€" },
  { code: "DKK", name: "デンマーク・クローネ", flag: "🇩🇰", symbol: "kr" },
  { code: "CZK", name: "チェコ・コルナ", flag: "🇨🇿", symbol: "Kč" },
];

// 1 EUR = N（ライブ取得失敗・オフライン時のフォールバック）
const FALLBACK_RATES: Record<Currency, number> = {
  EUR: 1,
  JPY: 180,
  DKK: 7.46,
  CZK: 25.1,
};

type AssetKind = "cash" | "bank" | "card" | "invest" | "other";

interface KindDef {
  kind: AssetKind;
  label: string;
  icon: string;
}

const KINDS: KindDef[] = [
  { kind: "cash", label: "現金", icon: "💵" },
  { kind: "bank", label: "銀行", icon: "🏦" },
  { kind: "card", label: "カード", icon: "💳" },
  { kind: "invest", label: "投資", icon: "📈" },
  { kind: "other", label: "その他", icon: "🪙" },
];

interface Asset {
  id: string;
  name: string;
  kind: AssetKind;
  currency: Currency;
  balance: number;
}

interface Tx {
  id: string;
  assetId: string;
  amount: number; // 収入 = 正 / 支出 = 負（資産の通貨建て）
  category: string;
  memo: string;
  date: string; // YYYY-MM-DD
}

const CATEGORIES = [
  "食事",
  "交通",
  "宿泊",
  "観光",
  "買い物",
  "お土産",
  "入金",
  "両替",
  "その他",
] as const;

const PRESET_ASSETS: Omit<Asset, "id">[] = [
  { name: "財布の現金", kind: "cash", currency: "JPY", balance: 50000 },
  { name: "ユーロ現金", kind: "cash", currency: "EUR", balance: 300 },
  { name: "デンマーク現金", kind: "cash", currency: "DKK", balance: 1000 },
  { name: "クレジットカード", kind: "card", currency: "JPY", balance: 0 },
];

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function currencyDef(code: Currency) {
  return CURRENCIES.find((c) => c.code === code)!;
}

function kindDef(kind: AssetKind) {
  return KINDS.find((k) => k.kind === kind)!;
}

/** 通貨別の桁数で整形 */
function fmt(n: number, code: Currency): string {
  if (!isFinite(n)) return "—";
  const decimals = code === "JPY" || code === "CZK" ? 0 : 2;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/* ------------------------- storage ------------------------- */

function loadAssets(): Asset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("formue-assets");
    if (raw) {
      const parsed = JSON.parse(raw) as Asset[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return PRESET_ASSETS.map((a) => ({ ...a, id: makeId() }));
}

function loadTx(): Tx[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("formue-tx");
    if (raw) {
      const parsed = JSON.parse(raw) as Tx[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [];
}

/* ============================================================ */

export default function FormuePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [rates, setRates] = useState<Record<Currency, number>>(FALLBACK_RATES);
  const [rateDate, setRateDate] = useState<string | null>(null);
  const [source, setSource] = useState<"live" | "fallback">("fallback");
  const [refreshTick, setRefreshTick] = useState(0);

  const [display, setDisplay] = useState<"JPY" | "EUR">("JPY");
  const [txAssetId, setTxAssetId] = useState<string | null>(null); // 収支入力モーダル
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [detailAssetId, setDetailAssetId] = useState<string | null>(null);

  /* ---- 初回ロード ---- */
  useEffect(() => {
    setAssets(loadAssets());
    setTxs(loadTx());
    setHydrated(true);
  }, []);

  /* ---- 保存 ---- */
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("formue-assets", JSON.stringify(assets));
  }, [assets, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("formue-tx", JSON.stringify(txs));
  }, [txs, hydrated]);

  /* ---- FX 取得（/valuta と同じ多段方式） ---- */
  useEffect(() => {
    const ac = new AbortController();

    async function tryOpenErApi() {
      const res = await fetch("https://open.er-api.com/v6/latest/EUR", {
        signal: ac.signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`open.er-api ${res.status}`);
      const data = await res.json();
      if (data.result !== "success") throw new Error("not success");
      return {
        date:
          (data.time_last_update_utc as string | undefined)?.slice(5, 16) ??
          todayISO(),
        rates: data.rates as Record<string, number>,
      };
    }

    async function tryFrankfurter() {
      const res = await fetch(
        "https://api.frankfurter.app/latest?from=EUR&to=JPY,DKK,CZK",
        { signal: ac.signal, cache: "no-store" },
      );
      if (!res.ok) throw new Error(`frankfurter ${res.status}`);
      const data = await res.json();
      return { date: data.date as string, rates: data.rates as Record<string, number> };
    }

    (async () => {
      for (const [name, fetcher] of [
        ["open.er-api", tryOpenErApi],
        ["frankfurter", tryFrankfurter],
      ] as const) {
        try {
          const { date, rates: r } = await fetcher();
          setRates({
            EUR: 1,
            JPY: r.JPY ?? FALLBACK_RATES.JPY,
            DKK: r.DKK ?? FALLBACK_RATES.DKK,
            CZK: r.CZK ?? FALLBACK_RATES.CZK,
          });
          setRateDate(date);
          setSource("live");
          return;
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          console.warn(`${name} rate fetch failed`, err);
        }
      }
      setSource("fallback");
    })();

    return () => ac.abort();
  }, [refreshTick]);

  /* ---- 換算ヘルパー ---- */
  const toDisplay = useMemo(() => {
    return (amount: number, from: Currency): number => {
      const inEur = amount / rates[from];
      return inEur * rates[display];
    };
  }, [rates, display]);

  /* ---- 集計 ---- */
  const netWorth = useMemo(
    () => assets.reduce((sum, a) => sum + toDisplay(a.balance, a.currency), 0),
    [assets, toDisplay],
  );

  const byCurrency = useMemo(() => {
    const map = new Map<Currency, number>();
    for (const a of assets) {
      map.set(a.currency, (map.get(a.currency) ?? 0) + a.balance);
    }
    return [...map.entries()].filter(([, v]) => v !== 0);
  }, [assets]);

  const sortedTx = useMemo(
    () => [...txs].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [txs],
  );

  /* ---- 操作 ---- */
  function applyTx(assetId: string, signedAmount: number, category: string, memo: string, date: string) {
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, balance: a.balance + signedAmount } : a)),
    );
    setTxs((prev) => [
      { id: makeId(), assetId, amount: signedAmount, category, memo, date },
      ...prev,
    ]);
  }

  function deleteTx(tx: Tx) {
    // 削除時は残高を元に戻す
    setAssets((prev) =>
      prev.map((a) => (a.id === tx.assetId ? { ...a, balance: a.balance - tx.amount } : a)),
    );
    setTxs((prev) => prev.filter((t) => t.id !== tx.id));
  }

  function addAsset(a: Omit<Asset, "id">) {
    setAssets((prev) => [...prev, { ...a, id: makeId() }]);
  }

  function deleteAsset(id: string) {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setTxs((prev) => prev.filter((t) => t.assetId !== id));
    setDetailAssetId(null);
  }

  const detailAsset = assets.find((a) => a.id === detailAssetId) ?? null;

  return (
    <main
      className="min-h-[100dvh] bg-[var(--midnight)] px-4 text-[var(--cream)]"
      style={{
        paddingTop: "calc(1.5rem + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(6rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="mx-auto w-full max-w-md">
        {/* header */}
        <header className="mb-5 text-center">
          <div className="chevron-label">FORMUE</div>
          <h1 className="mt-1 font-deco text-3xl text-[var(--gold)]">資産管理</h1>
          <button
            onClick={() => {
              setSource("fallback");
              setRefreshTick((t) => t + 1);
            }}
            className="mt-1 inline-flex items-center gap-1 text-[11px] italic text-[var(--cream-soft)] underline-offset-2 hover:underline"
          >
            {source === "live" && rateDate ? `公式レート · ${rateDate}` : "オフライン・参考レート"}
            <span className="text-[9px] opacity-70">↻</span>
          </button>
        </header>

        {/* net worth card */}
        <div className="deco-frame mb-4 px-5 py-5 text-center">
          <div className="chevron-label mb-1">総資産</div>
          <div className="font-deco text-4xl text-[var(--gold)]">
            {currencyDef(display).symbol}
            {fmt(netWorth, display)}
          </div>
          <div className="mt-3 flex justify-center gap-2">
            {(["JPY", "EUR"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDisplay(d)}
                data-active={display === d}
                className="gold-border-btn rounded-full px-4 py-1 font-title text-[10px] tracking-widest"
              >
                {d}
              </button>
            ))}
          </div>
          {byCurrency.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-[var(--cream-soft)]">
              {byCurrency.map(([code, v]) => (
                <span key={code}>
                  {currencyDef(code).flag} {currencyDef(code).symbol}
                  {fmt(v, code)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* asset list */}
        <div className="mb-3 flex items-center justify-between">
          <div className="chevron-label">口座・資産</div>
          <button
            onClick={() => setShowAddAsset(true)}
            className="gold-border-btn rounded-full px-3 py-1 text-[11px]"
          >
            ＋ 資産を追加
          </button>
        </div>

        <div className="space-y-2">
          {assets.length === 0 && (
            <p className="rounded-2xl border border-[rgba(212,168,75,0.2)] bg-[var(--night)] px-4 py-6 text-center text-xs italic text-[var(--cream-soft)]">
              資産がありません。「＋ 資産を追加」から登録してください。
            </p>
          )}
          {assets.map((a) => {
            const k = kindDef(a.kind);
            const c = currencyDef(a.currency);
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-2xl border border-[rgba(212,168,75,0.3)] bg-[var(--night)] px-4 py-3"
              >
                <button
                  onClick={() => setDetailAssetId(a.id)}
                  className="flex flex-1 items-center gap-3 text-left"
                  aria-label={`${a.name} の明細`}
                >
                  <span className="text-2xl">{k.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-[var(--cream)]">{a.name}</div>
                    <div className="font-title text-[9px] tracking-[0.25em] text-[var(--cream-soft)]">
                      {c.flag} {a.currency} · {k.label}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[var(--cream)]">
                      {c.symbol}
                      {fmt(a.balance, a.currency)}
                    </div>
                    {a.currency !== display && (
                      <div className="text-[10px] italic text-[var(--cream-soft)]">
                        ≈ {currencyDef(display).symbol}
                        {fmt(toDisplay(a.balance, a.currency), display)}
                      </div>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setTxAssetId(a.id)}
                  aria-label={`${a.name} に収支を記録`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--gold)] text-[var(--gold)] transition hover:bg-[rgba(212,168,75,0.12)] active:scale-95"
                >
                  ±
                </button>
              </div>
            );
          })}
        </div>

        {/* recent transactions */}
        <div className="mb-3 mt-7 chevron-label">最近の収支</div>
        {sortedTx.length === 0 ? (
          <p className="rounded-2xl border border-[rgba(212,168,75,0.2)] bg-[var(--night)] px-4 py-6 text-center text-xs italic text-[var(--cream-soft)]">
            まだ記録がありません。資産カードの「±」から入力できます。
          </p>
        ) : (
          <ul className="space-y-1.5">
            {sortedTx.slice(0, 30).map((t) => {
              const asset = assets.find((a) => a.id === t.assetId);
              const cur = asset?.currency ?? "JPY";
              const income = t.amount >= 0;
              return (
                <li
                  key={t.id}
                  className="flex items-center gap-3 rounded-xl border border-[rgba(212,168,75,0.18)] bg-[var(--night)] px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] text-[var(--cream)]">
                      {t.category}
                      {t.memo && (
                        <span className="text-[var(--cream-soft)]"> · {t.memo}</span>
                      )}
                    </div>
                    <div className="text-[10px] italic text-[var(--cream-soft)]">
                      {t.date} · {asset?.name ?? "（削除済み）"}
                    </div>
                  </div>
                  <div
                    className={`text-sm font-bold ${
                      income ? "text-[var(--gold)]" : "text-[var(--cream)]"
                    }`}
                  >
                    {income ? "＋" : "−"}
                    {currencyDef(cur).symbol}
                    {fmt(Math.abs(t.amount), cur)}
                  </div>
                  <button
                    onClick={() => deleteTx(t)}
                    aria-label="この記録を削除"
                    className="shrink-0 text-[var(--cream-soft)] hover:text-[var(--burgundy)]"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-8 text-center">
          <a href="/" className="text-xs italic text-[var(--cream-soft)] underline">
            ← 旅程マップに戻る
          </a>
        </div>
      </div>

      {/* ---- モーダル群 ---- */}
      {txAssetId && (
        <TxModal
          asset={assets.find((a) => a.id === txAssetId)!}
          onClose={() => setTxAssetId(null)}
          onSubmit={(signed, cat, memo, date) => {
            applyTx(txAssetId, signed, cat, memo, date);
            setTxAssetId(null);
          }}
        />
      )}

      {showAddAsset && (
        <AddAssetModal
          onClose={() => setShowAddAsset(false)}
          onSubmit={(a) => {
            addAsset(a);
            setShowAddAsset(false);
          }}
        />
      )}

      {detailAsset && (
        <AssetDetailModal
          asset={detailAsset}
          txs={sortedTx.filter((t) => t.assetId === detailAsset.id)}
          display={display}
          toDisplay={toDisplay}
          onClose={() => setDetailAssetId(null)}
          onDelete={() => deleteAsset(detailAsset.id)}
          onDeleteTx={deleteTx}
        />
      )}
    </main>
  );
}

/* ======================= モーダル ======================= */

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[3000] flex items-end justify-center bg-[rgba(11,24,40,0.7)] backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl border border-[rgba(212,168,75,0.4)] bg-[var(--night)] p-5 sm:rounded-3xl"
        style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="chevron-label">{title}</div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="text-lg text-[var(--cream-soft)] hover:text-[var(--gold)]"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TxModal({
  asset,
  onClose,
  onSubmit,
}: {
  asset: Asset;
  onClose: () => void;
  onSubmit: (signed: number, category: string, memo: string, date: string) => void;
}) {
  const [mode, setMode] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState(todayISO());
  const c = currencyDef(asset.currency);

  const parsed = Number(amount.replace(/,/g, "")) || 0;

  return (
    <ModalShell title={`収支を記録 · ${asset.name}`} onClose={onClose}>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => setMode("expense")}
          data-active={mode === "expense"}
          className="gold-border-btn rounded-xl py-2 font-title text-[11px] tracking-widest"
        >
          支出
        </button>
        <button
          onClick={() => setMode("income")}
          data-active={mode === "income"}
          className="gold-border-btn rounded-xl py-2 font-title text-[11px] tracking-widest"
        >
          収入
        </button>
      </div>

      <label className="mb-1 block text-[10px] tracking-widest text-[var(--cream-soft)]">
        金額（{asset.currency}）
      </label>
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-[rgba(212,168,75,0.35)] bg-[var(--midnight)] px-3 py-2">
        <span className="text-lg text-[var(--cream-soft)]">{c.symbol}</span>
        <input
          autoFocus
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
          onFocus={(e) => e.target.select()}
          placeholder="0"
          className="w-full bg-transparent text-2xl font-bold text-[var(--gold)] outline-none"
        />
      </div>

      <label className="mb-1 block text-[10px] tracking-widest text-[var(--cream-soft)]">
        カテゴリ
      </label>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            data-active={category === cat}
            className="gold-border-btn rounded-full px-3 py-1 text-[11px]"
          >
            {cat}
          </button>
        ))}
      </div>

      <label className="mb-1 block text-[10px] tracking-widest text-[var(--cream-soft)]">
        メモ（任意）
      </label>
      <input
        type="text"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="例：カフェでランチ"
        className="mb-3 w-full rounded-xl border border-[rgba(212,168,75,0.35)] bg-[var(--midnight)] px-3 py-2 text-sm text-[var(--cream)] outline-none placeholder:text-[var(--cream-soft)]/50"
      />

      <label className="mb-1 block text-[10px] tracking-widest text-[var(--cream-soft)]">
        日付
      </label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="mb-4 w-full rounded-xl border border-[rgba(212,168,75,0.35)] bg-[var(--midnight)] px-3 py-2 text-sm text-[var(--cream)] outline-none"
      />

      <button
        disabled={parsed <= 0}
        onClick={() =>
          onSubmit(mode === "expense" ? -parsed : parsed, category, memo.trim(), date)
        }
        className="w-full rounded-xl border-2 border-[var(--gold)] bg-[var(--gold)] py-3 font-title text-[12px] tracking-[0.3em] text-[var(--midnight)] transition disabled:cursor-not-allowed disabled:opacity-40 enabled:active:scale-[0.98]"
      >
        {mode === "expense" ? "支出を記録" : "収入を記録"}
      </button>
    </ModalShell>
  );
}

function AddAssetModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (a: Omit<Asset, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<AssetKind>("cash");
  const [currency, setCurrency] = useState<Currency>("JPY");
  const [balance, setBalance] = useState("");

  const parsed = Number(balance.replace(/,/g, "")) || 0;

  return (
    <ModalShell title="資産を追加" onClose={onClose}>
      <label className="mb-1 block text-[10px] tracking-widest text-[var(--cream-soft)]">
        名前
      </label>
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="例：ユーロ現金"
        className="mb-3 w-full rounded-xl border border-[rgba(212,168,75,0.35)] bg-[var(--midnight)] px-3 py-2 text-sm text-[var(--cream)] outline-none placeholder:text-[var(--cream-soft)]/50"
      />

      <label className="mb-1 block text-[10px] tracking-widest text-[var(--cream-soft)]">
        種類
      </label>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <button
            key={k.kind}
            onClick={() => setKind(k.kind)}
            data-active={kind === k.kind}
            className="gold-border-btn rounded-full px-3 py-1 text-[11px]"
          >
            {k.icon} {k.label}
          </button>
        ))}
      </div>

      <label className="mb-1 block text-[10px] tracking-widest text-[var(--cream-soft)]">
        通貨
      </label>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {CURRENCIES.map((c) => (
          <button
            key={c.code}
            onClick={() => setCurrency(c.code)}
            data-active={currency === c.code}
            className="gold-border-btn rounded-full px-3 py-1 text-[11px]"
          >
            {c.flag} {c.code}
          </button>
        ))}
      </div>

      <label className="mb-1 block text-[10px] tracking-widest text-[var(--cream-soft)]">
        初期残高（{currency}）
      </label>
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-[rgba(212,168,75,0.35)] bg-[var(--midnight)] px-3 py-2">
        <span className="text-lg text-[var(--cream-soft)]">{currencyDef(currency).symbol}</span>
        <input
          type="text"
          inputMode="decimal"
          value={balance}
          onChange={(e) => setBalance(e.target.value.replace(/[^\d.,]/g, ""))}
          onFocus={(e) => e.target.select()}
          placeholder="0"
          className="w-full bg-transparent text-xl font-bold text-[var(--gold)] outline-none"
        />
      </div>

      <button
        disabled={!name.trim()}
        onClick={() => onSubmit({ name: name.trim(), kind, currency, balance: parsed })}
        className="w-full rounded-xl border-2 border-[var(--gold)] bg-[var(--gold)] py-3 font-title text-[12px] tracking-[0.3em] text-[var(--midnight)] transition disabled:cursor-not-allowed disabled:opacity-40 enabled:active:scale-[0.98]"
      >
        追加する
      </button>
    </ModalShell>
  );
}

function AssetDetailModal({
  asset,
  txs,
  display,
  toDisplay,
  onClose,
  onDelete,
  onDeleteTx,
}: {
  asset: Asset;
  txs: Tx[];
  display: "JPY" | "EUR";
  toDisplay: (amount: number, from: Currency) => number;
  onClose: () => void;
  onDelete: () => void;
  onDeleteTx: (tx: Tx) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const c = currencyDef(asset.currency);
  const k = kindDef(asset.kind);

  return (
    <ModalShell title={`${k.icon} ${asset.name}`} onClose={onClose}>
      <div className="mb-4 text-center">
        <div className="text-3xl font-bold text-[var(--gold)]">
          {c.symbol}
          {fmt(asset.balance, asset.currency)}
        </div>
        {asset.currency !== display && (
          <div className="text-xs italic text-[var(--cream-soft)]">
            ≈ {currencyDef(display).symbol}
            {fmt(toDisplay(asset.balance, asset.currency), display)}
          </div>
        )}
      </div>

      <div className="mb-2 chevron-label">この資産の履歴</div>
      {txs.length === 0 ? (
        <p className="mb-4 rounded-xl border border-[rgba(212,168,75,0.18)] bg-[var(--midnight)] px-3 py-4 text-center text-xs italic text-[var(--cream-soft)]">
          記録なし
        </p>
      ) : (
        <ul className="mb-4 max-h-56 space-y-1.5 overflow-y-auto">
          {txs.map((t) => {
            const income = t.amount >= 0;
            return (
              <li
                key={t.id}
                className="flex items-center gap-2 rounded-xl border border-[rgba(212,168,75,0.18)] bg-[var(--midnight)] px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] text-[var(--cream)]">
                    {t.category}
                    {t.memo && <span className="text-[var(--cream-soft)]"> · {t.memo}</span>}
                  </div>
                  <div className="text-[10px] italic text-[var(--cream-soft)]">{t.date}</div>
                </div>
                <div
                  className={`text-sm font-bold ${
                    income ? "text-[var(--gold)]" : "text-[var(--cream)]"
                  }`}
                >
                  {income ? "＋" : "−"}
                  {c.symbol}
                  {fmt(Math.abs(t.amount), asset.currency)}
                </div>
                <button
                  onClick={() => onDeleteTx(t)}
                  aria-label="削除"
                  className="text-[var(--cream-soft)] hover:text-[var(--burgundy)]"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {confirmDelete ? (
        <div className="rounded-xl border border-[var(--burgundy)] bg-[rgba(140,36,48,0.12)] p-3">
          <p className="mb-2 text-center text-xs text-[var(--cream)]">
            この資産と履歴を削除しますか？
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="gold-border-btn flex-1 rounded-xl py-2 text-xs"
            >
              やめる
            </button>
            <button
              onClick={onDelete}
              className="flex-1 rounded-xl border-2 border-[var(--burgundy)] bg-[var(--burgundy)] py-2 text-xs font-bold text-[var(--cream)]"
            >
              削除する
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="w-full text-center text-[11px] italic text-[var(--cream-soft)] underline hover:text-[var(--burgundy)]"
        >
          この資産を削除
        </button>
      )}
    </ModalShell>
  );
}
