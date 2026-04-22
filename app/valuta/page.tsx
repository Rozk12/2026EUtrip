"use client";

import { useEffect, useState } from "react";

type Code = "JPY" | "DKK" | "CZK" | "EUR";

interface CurrencyDef {
  code: Code;
  name: string;
  flag: string;
  symbol: string;
}

const CURRENCIES: CurrencyDef[] = [
  { code: "JPY", name: "日本円", flag: "🇯🇵", symbol: "¥" },
  { code: "DKK", name: "デンマーク・クローネ", flag: "🇩🇰", symbol: "kr" },
  { code: "CZK", name: "チェコ・コルナ", flag: "🇨🇿", symbol: "Kč" },
  { code: "EUR", name: "ユーロ", flag: "🇪🇺", symbol: "€" },
];

// Fallback rates (1 EUR = N) when the live fetch fails / offline.
const FALLBACK_RATES: Record<Code, number> = {
  EUR: 1,
  JPY: 164,
  DKK: 7.46,
  CZK: 25.1,
};

function round(n: number, code: Code): string {
  if (!isFinite(n)) return "";
  // JPY/CZK: no decimals; DKK/EUR: two decimals
  const decimals = code === "JPY" || code === "CZK" ? 0 : 2;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function ValutaPage() {
  const [rates, setRates] = useState<Record<Code, number>>(FALLBACK_RATES);
  const [rateDate, setRateDate] = useState<string | null>(null);
  const [source, setSource] = useState<"live" | "fallback">("fallback");
  const [base, setBase] = useState<Code>("JPY");
  const [amount, setAmount] = useState<string>("1000");

  // Fetch current ECB rates via Frankfurter (no API key, free, CORS-friendly).
  useEffect(() => {
    const ac = new AbortController();
    fetch("https://api.frankfurter.app/latest?from=EUR&to=JPY,DKK,CZK", {
      signal: ac.signal,
    })
      .then((r) => r.json())
      .then((data: { date: string; rates: Record<string, number> }) => {
        setRates({
          EUR: 1,
          JPY: data.rates.JPY ?? FALLBACK_RATES.JPY,
          DKK: data.rates.DKK ?? FALLBACK_RATES.DKK,
          CZK: data.rates.CZK ?? FALLBACK_RATES.CZK,
        });
        setRateDate(data.date);
        setSource("live");
      })
      .catch(() => {
        // silently use fallback
      });
    return () => ac.abort();
  }, []);

  const parsedAmount = Number(amount.replace(/,/g, "")) || 0;

  const convert = (to: Code): number => {
    const inEur = parsedAmount / rates[base];
    return inEur * rates[to];
  };

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
          <div className="chevron-label">VALUTA</div>
          <h1 className="mt-1 font-deco text-3xl text-[var(--gold)]">
            通貨換算
          </h1>
          <p className="mt-1 text-[11px] italic text-[var(--cream-soft)]">
            {source === "live" && rateDate
              ? `ECB 公式レート · ${rateDate}`
              : "オフライン・参考レート"}
          </p>
        </header>

        {/* Active base + amount */}
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-[var(--gold)] bg-[var(--night)] p-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="text-2xl">
              {CURRENCIES.find((c) => c.code === base)!.flag}
            </span>
            <div className="min-w-0">
              <div className="font-title text-[10px] tracking-[0.3em] text-[var(--cream-soft)]">
                {base}
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  // keep only digits, dot, comma
                  const v = e.target.value.replace(/[^\d.,]/g, "");
                  setAmount(v);
                }}
                onFocus={(e) => e.target.select()}
                className="w-full bg-transparent text-2xl font-bold text-[var(--gold)] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quick amount chips */}
        <div className="mb-4 flex flex-wrap gap-2">
          {["100", "500", "1000", "5000", "10000"].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              className="rounded-full border border-[rgba(212,168,75,0.4)] bg-[var(--night)] px-3 py-1 text-[11px] text-[var(--cream-soft)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
              {v}
            </button>
          ))}
        </div>

        {/* Other currencies (tap to switch base) */}
        <div className="space-y-2">
          {CURRENCIES.filter((c) => c.code !== base).map((c) => {
            const value = convert(c.code);
            return (
              <button
                key={c.code}
                onClick={() => {
                  const currentAmount = parsedAmount;
                  const converted = convert(c.code);
                  setBase(c.code);
                  setAmount(round(converted, c.code).replace(/,/g, ""));
                  void currentAmount;
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-[rgba(212,168,75,0.3)] bg-[var(--night)] px-4 py-3 text-left transition hover:border-[var(--gold)]"
              >
                <span className="text-2xl">{c.flag}</span>
                <div className="flex-1">
                  <div className="font-title text-[10px] tracking-[0.3em] text-[var(--cream-soft)]">
                    {c.code}
                  </div>
                  <div className="text-xs italic text-[var(--cream-soft)]">
                    {c.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-[var(--cream)]">
                    {round(value, c.code)}
                  </div>
                  <div className="font-title text-[10px] tracking-widest text-[var(--cream-soft)]">
                    {c.symbol}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Rate table */}
        <div className="mt-6 rounded-2xl border border-[rgba(212,168,75,0.2)] bg-[var(--night)] p-3">
          <div className="chevron-label mb-2">レート（1 EUR = ）</div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="text-[var(--cream-soft)]">JPY</div>
            <div className="col-span-2 text-[var(--cream)]">
              {rates.JPY.toFixed(2)}
            </div>
            <div className="text-[var(--cream-soft)]">DKK</div>
            <div className="col-span-2 text-[var(--cream)]">
              {rates.DKK.toFixed(2)}
            </div>
            <div className="text-[var(--cream-soft)]">CZK</div>
            <div className="col-span-2 text-[var(--cream)]">
              {rates.CZK.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-xs italic text-[var(--cream-soft)] underline"
          >
            ← 旅程マップに戻る
          </a>
        </div>
      </div>
    </main>
  );
}
