"use client";

import { useRef, useState } from "react";

interface Preset {
  label: string;
  emoji: string;
  question: string;
}

const PHOTO_PRESETS: Preset[] = [
  {
    label: "建築様式",
    emoji: "🏛️",
    question:
      "この建物の建築様式を教えてください。時代・主な特徴・類似する有名建築を、日本語で簡潔にまとめてください。",
  },
  {
    label: "翻訳",
    emoji: "📜",
    question:
      "この画像に写っているテキストをすべて日本語に翻訳してください。必要なら原文も併記してください。",
  },
  {
    label: "メニューを読む",
    emoji: "🍽️",
    question:
      "このメニューを日本語に翻訳し、主要な料理の内容・典型的な味を簡潔に説明してください。",
  },
  {
    label: "これ何？",
    emoji: "❓",
    question:
      "この写真に写っているものは何ですか？分かる範囲で歴史・背景・見どころも日本語で教えてください。",
  },
  {
    label: "使い方",
    emoji: "🛠️",
    question:
      "この機械・装置の使い方を日本語で手順立てて教えてください（券売機・改札・両替機・公共端末など）。",
  },
];

const TEXT_PRESETS: Preset[] = [
  {
    label: "デンマーク語で",
    emoji: "🇩🇰",
    question:
      "旅行中にデンマーク（コペンハーゲン）で使える便利なフレーズを日本語→デンマーク語の対訳でいくつか教えてください（発音のカタカナも）。",
  },
  {
    label: "チェコ語で",
    emoji: "🇨🇿",
    question:
      "旅行中にチェコ（プラハ）で使える便利なフレーズを日本語→チェコ語の対訳でいくつか教えてください（発音のカタカナも）。",
  },
  {
    label: "ドイツ語で",
    emoji: "🇦🇹",
    question:
      "旅行中にオーストリア（ウィーン/ザルツブルグ）で使える便利なフレーズを日本語→ドイツ語の対訳でいくつか教えてください（発音のカタカナも）。",
  },
  {
    label: "メニュー定番",
    emoji: "🍴",
    question:
      "デンマーク・チェコ・オーストリアでよく出る料理名とその意味を、日本語で一覧にしてください。",
  },
  {
    label: "チップ・マナー",
    emoji: "💶",
    question:
      "デンマーク・チェコ・オーストリアでのチップ習慣、レストラン・カフェ・タクシーでの相場と渡し方を日本語で簡潔に教えてください。",
  },
];

type Mode = "camera" | "text";

