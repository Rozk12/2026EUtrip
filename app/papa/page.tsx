"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { DAD_QUOTES } from "@/data/dad-quotes";

const SKIP_AFTER_SECONDS = 5;

export default function PapaPage() {
  const [quote, setQuote] = useState(DAD_QUOTES[0]);
  const [countdown, setCountdown] = useState(SKIP_AFTER_SECONDS);

  useEffect(() => {
    setQuote(DAD_QUOTES[Math.floor(Math.random() * DAD_QUOTES.length)]);
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
  }, []);

  const canSkip = countdown <= 0;

  const skip = () => {
    if (!canSkip) return;
    window.location.href = "/";
  };

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      {/* top header */}
      <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-400">
        <span className="rounded bg-slate-800 px-2 py-0.5 font-medium">
          広告
        </span>
        <span className="opacity-60">#{String(quote.id).padStart(2, "0")}</span>
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
          onClick={skip}
          disabled={!canSkip}
          className={`flex items-center gap-2 rounded border px-4 py-2 text-sm font-medium transition ${
            canSkip
              ? "border-white bg-white/10 text-white hover:bg-white/20"
              : "cursor-not-allowed border-slate-600 text-slate-400"
          }`}
        >
          {canSkip ? (
            <>広告をスキップ <span>›››</span></>
          ) : (
            <>{countdown} 秒後にスキップできます</>
          )}
        </button>
      </div>
    </main>
  );
}
