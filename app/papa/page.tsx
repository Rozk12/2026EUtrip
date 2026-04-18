"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Noto_Serif_JP } from "next/font/google";
import { DAD_QUOTES } from "@/data/dad-quotes";

const hyoro = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["200"],
  display: "swap",
});

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
    <main className="flex h-[100dvh] flex-col bg-black text-white">
      {/* top header */}
      <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-400">
        <span className="rounded bg-slate-800 px-2 py-0.5 font-medium">
          広告
        </span>
        <span className="opacity-60">#{String(quote.id).padStart(2, "0")}</span>
      </div>

      {/* main ad body */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-4 py-4">
        {/* speech bubble */}
        <div className="relative w-full max-w-md rounded-3xl bg-white px-5 py-5 text-slate-900 shadow-2xl">
          <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-amber-600">
            {quote.title}
          </div>
          <div
            className={`${hyoro.className} whitespace-pre-wrap text-[15px] leading-loose tracking-[0.05em] text-slate-800 sm:text-base`}
          >
            {quote.body}
          </div>
          {/* tail */}
          <span
            aria-hidden
            className="absolute left-10 top-full -mt-[1px] h-0 w-0 border-x-[14px] border-t-[20px] border-x-transparent border-t-white"
          />
        </div>

        {/* namazu */}
        <div className="ml-4 h-20 w-20 shrink-0 self-start overflow-hidden rounded-full ring-4 ring-amber-400 sm:h-28 sm:w-28">
          <Image
            src="/assets/dad-namazu.png"
            alt=""
            width={128}
            height={128}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </div>

      {/* skip button */}
      <div className="flex shrink-0 justify-end bg-black p-4">
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