export default function KameraPage() {
  const [mode, setMode] = useState<Mode>("camera");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [question, setQuestion] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    setAnswer(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const MAX = 1280;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height / width) * MAX);
            width = MAX;
          } else {
            width = Math.round((width / height) * MAX);
            height = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        const resized = canvas.toDataURL("image/jpeg", 0.85);
        setPreview(resized);
        setImageBase64(resized.split(",")[1]);
        setMediaType("image/jpeg");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const ask = async (q: string, opts?: { includeImage?: boolean }) => {
    const includeImage = opts?.includeImage ?? mode === "camera";
    setQuestion(q);
    setLoading(true);
    setAnswer(null);
    setError(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: includeImage ? imageBase64 : null,
          mediaType,
          question: q,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setAnswer(data.answer ?? "");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setImageBase64(null);
    setAnswer(null);
    setError(null);
    setQuestion("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main
      className="min-h-[100dvh] bg-[var(--midnight)] px-4 text-[var(--cream)]"
      style={{
        paddingTop: "calc(1.5rem + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(6rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="mx-auto max-w-md">
        <header className="mb-5 text-center">
          <div className="chevron-label">SPØRG GEMINI</div>
          <h1 className="mt-1 font-deco text-3xl text-[var(--gold)]">
            AI に聞く
          </h1>
        </header>

        {/* Tabs */}
        <div className="mb-5 flex gap-2 rounded-full border border-[rgba(212,168,75,0.35)] bg-[var(--night)] p-1">
          <button
            onClick={() => {
              setMode("camera");
              setAnswer(null);
              setError(null);
            }}
            className={`flex-1 rounded-full px-3 py-2 text-center font-title text-[11px] tracking-[0.3em] transition ${
              mode === "camera"
                ? "bg-[var(--gold)] text-[var(--midnight)]"
                : "text-[var(--cream-soft)] hover:bg-[rgba(212,168,75,0.08)]"
            }`}
          >
            📷 カメラ
          </button>
          <button
            onClick={() => {
              setMode("text");
              setAnswer(null);
              setError(null);
            }}
            className={`flex-1 rounded-full px-3 py-2 text-center font-title text-[11px] tracking-[0.3em] transition ${
              mode === "text"
                ? "bg-[var(--gold)] text-[var(--midnight)]"
                : "text-[var(--cream-soft)] hover:bg-[rgba(212,168,75,0.08)]"
            }`}
          >
            💬 テキスト
          </button>
        </div>

        {/* Camera mode */}
        {mode === "camera" && !preview && (
          <label className="block cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onInputChange}
              className="sr-only"
            />
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[var(--gold)] bg-[var(--night)] p-10 transition hover:bg-[rgba(212,168,75,0.06)]">
              <div className="text-5xl">📷</div>
              <div className="font-title text-xs tracking-[0.35em] text-[var(--gold)]">
                TAP TO CAPTURE
              </div>
              <div className="text-[11px] italic text-[var(--cream-soft)]">
                撮影 or 写真を選択
              </div>
            </div>
          </label>
        )}

        {mode === "camera" && preview && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-[var(--gold)]">
              <img src={preview} alt="preview" className="w-full" />
              <button
                onClick={reset}
                className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1 font-title text-[10px] tracking-[0.3em] text-[var(--gold)] backdrop-blur"
              >
                ✕ 撮り直し
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PHOTO_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => ask(p.question, { includeImage: true })}
                  disabled={loading}
                  className="flex flex-col items-center gap-1 rounded-xl border border-[rgba(212,168,75,0.35)] bg-[var(--night)] px-2 py-3 text-[11px] text-[var(--cream)] transition hover:bg-[rgba(212,168,75,0.08)] disabled:opacity-50"
                >
                  <span className="text-lg">{p.emoji}</span>
                  <span className="font-title tracking-wider">{p.label}</span>
                </button>
              ))}
            </div>

            <div className="deco-ornament">
              <span className="chevron-label">OR ASK YOURSELF</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = (
                  e.currentTarget.elements.namedItem("q") as HTMLInputElement
                ).value.trim();
                if (q) ask(q, { includeImage: true });
              }}
              className="flex gap-2"
            >
              <input
                name="q"
                placeholder="例: これ何？"
                className="flex-1 rounded-full border border-[rgba(212,168,75,0.4)] bg-[var(--night)] px-4 py-2 text-sm text-[var(--cream)] placeholder:text-[var(--cream-soft)] focus:border-[var(--gold)] focus:outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-[var(--gold)] px-4 py-2 font-title text-[11px] tracking-[0.3em] text-[var(--midnight)] disabled:opacity-50"
              >
                聞く
              </button>
            </form>
          </div>
        )}

        {/* Text-only mode */}
        {mode === "text" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TEXT_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => ask(p.question, { includeImage: false })}
                  disabled={loading}
                  className="flex flex-col items-center gap-1 rounded-xl border border-[rgba(212,168,75,0.35)] bg-[var(--night)] px-2 py-3 text-[11px] text-[var(--cream)] transition hover:bg-[rgba(212,168,75,0.08)] disabled:opacity-50"
                >
                  <span className="text-lg">{p.emoji}</span>
                  <span className="font-title tracking-wider">{p.label}</span>
                </button>
              ))}
            </div>

            <div className="deco-ornament">
              <span className="chevron-label">ASK ANYTHING</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = (
                  e.currentTarget.elements.namedItem("q") as HTMLInputElement
                ).value.trim();
                if (q) ask(q, { includeImage: false });
              }}
              className="flex flex-col gap-2"
            >
              <textarea
                name="q"
                rows={3}
                placeholder="例: 『ありがとう』をデンマーク語で教えて / プラハのお勧め夕食スポットは？"
                className="w-full rounded-2xl border border-[rgba(212,168,75,0.4)] bg-[var(--night)] px-4 py-3 text-sm text-[var(--cream)] placeholder:text-[var(--cream-soft)] focus:border-[var(--gold)] focus:outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="self-end rounded-full bg-[var(--gold)] px-6 py-2 font-title text-[11px] tracking-[0.3em] text-[var(--midnight)] disabled:opacity-50"
              >
                聞く
              </button>
            </form>
          </div>
        )}

        {/* Shared result area */}
        {loading && (
          <div className="mt-4 flex items-center justify-center gap-3 rounded-2xl bg-[var(--night)] p-6">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" />
            <span className="font-title text-[11px] tracking-[0.3em] text-[var(--gold)]">
              ANALYZING…
            </span>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-[var(--burgundy)] bg-[rgba(140,36,48,0.18)] p-4 text-sm">
            <div className="chevron-label mb-1">ERROR</div>
            {error}
          </div>
        )}

        {answer && (
          <article className="mt-4 rounded-2xl bg-[var(--night)] p-5 shadow-lg ring-1 ring-[rgba(212,168,75,0.35)]">
            <div className="chevron-label mb-2">SVAR</div>
            <div className="mb-3 text-[11px] italic text-[var(--cream-soft)]">
              Q: {question}
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--cream)]">
              {answer}
            </div>
          </article>
        )}

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
