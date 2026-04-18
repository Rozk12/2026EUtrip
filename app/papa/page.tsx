"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { DAD_QUOTES } from "@/data/dad-quotes";

const FAKE_ADS = [
  "🔥 今なら無料で父の説教が聞き放題！",
  "⚡ 緊急！あなたに父からの重要なお知らせがあります",
  "🎁 特別プレゼント：追加で10個の名言をゲット",
  "📈 あなたの社会人偏差値が +3 上昇しました",
  "🏆 称号「見込みあり」を獲得しました",
  "✨ 父があなたの返信を待っています（既読がついています）",
  "💼 新入社員研修に無料招待されました",
  "📚 凡事徹底の極意をマスターしました",
];

export default function PapaPage() {
  const [idx, setIdx] = useState(0);
  const [closedAds, setClosedAds] = useState<number[]>([]);
  const [closedCount, setClosedCount] = useState(0);
  const [xBaited, setXBaited] = useState(false);

  const quote = DAD_QUOTES[idx];
  const isLast = idx === DAD_QUOTES.length - 1;

  useEffect(() => {
    // re-surface ads occasionally for annoyance
    const t = setInterval(() => {
      setClosedAds([]);
    }, 9000);
    return () => clearInterval(t);
  }, []);

  const next = () => setIdx((i) => Math.min(i + 1, DAD_QUOTES.length - 1));
  const prev = () => setIdx((i) => Math.max(i - 1, 0));

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-yellow-100 via-orange-50 to-rose-50 pb-20">
      {/* fake top banner */}
      <div className="relative z-10 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 py-3 text-center text-white shadow">
        <div className="animate-pulse text-sm font-black sm:text-base">
          🚨 緊急通知 🚨 父からのメッセージが {DAD_QUOTES.length} 件届いています
          🚨
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
        {/* sponsor card */}
        <div className="mb-4 flex items-center gap-3 rounded-2xl border-2 border-dashed border-amber-400 bg-white/80 p-3 shadow-sm">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-amber-400">
            <Image
              src="/assets/dad-namazu.png"
              alt="父"
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              スポンサー
            </div>
            <div className="text-sm font-bold text-slate-800">
              父（本業: 会社員・副業: 名言収集）
            </div>
            <div className="text-[11px] italic text-slate-500">
              AIに詳しく、ドラッカーを敬愛
            </div>
          </div>
          <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            PR
          </span>
        </div>

        {/* progress */}
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>
            {idx + 1} / {DAD_QUOTES.length} 件目
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

        {/* quote card */}
        <div className="relative rounded-3xl bg-white p-5 shadow-lg">
          <div className="absolute -top-3 left-4 rounded-full bg-rose-500 px-3 py-0.5 text-[10px] font-bold text-white shadow">
            #{String(quote.id).padStart(2, "0")}
          </div>
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-amber-600">
            {quote.title}
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {quote.body}
          </div>
        </div>

        {/* fake ad slot 1 */}
        {!closedAds.includes(0) && (
          <FakeAd
            text={FAKE_ADS[idx % FAKE_ADS.length]}
            onClose={() => {
              setClosedAds((c) => [...c, 0]);
              setClosedCount((c) => c + 1);
            }}
            tone="rose"
          />
        )}

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
              次の名言を見る →
            </button>
          )}
        </div>

        {/* fake ad slot 2 */}
        {!closedAds.includes(1) && (
          <FakeAd
            text={FAKE_ADS[(idx + 3) % FAKE_ADS.length]}
            onClose={() => {
              setClosedAds((c) => [...c, 1]);
              setClosedCount((c) => c + 1);
            }}
            tone="emerald"
          />
        )}

        {/* fake ad slot 3 */}
        {!closedAds.includes(2) && (
          <FakeAd
            text={FAKE_ADS[(idx + 5) % FAKE_ADS.length]}
            onClose={() => {
              setClosedAds((c) => [...c, 2]);
              setClosedCount((c) => c + 1);
            }}
            tone="sky"
          />
        )}

        {/* stats */}
        <div className="mt-6 rounded-2xl bg-white/70 p-3 text-center text-xs text-slate-500 shadow-inner">
          今日閉じた広告の数: <b>{closedCount}</b> 個 / それでもまだ広告は消えない
        </div>

        {/* skip link at bottom */}
        <div className="mt-4 text-center">
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

      {/* bottom sticky fake toast */}
      <div className="fixed bottom-4 left-1/2 z-30 w-[92%] max-w-sm -translate-x-1/2 rounded-2xl bg-slate-900/95 px-4 py-3 text-white shadow-2xl animate-bounce-slow">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-amber-400">
            <Image
              src="/assets/dad-namazu.png"
              alt="父"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-bold text-amber-300">父</div>
            <div className="truncate">
              {isLast
                ? "最後まで読んでくれてありがとう。"
                : `あと ${DAD_QUOTES.length - idx - 1} 件あります。`}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translate(-50%, 0);
          }
          50% {
            transform: translate(-50%, -6px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.4s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

function FakeAd({
  text,
  onClose,
  tone,
}: {
  text: string;
  onClose: () => void;
  tone: "rose" | "emerald" | "sky";
}) {
  const toneClass = {
    rose: "from-rose-400 via-pink-400 to-rose-500",
    emerald: "from-emerald-400 via-teal-400 to-emerald-500",
    sky: "from-sky-400 via-indigo-400 to-sky-500",
  }[tone];

  return (
    <div
      className={`relative my-3 overflow-hidden rounded-2xl bg-gradient-to-r ${toneClass} p-4 text-white shadow`}
    >
      <div className="absolute right-1 top-1 flex items-center gap-1 text-[9px] opacity-80">
        <span className="rounded bg-white/30 px-1">広告</span>
        <button
          onClick={onClose}
          className="flex h-5 w-5 items-center justify-center rounded-full bg-white/30"
        >
          ×
        </button>
      </div>
      <div className="pr-10 text-sm font-bold">{text}</div>
    </div>
  );
}
