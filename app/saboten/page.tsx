"use client";

import { useState } from "react";

interface Cactus {
  id: number;
  x: number;
  y: number;
  rotate: number;
  size: number;
}

export default function SabotenPage() {
  const [cacti, setCacti] = useState<Cactus[]>([]);
  const [count, setCount] = useState(0);

  const dispense = () => {
    const burst = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() - 0.5) * 80,
      y: 50 + (Math.random() - 0.5) * 60,
      rotate: (Math.random() - 0.5) * 720,
      size: 60 + Math.random() * 80,
    }));
    setCacti((prev) => [...prev, ...burst]);
    setCount((c) => c + burst.length);
    setTimeout(() => {
      setCacti((prev) => prev.filter((c) => !burst.find((b) => b.id === c.id)));
    }, 2500);
  };

  const reset = () => {
    setCacti([]);
    setCount(0);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-emerald-50 to-sky-50">
      <div className="z-10 flex flex-col items-center gap-6 px-4 text-center">
        <h1 className="text-3xl font-black tracking-tight text-emerald-900 sm:text-5xl">
          🌵 サボテン発券機 🌵
        </h1>
        <p className="text-sm text-emerald-700">
          発券したサボテン累計: <span className="font-bold">{count}</span> 本
        </p>

        <button
          onClick={dispense}
          className="group relative overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 px-10 py-6 text-2xl font-bold text-white shadow-2xl transition active:scale-95 sm:text-3xl"
        >
          <span className="relative z-10">サボテンを発券する</span>
          <span className="absolute inset-0 -z-0 scale-0 rounded-full bg-emerald-300 opacity-50 transition group-active:scale-150" />
        </button>

        <button
          onClick={reset}
          className="text-xs text-emerald-600 underline hover:text-emerald-800"
        >
          リセット
        </button>

        <a
          href="/saboten/game"
          className="rounded-full bg-amber-500 px-5 py-2 text-sm font-bold text-white shadow hover:bg-amber-600"
        >
          🎮 サボテン叩きゲームへ
        </a>

        <a
          href="/"
          className="text-xs text-slate-500 underline hover:text-slate-700"
        >
          ← 旅程マップに戻る
        </a>
      </div>

      <div className="pointer-events-none absolute inset-0">
        {cacti.map((c) => (
          <span
            key={c.id}
            className="absolute animate-saboten-burst select-none"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              fontSize: `${c.size}px`,
              transform: `translate(-50%, -50%) rotate(${c.rotate}deg)`,
            }}
          >
            🌵
          </span>
        ))}
      </div>

      <style jsx global>{`
        @keyframes saboten-burst {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
          }
          20% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.4)
              rotate(var(--end-rotate, 360deg));
          }
          70% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, calc(-50% + 80px)) scale(0.5)
              rotate(0deg);
          }
        }
        .animate-saboten-burst {
          animation: saboten-burst 2.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
    </main>
  );
}
