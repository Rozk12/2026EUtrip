"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { DAD_QUOTES } from "@/data/dad-quotes";

const SKIP_AFTER_SECONDS = 5;

export default function PapaPage() {
  const [idx, setIdx] = useState(0);
  const [countdown, setCountdown] = useState(SKIP_AFTER_SECONDS);

  const quote = DAD_QUOTES[idx];
  const isLast = idx === DAD_QUOTES.length - 1;
  const canSkip = countdown <= 0;

  useEffect(() => {
    setCountdown(SKIP_AFTER_SECONDS);
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [idx]);

  const next = () => {
    if (!canSkip) return;
    if (isLast) {
      window.location.href = "/";
    } else {
      setIdx((i) => i + 1);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      {/* progress header */}
      <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-400">
        <span className="rounded bg-slate-800 px-2 py-0.5 font-medium">
          広告
        </span>
        <span>
          {idx + 1} / {DAD_QUOTES.length}
        </span>
      </div>

      {/* thin progress bar */}
      <div className="h-0.5 w-full bg-slate-800">
        <div
          className="h-full bg-amber-400 transition-all"
          style={{ width: `${((idx + 1) / DAD_QUOTES.length) * 100}%` }}
        />
      </div>

      {/* main ad body */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-8">
        <div className="h-48 w-48 overflow-hidden rounded-full ring-4 ring-amber-400 sm:h-64 sm:w-64">
          <Image
            src="/assets/dad-namazu.png"
            alt=""
            width={256}
            height={256}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        <div className="max-w-lg text-center">
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-amber-400">
            {quote.title}
          </div>
          <div className="whitespace-pre-wrap text-base leading-relaxed sm:text-lg">
            {quote.body}
          </div>
        </div>
      </div>

      {/* skip button */}
      <div className="flex justify-end p-4">
        <button
          onClick={next}
          disabled={!canSkip}
          className={`flex items-center gap-2 rounded border px-4 py-2 text-sm font-medium transition ${
            canSkip
              ? "border-white bg-white/10 text-white hover:bg-white/20"
              : "cursor-not-allowed border-slate-600 text-slate-400"
          }`}
        >
          {canSkip ? (
            <>
              {isLast ? "閉じる" : "広告をスキップ"} <span>›››</span>
            </>
          ) : (
            <>{countdown} 秒後にスキップできます</>
          )}
        </button>
      </div>
    </main>
  );
}
