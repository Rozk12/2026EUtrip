"use client";

import { useEffect, useState } from "react";
import {
  loadJournal,
  deleteEntry,
  clearJournal,
  formatSavedAt,
  type JournalEntry,
} from "@/lib/journal";

export default function ShioriPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setEntries(loadJournal());
  }, []);

  const handleDelete = (id: string) => {
    deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const handleClear = () => {
    clearJournal();
    setEntries([]);
    setConfirmClear(false);
  };

  return (
    <main
      className="min-h-[100dvh] bg-[var(--midnight)] px-4 text-[var(--cream)]"
      style={{
        paddingTop: "calc(1.5rem + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(4rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="mx-auto max-w-md">
        {/* Header */}
        <header className="mb-6 text-center">
          <div className="chevron-label">REJSEDAGBOG</div>
          <h1 className="mt-1 font-deco text-3xl text-[var(--gold)]">
            旅のしおり
          </h1>
          <p className="mt-1 text-[11px] italic text-[var(--cream-soft)]">
            Gemini との記録
          </p>
        </header>

        {/* Empty state */}
        {entries.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <div className="text-5xl opacity-30">📖</div>
            <p className="font-title text-[11px] tracking-[0.3em] text-[var(--cream-soft)]">
              まだ記録がありません
            </p>
            <p className="text-[11px] italic text-[var(--cream-soft)] opacity-70">
              📷 カメラページで Gemini に聞いたあと
              <br />「しおりに追加」で保存できます
            </p>
          </div>
        )}

        {/* Entries */}
        <div className="space-y-4">
          {entries.map((entry, i) => {
            const isExpanded = expanded === entry.id;
            return (
              <article
                key={entry.id}
                className="overflow-hidden border border-[rgba(212,168,75,0.35)] bg-[var(--night)]"
              >
                {/* Entry header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : entry.id)}
                  className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-[rgba(212,168,75,0.05)]"
                >
                  {/* Thumbnail */}
                  {entry.imageThumb ? (
                    <img
                      src={entry.imageThumb}
                      alt=""
                      className="h-16 w-16 shrink-0 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-[rgba(212,168,75,0.2)] text-2xl opacity-40">
                      💬
                    </div>
                  )}

                  {/* Meta */}
                  <div className="min-w-0 flex-1">
                    <div className="font-title text-[9px] tracking-[0.3em] text-[var(--gold)] opacity-70">
                      {formatSavedAt(entry.savedAt)}
                    </div>
                    <div className="mt-1 line-clamp-2 text-[12px] leading-snug text-[var(--cream)]">
                      {entry.question}
                    </div>
                  </div>

                  <span
                    className={`mt-1 shrink-0 text-[10px] text-[var(--cream-soft)] transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-dashed border-[rgba(212,168,75,0.25)] px-4 pb-4 pt-3">
                    {entry.imageThumb && (
                      <img
                        src={entry.imageThumb}
                        alt=""
                        className="mb-3 w-full rounded"
                      />
                    )}
                    <div className="mb-2 font-title text-[9px] tracking-[0.3em] text-[var(--gold)]">
                      Q
                    </div>
                    <p className="mb-3 text-[12px] italic text-[var(--cream-soft)]">
                      {entry.question}
                    </p>
                    <div className="mb-2 font-title text-[9px] tracking-[0.3em] text-[var(--gold)]">
                      SVAR
                    </div>
                    <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-[var(--cream)]">
                      {entry.answer}
                    </p>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="font-title text-[9px] tracking-[0.3em] text-[var(--cream-soft)] underline opacity-60 hover:opacity-100"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                )}

                {/* Serial */}
                <div className="border-t border-dashed border-[rgba(212,168,75,0.2)] px-4 py-1.5">
                  <span className="font-title text-[8px] tracking-[0.3em] text-[var(--cream-soft)] opacity-40">
                    № {String(entries.length - i).padStart(3, "0")}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Footer actions */}
        {entries.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <span className="font-title text-[9px] tracking-[0.3em] text-[var(--cream-soft)] opacity-50">
              {entries.length} 件の記録
            </span>
            {confirmClear ? (
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[var(--cream-soft)]">
                  全件削除しますか？
                </span>
                <button
                  onClick={handleClear}
                  className="font-title text-[10px] tracking-[0.2em] text-red-400 underline"
                >
                  はい
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="font-title text-[10px] tracking-[0.2em] text-[var(--cream-soft)] underline"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="font-title text-[9px] tracking-[0.3em] text-[var(--cream-soft)] opacity-50 underline hover:opacity-100"
              >
                全件削除
              </button>
            )}
          </div>
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
