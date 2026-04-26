"use client";

import { useState, useEffect } from "react";
import { getCityGuide } from "@/data/city-guide";

interface Props {
  city: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CityGuide({ city, isOpen, onClose }: Props) {
  const guide = getCityGuide(city);
  const [aiText, setAiText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAiText(null);
    setError(null);
  }, [city]);

  const askGemini = async () => {
    if (!guide) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `${guide.nameJa}（${guide.country}）について、旅行者として知っておくと楽しいことをもっと教えてください。地元民が愛するスポット、食べ物の注文のコツ、現地のマナー・タブー、意外な歴史の裏話など、具体的に教えてください。`,
        }),
      });
      const json = await res.json();
      if (json.answer) {
        setAiText(json.answer);
      } else {
        setError(json.error ?? "エラーが発生しました");
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  if (!guide) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className={`absolute inset-x-0 bottom-0 flex max-h-[82dvh] flex-col border-t-2 border-[var(--gold)] bg-[var(--midnight)] transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-dashed border-[rgba(212,168,75,0.4)] px-5 py-3">
          <div>
            <div className="font-deco text-[22px] leading-none text-[var(--gold)]">
              {guide.nameJa}
            </div>
            <div className="mt-1 font-title text-[9px] tracking-[0.25em] text-[var(--cream-soft)]">
              {guide.country} · {guide.tagline}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center border border-[rgba(212,168,75,0.4)] font-title text-sm text-[var(--gold)] transition hover:bg-[rgba(212,168,75,0.1)]"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {guide.sections.map((section) => (
            <div key={section.label}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-base leading-none">{section.emoji}</span>
                <span className="font-title text-[10px] tracking-[0.3em] text-[var(--gold)]">
                  {section.label}
                </span>
                <span className="h-px flex-1 bg-[rgba(212,168,75,0.2)]" />
              </div>
              <ul className="space-y-1.5">
                {section.items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-[var(--cream)]">
                    <span className="mt-0.5 shrink-0 text-[var(--gold)]">◆</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Gemini section */}
          <div className="border-t border-dashed border-[rgba(212,168,75,0.3)] pt-4">
            {!aiText && !loading && !error && (
              <button
                onClick={askGemini}
                className="w-full border border-[var(--gold)] py-3 font-title text-[10px] tracking-[0.3em] text-[var(--gold)] transition hover:bg-[rgba(212,168,75,0.1)] active:scale-95"
              >
                🧞 Gemini にもっと詳しく聞く
              </button>
            )}
            {loading && (
              <div className="animate-pulse py-4 text-center font-title text-[10px] tracking-[0.3em] text-[var(--gold)]">
                調べています…
              </div>
            )}
            {error && (
              <div className="py-2 text-center text-[11px] text-red-400">
                {error}
                <button
                  onClick={askGemini}
                  className="ml-3 underline text-[var(--gold)]"
                >
                  再試行
                </button>
              </div>
            )}
            {aiText && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-base leading-none">🧞</span>
                  <span className="font-title text-[10px] tracking-[0.3em] text-[var(--gold)]">
                    Gemini より
                  </span>
                  <span className="h-px flex-1 bg-[rgba(212,168,75,0.2)]" />
                </div>
                <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-[var(--cream)]">
                  {aiText}
                </p>
              </div>
            )}
          </div>

          <div style={{ height: "env(safe-area-inset-bottom, 1rem)" }} />
        </div>
      </div>
    </div>
  );
}
