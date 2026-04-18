"use client";

import { useEffect, useRef, useState } from "react";
import CactusFace, { type Face } from "@/components/CactusFace";

const HOLES = 9;
const GAME_SECONDS = 30;
const SPAWN_START_MS = 700;
const SPAWN_END_MS = 350;
const SHOW_START_MS = 1200;
const SHOW_END_MS = 700;
const DOUBLE_SPAWN_AFTER_S = 15;

const FACES: Face[] = ["sad", "dizzy", "silly", "angry", "shock", "wink"];
const RISE_VARIANTS = [
  "rise-zigzag",
  "rise-wobble",
  "rise-spin",
  "rise-pause",
  "rise-drift",
] as const;

interface HoleState {
  active: boolean;
  hitKey: number;
  spawnedAt: number;
}

interface SkyCactus {
  id: number;
  x: number;
  delay: number;
  size: number;
  duration: number;
  variant: (typeof RISE_VARIANTS)[number];
  face: Face;
  spinDir: 1 | -1;
}

const emptyHoles = (): HoleState[] =>
  Array.from({ length: HOLES }, () => ({
    active: false,
    hitKey: 0,
    spawnedAt: 0,
  }));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const pick = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export default function WhackPage() {
  const [holes, setHoles] = useState<HoleState[]>(emptyHoles);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [phase, setPhase] = useState<"idle" | "playing" | "over">("idle");
  const [hits, setHits] = useState<{ id: number; idx: number }[]>([]);
  const [skyCacti, setSkyCacti] = useState<SkyCactus[]>([]);
  const [showNarration, setShowNarration] = useState(false);
  const [canRestart, setCanRestart] = useState(false);

  const spawnRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  const stopAll = () => {
    if (spawnRef.current) clearTimeout(spawnRef.current);
    if (hideRef.current) clearInterval(hideRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    spawnRef.current = null;
    hideRef.current = null;
    tickRef.current = null;
  };

  const showMs = () => {
    const t = Math.min(elapsedRef.current / GAME_SECONDS, 1);
    return lerp(SHOW_START_MS, SHOW_END_MS, t);
  };

  const spawnDelay = () => {
    const t = Math.min(elapsedRef.current / GAME_SECONDS, 1);
    return lerp(SPAWN_START_MS, SPAWN_END_MS, t);
  };

  const spawnOne = () => {
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
  };

  const scheduleSpawn = () => {
    spawnRef.current = setTimeout(() => {
      spawnOne();
      if (elapsedRef.current >= DOUBLE_SPAWN_AFTER_S && Math.random() < 0.3) {
        setTimeout(spawnOne, 60);
      }
      scheduleSpawn();
    }, spawnDelay());
  };

  const launchSky = (count: number) => {
    const arr: SkyCactus[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: 5 + Math.random() * 90,
      delay: Math.random() * 1.5,
      size: 36 + Math.random() * 24,
      duration: 5 + Math.random() * 2.5,
      variant: pick(RISE_VARIANTS),
      face: pick(FACES),
      spinDir: Math.random() < 0.5 ? 1 : -1,
    }));
    setSkyCacti(arr);
    setTimeout(() => setSkyCacti([]), 9000);
  };

  const start = () => {
    stopAll();
    setHoles(emptyHoles());
    setScore(0);
    setMissed(0);
    setCombo(0);
    setBestCombo(0);
    setTimeLeft(GAME_SECONDS);
    setPhase("playing");
    setSkyCacti([]);
    setShowNarration(false);
    setCanRestart(false);
    elapsedRef.current = 0;

    scheduleSpawn();

    hideRef.current = setInterval(() => {
      const now = Date.now();
      const limit = showMs();
      setHoles((prev) => {
        let missedNow = 0;
        const next = prev.map((h) => {
          if (h.active && now - h.spawnedAt > limit) {
            missedNow += 1;
            return { active: false, hitKey: 0, spawnedAt: 0 };
          }
          return h;
        });
        if (missedNow > 0) {
          setMissed((m) => m + missedNow);
          setCombo(0);
        }
        return next;
      });
    }, 80);

    tickRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setTimeLeft((t) => {
        if (t <= 1) {
          stopAll();
          setHoles(emptyHoles());
          setPhase("over");
          setCanRestart(false);
          setMissed((m) => {
            setTimeout(() => {
              launchSky(Math.min(Math.max(m, 1), 50));
              setShowNarration(true);
            }, 300);
            setTimeout(() => setCanRestart(true), 5500);
            return m;
          });
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
      setCombo((c) => {
        const nc = c + 1;
        setBestCombo((b) => Math.max(b, nc));
        return nc;
      });
      setHits((h) => [...h, { id, idx }]);
      setTimeout(() => {
        setHits((h) => h.filter((x) => x.id !== id));
      }, 600);
      return next;
    });
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-start gap-4 overflow-hidden bg-gradient-to-b from-sky-300 via-amber-50 to-amber-200 px-4 pb-8 pt-6">
      <h1 className="z-10 text-2xl font-black tracking-tight text-emerald-900 sm:text-4xl">
        🌵 サボテン叩き 🌵
      </h1>

      <div className="z-10 flex w-full max-w-md items-center justify-between rounded-2xl bg-white/80 px-5 py-3 shadow">
        <div>
          <div className="text-xs text-slate-500">スコア</div>
          <div className="text-3xl font-bold text-emerald-700">{score}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-500">コンボ</div>
          <div
            className={`text-2xl font-bold tabular-nums ${
              combo >= 5 ? "text-amber-600" : "text-slate-700"
            }`}
          >
            {combo}
            <span className="text-xs text-slate-400">×</span>
          </div>
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

      <div className="z-10 grid w-full max-w-md grid-cols-3 gap-3 sm:gap-4">
        {holes.map((h, idx) => {
          const hit = hits.find((x) => x.idx === idx);
          return (
            <button
              key={idx}
              onClick={() => whack(idx)}
              className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-b from-amber-200 to-amber-400 shadow-inner"
            >
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-amber-700 to-transparent opacity-50" />
              <div className="absolute inset-x-0 bottom-0 flex justify-center pb-1">
                <span
                  className={`text-5xl transition-transform duration-150 ease-out sm:text-6xl ${
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
          className="z-10 mt-2 rounded-full bg-emerald-600 px-8 py-4 text-xl font-bold text-white shadow-lg active:scale-95"
        >
          スタート
        </button>
      )}

      {phase === "over" && (
        <div className="z-10 flex flex-col items-center gap-3 rounded-2xl bg-white/85 px-6 py-5 shadow backdrop-blur">
          <div className="text-sm text-slate-600">ゲーム終了</div>
          <div className="text-4xl font-black text-emerald-700">
            {score} 本獲得 🌵
          </div>
          <div className="flex gap-4 text-xs text-slate-500">
            <span>最大コンボ: {bestCombo}</span>
            <span>見逃し: {missed}</span>
          </div>
          <button
            onClick={canRestart ? start : undefined}
            disabled={!canRestart}
            className={`mt-2 rounded-full px-6 py-3 text-base font-bold text-white shadow transition active:scale-95 ${
              canRestart
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "cursor-not-allowed bg-slate-400"
            }`}
          >
            {canRestart ? "もう一回" : "見送り中…"}
          </button>
        </div>
      )}

      <div className="z-10 mt-auto flex gap-4 pt-4 text-xs text-slate-500">
        <a href="/" className="underline hover:text-slate-700">
          ← 旅程マップに戻る
        </a>
      </div>

      {/* sky-bound cacti */}
      <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
        {skyCacti.map((c) => (
          <div
            key={c.id}
            className={`absolute saboten-${c.variant}`}
            style={{
              left: `${c.x}%`,
              bottom: "-80px",
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
            }}
          >
            <div
              className="saboten-spin"
              style={{
                animationDuration: `${2 + Math.random() * 2}s`,
                animationDirection: c.spinDir > 0 ? "normal" : "reverse",
              }}
            >
              <CactusFace face={c.face} size={c.size} />
            </div>
          </div>
        ))}
      </div>

      {/* narration */}
      {showNarration && (
        <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center px-6">
          <div className="rounded-2xl bg-black/70 px-6 py-4 text-center text-lg font-bold text-white shadow-2xl backdrop-blur saboten-narration sm:text-2xl">
            …こうして、サボテンたちは空へと帰っていった。
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes hit {
          0% { opacity: 0; transform: scale(0.5) translateY(0); }
          30% { opacity: 1; transform: scale(1.4) translateY(-10px); }
          100% { opacity: 0; transform: scale(1) translateY(-40px); }
        }
        .animate-hit { animation: hit 0.6s ease-out forwards; }

        /* base spin/wobble for inner element */
        @keyframes saboten-spin {
          0% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
          100% { transform: rotate(-15deg); }
        }
        .saboten-spin {
          animation-name: saboten-spin;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }

        /* zigzag rise */
        @keyframes saboten-zigzag {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 1; }
          25% { transform: translate(40px, -25vh); }
          50% { transform: translate(-40px, -50vh); }
          75% { transform: translate(40px, -75vh); }
          90% { opacity: 1; }
          100% { transform: translate(0, -110vh); opacity: 0; }
        }
        .saboten-rise-zigzag {
          animation-name: saboten-zigzag;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }

        /* gentle wobble rise */
        @keyframes saboten-wobble {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 1; }
          20% { transform: translate(15px, -20vh); }
          40% { transform: translate(-15px, -40vh); }
          60% { transform: translate(15px, -60vh); }
          80% { transform: translate(-15px, -80vh); }
          90% { opacity: 1; }
          100% { transform: translate(0, -110vh); opacity: 0; }
        }
        .saboten-rise-wobble {
          animation-name: saboten-wobble;
          animation-timing-function: ease-in-out;
          animation-fill-mode: forwards;
        }

        /* spin rise */
        @keyframes saboten-spin-rise {
          0% { transform: translate(0, 0) rotate(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(0, -110vh) rotate(720deg); opacity: 0; }
        }
        .saboten-rise-spin {
          animation-name: saboten-spin-rise;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }

        /* pause-and-go: rises, stops, wiggles, zooms */
        @keyframes saboten-pause {
          0% { transform: translate(0, 0); opacity: 0; }
          8% { opacity: 1; }
          25% { transform: translate(0, -25vh); }
          35% { transform: translate(8px, -25vh); }
          45% { transform: translate(-8px, -25vh); }
          55% { transform: translate(0, -25vh); }
          80% { transform: translate(0, -60vh); }
          100% { transform: translate(0, -110vh); opacity: 0; }
        }
        .saboten-rise-pause {
          animation-name: saboten-pause;
          animation-timing-function: cubic-bezier(0.4, 0.1, 0.6, 0.9);
          animation-fill-mode: forwards;
        }

        /* lazy drift: slow upward, big horizontal sway */
        @keyframes saboten-drift {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translate(60px, -55vh); }
          100% { transform: translate(-30px, -110vh); opacity: 0; }
        }
        .saboten-rise-drift {
          animation-name: saboten-drift;
          animation-timing-function: ease-in-out;
          animation-fill-mode: forwards;
        }

        /* narration fade */
        @keyframes narration {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          15% { opacity: 1; transform: translateY(0) scale(1); }
          85% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-10px) scale(1); }
        }
        .saboten-narration {
          animation: narration 5s ease-in-out forwards;
        }
      `}</style>
    </main>
  );
}
