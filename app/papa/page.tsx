"use client";

import { useState } from "react";
import Image from "next/image";
import { DAD_QUOTES } from "@/data/dad-quotes";

export default function PapaPage() {
  const [idx, setIdx] = useState(0);
  const [xBaited, setXBaited] = useState(false);

  const quote = DAD_QUOTES[idx];
  const isLast = idx === DAD_QUOTES.length - 1;

  const next = () => setIdx((i) => Math.min(i + 1, DAD_QUOTES.length - 1));
  const prev = () => setIdx((i) => Math.max(i - 1, 0));

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-yellow-100 via-orange-50 to-rose-50 pb-16">
      {/* top banner */}
      <div className="relative z-10 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 py-3 text-center text-white shadow">
        <div className="animate-pulse text-sm font-black sm:text-base">
          🚨 緊急通知 🚨 メッセージが {DAD_QUOTES.length} 件届いています 🚨
        </div>
      </div>

      {/* fake X that doesn't work */}
      <button
        onClick={() => setXBaited(true)}
        className="fixed right-2 top-14 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-slate-600 shadow"
      >
        ×
      </button>
      {xBaited && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setXBaited(false)}
        >
          <div className="max-w-xs rounded-2xl bg-white p-5 text-center shadow-2xl">
            <div className="text-2xl">🙅</div>
            <div className="mt-2 font-bold">最後まで聞きなさい。</div>
            <div className="mt-1 text-xs text-slate-500">
              まだ {DAD_QUOTES.length - idx - 1} 件のメッセージがあります。
            </div>
            <button
              onClick={() => setXBaited(false)}
              className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
            >
              分かりました
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-md px-4 pt-6">
        {/* progress */}
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>
            {idx + 1} / {DAD_QUOTES.length}
          </span>
          <span className="flex gap-1">
            {Array.from({ length: DAD_QUOTES.length }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-2 rounded-full ${
                  i <= idx ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            ))}
          </span>
        </div>

        {/* ad-style message card */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-amber-400 bg-white p-5 shadow-lg">
          <div className="absolute right-3 top-3 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            PR
          </div>
          <div className="mb-3 flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-amber-400">
              <Image
                src="/assets/dad-namazu.png"
                alt=""
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-xs font-medium uppercase tracking-wider text-amber-600">
              #{String(quote.id).padStart(2, "0")} · {quote.title}
            </div>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {quote.body}
          </div>
        </div>

        {/* navigation */}
        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            onClick={prev}
            disabled={idx === 0}
            className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-40"
          >
            ← 戻る
          </button>
          {isLast ? (
            <a
              href="/"
              className="flex-1 rounded-full bg-emerald-600 px-6 py-3 text-center text-base font-bold text-white shadow-lg active:scale-95"
            >
              ✅ 拝聴しました（帰る）
            </a>
          ) : (
            <button
              onClick={next}
              className="flex-1 animate-pulse rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-3 text-base font-bold text-white shadow-lg active:scale-95"
            >
              次のメッセージ →
            </button>
          )}
        </div>

        {/* deadpan disclaimer */}
        <p className="mt-6 text-center text-[10px] leading-relaxed text-slate-400">
          ※ 本メッセージはフィクションであり、実在の人物・団体・会長・昇級試験とは
          一切関係ありません。
        </p>

        {/* footer links */}
        <div className="mt-3 text-center">
          <a
            href="/saboten/game"
            className="text-xs text-slate-400 underline hover:text-slate-600"
          >
            サボテン叩きに戻る
          </a>
          <span className="mx-2 text-slate-300">·</span>
          <a
            href="/"
            className="text-xs text-slate-400 underline hover:text-slate-600"
          >
            旅程マップに戻る
          </a>
        </div>
      </div>
    </main>
  );
}
