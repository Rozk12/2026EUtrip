"use client";

import { useEffect, useRef, useState } from "react";

const HOLES = 9;
const GAME_SECONDS = 30;
const SPAWN_INTERVAL_MS = 700;
const CACTUS_SHOW_MS = 1200;

interface HoleState {
  active: boolean;
  hitKey: number;
  spawnedAt: number;
}

const emptyHoles = (): HoleState[] =>
  Array.from({ length: HOLES }, () => ({
    active: false,
    hitKey: 0,
    spawnedAt: 0,
  }));

export default function WhackPage() {
  const [holes, setHoles] = useState<HoleState[]>(emptyHoles);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [phase, setPhase] = useState<"idle" | "playing" | "over">("idle");
  const [hits, setHits] = useState<{ id: number; idx: number }[]>([]);

  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAll = () => {
    if (spawnRef.current) clearInterval(spawnRef.current);
    if (hideRef.current) clearInterval(hideRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    spawnRef.current = null;
    hideRef.current = null;
    tickRef.current = null;
  };

  const start = () => {
    stopAll();
    setHoles(emptyHoles());
    setScore(0);
    setTimeLeft(GAME_SECONDS);
    setPhase("playing");

    spawnRef.current = setInterval(() => {
      setHoles((prev) => {
        const empties = prev
          .map((h, i) => (h.active ? -1 : i))
          .filter((i) => i >= 0);
        if (empties.length === 0) return prev;
        const idx = empties[Math.floor(Math.random() * empties.length)];
        const next = [...prev];
        next[idx] = {
          active: true,
          hitKey: Date.now() + idx,
          spawnedAt: Date.now(),
        };
        return next;
      });
    }, SPAWN_INTERVAL_MS);

    hideRef.current = setInterval(() => {
      const now = Date.now();
      setHoles((prev) =>
        prev.map((h) =>
          h.active && now - h.spawnedAt > CACTUS_SHOW_MS
            ? { active: false, hitKey: 0, spawnedAt: 0 }
            : h,
        ),
      );
    }, 100);

    tickRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopAll();
          setPhase("over");
          setHoles(emptyHoles());
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => stopAll(), []);

  const whack = (idx: number) => {
    if (phase !== "playing") return;
    setHoles((prev) => {
      if (!prev[idx].active) return prev;
      const next = [...prev];
      const id = next[idx].hitKey;
      next[idx] = { active: false, hitKey: 0, spawnedAt: 0 };
      setScore((s) => s + 1);
      setHits((h) => [...h, { id, idx }]);
      setTimeout(() => {
        setHits((h) => h.filter((x) => x.id !== id));
      }, 600);
      return next;
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-4 bg-gradient-to-b from-sky-200 via-amber-50 to-amber-100 px-4 pb-8 pt-6">
      <h1 className="text-2xl font-black tracking-tight text-emerald-900 sm:text-4xl">
        🌵 サボテン叩き 🌵
      </h1>

      <div className="flex w-full max-w-md items-center justify-between rounded-2xl bg-white/70 px-5 py-3 shadow">
        <div>
          <div className="text-xs text-slate-500">スコア</div>
          <div className="text-3xl font-bold text-emerald-700">{score}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">残り時間</div>
          <div
            className={`text-3xl font-bold tabular-nums ${
              timeLeft <= 5 ? "text-rose-600" : "text-slate-800"
            }`}
          >
            {timeLeft}s
          </div>
        </div>
      </div>

      <div className="grid w-full max-w-md grid-cols-3 gap-3 sm:gap-4">
        {holes.map((h, idx) => {
          const hit = hits.find((x) => x.idx === idx);
          return (
            <button
              key={idx}
              onClick={() => whack(idx)}
              className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-b from-amber-200 to-amber-400 shadow-inner"
            >
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-amber-700 to-transparent opacity-50" />
              <div className="absolute inset-x-0 bottom-0 flex justify-center pb-2">
                <span
                  className={`text-5xl transition-transform duration-200 ease-out sm:text-6xl ${
                    h.active
                      ? "translate-y-0 opacity-100"
                      : "translate-y-full opacity-0"
                  }`}
                >
                  🌵
                </span>
              </div>
              {hit && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-3xl font-black text-rose-600 animate-hit">
                  +1
                </span>
              )}
            </button>
          );
        })}
      </div>

      {phase === "idle" && (
        <button
          onClick={start}
          className="mt-2 rounded-full bg-emerald-600 px-8 py-4 text-xl font-bold text-white shadow-lg active:scale-95"
        >
          スタート
        </button>
      )}

      {phase === "over" && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/80 px-6 py-5 shadow">
          <div className="text-sm text-slate-600">ゲーム終了！</div>
          <div className="text-4xl font-black text-emerald-700">
            {score} 本獲得 🌵
          </div>
          <div className="text-xs text-slate-500">
            {score >= 30
              ? "サボテンマスター！"
              : score >= 20
                ? "上手！"
                : score >= 10
                  ? "もうちょい！"
                  : "練習しよう"}
          </div>
          <button
            onClick={start}
            className="mt-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-bold text-white shadow active:scale-95"
          >
            もう一回
          </button>
        </div>
      )}

      <div className="mt-auto flex gap-4 pt-4 text-xs text-slate-500">
        <a href="/" className="underline hover:text-slate-700">
          ← 旅程マップに戻る
        </a>
      </div>

      <style jsx global>{`
        @keyframes hit {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(0);
          }
          30% {
            opacity: 1;
            transform: scale(1.4) translateY(-10px);
          }
          100% {
            opacity: 0;
            transform: scale(1) translateY(-40px);
          }
        }
        .animate-hit {
          animation: hit 0.6s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
