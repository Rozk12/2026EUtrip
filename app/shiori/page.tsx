"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadJournal,
  deleteEntry,
  clearJournal,
  formatSavedAt,
  saveEntry,
  makeThumb,
  type JournalEntry,
} from "@/lib/journal";

export default function ShioriPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Ask-from-journal state
  const [askingId, setAskingId] = useState<string | null>(null);
  const [askQuestion, setAskQuestion] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askAnswer, setAskAnswer] = useState<string | null>(null);
  const [askError, setAskError] = useState<string | null>(null);
  const [askSaved, setAskSaved] = useState(false);
  const askInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEntries(loadJournal());
  }, []);

  const openAsk = (id: string) => {
    setAskingId(id);
    setAskQuestion("");
    setAskAnswer(null);
    setAskError(null);
    setAskSaved(false);
    setTimeout(() => askInputRef.current?.focus(), 50);
  };

  const closeAsk = () => {
    setAskingId(null);
    setAskAnswer(null);
    setAskError(null);
  };

  const handleAsk = async (entry: JournalEntry) => {
    if (!askQuestion.trim()) return;
    setAskLoading(true);
    setAskAnswer(null);
    setAskError(null);
    setAskSaved(false);
    try {
      const imageBase64 = entry.imageThumb
        ? entry.imageThumb.split(",")[1]
        : null;
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageBase64,
          mediaType: "image/jpeg",
          question: askQuestion.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setAskAnswer(data.answer ?? "");
    } catch (e) {
      setAskError((e as Error).message);
    } finally {
      setAskLoading(false);
    }
  };

  const handleSaveAsk = async (entry: JournalEntry) => {
    if (!askAnswer) return;
    const thumb = entry.imageThumb
      ? await makeThumb(entry.imageThumb)
      : undefined;
    const newEntry = saveEntry({
      mode: entry.imageThumb ? "camera" : "text",
      imageThumb: thumb,
      question: askQuestion.trim(),
      answer: askAnswer,
    });
    setEntries((prev) => [newEntry, ...prev]);
    setAskSaved(true);
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (expanded === id) setExpanded(null);
    if (askingId === id) closeAsk();
  };

  const handleClear = () => {
    clearJournal();
    setEntries([]);
    setConfirmClear(false);
    closeAsk();
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
            const isAsking = askingId === entry.id;

            return (
              <article
                key={entry.id}
                className="overflow-hidden border border-[rgba(212,168,75,0.35)] bg-[var(--night)]"
              >
                {/* Entry header */}
                <button
                  onClick={() => {
                    setExpanded(isExpanded ? null : entry.id);
                    if (isAsking) closeAsk();
                  }}
                  className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-[rgba(212,168,75,0.05)]"
                >
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

                    {/* Ask again section */}
                    <div className="mt-4 border-t border-dashed border-[rgba(212,168,75,0.2)] pt-3">
                      {!isAsking ? (
                        <button
                          onClick={() => openAsk(entry.id)}
                          className="w-full border border-[rgba(212,168,75,0.4)] py-2 font-title text-[10px] tracking-[0.3em] text-[var(--gold)] transition hover:bg-[rgba(212,168,75,0.08)]"
                        >
                          🧞 この写真についてもっと聞く
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className="font-title text-[9px] tracking-[0.3em] text-[var(--gold)]">
                            もう一度 Gemini に聞く
                          </div>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleAsk(entry);
                            }}
                            className="flex gap-2"
                          >
                            <input
                              ref={askInputRef}
                              value={askQuestion}
                              onChange={(e) => setAskQuestion(e.target.value)}
                              placeholder="例: 何世紀の建物？"
                              className="flex-1 rounded-full border border-[rgba(212,168,75,0.4)] bg-[var(--midnight)] px-3 py-2 text-[12px] text-[var(--cream)] placeholder:text-[var(--cream-soft)] focus:border-[var(--gold)] focus:outline-none"
                              disabled={askLoading}
                            />
                            <button
                              type="submit"
                              disabled={askLoading || !askQuestion.trim()}
                              className="rounded-full bg-[var(--gold)] px-4 py-2 font-title text-[10px] tracking-[0.2em] text-[var(--midnight)] disabled:opacity-40"
                            >
                              聞く
                            </button>
                          </form>

                          {askLoading && (
                            <div className="flex items-center gap-2 py-2">
                              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" />
                              <span className="font-title text-[10px] tracking-[0.3em] text-[var(--gold)]">
                                ANALYZING…
                              </span>
                            </div>
                          )}

                          {askError && (
                            <p className="text-[11px] text-red-400">{askError}</p>
                          )}

                          {askAnswer && (
                            <div className="rounded bg-[var(--midnight)] p-3">
                              <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-[var(--cream)]">
                                {askAnswer}
                              </p>
                              <div className="mt-3 flex items-center justify-between">
                                <button
                                  onClick={closeAsk}
                                  className="font-title text-[9px] tracking-[0.2em] text-[var(--cream-soft)] underline opacity-60"
                                >
                                  閉じる
                                </button>
                                {askSaved ? (
                                  <span className="font-title text-[9px] tracking-[0.2em] text-[var(--gold)]">
                                    ✓ 保存しました
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleSaveAsk(entry)}
                                    className="border border-[var(--gold)] px-3 py-1 font-title text-[9px] tracking-[0.2em] text-[var(--gold)] transition hover:bg-[rgba(212,168,75,0.1)]"
                                  >
                                    📖 しおりに追加
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {!askAnswer && !askLoading && (
                            <button
                              onClick={closeAsk}
                              className="font-title text-[9px] tracking-[0.2em] text-[var(--cream-soft)] underline opacity-60"
                            >
                              キャンセル
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex justify-end">
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
