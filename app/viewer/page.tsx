"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";

const PdfView = dynamic(() => import("@/components/PdfView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-title text-xs tracking-[0.3em] text-[var(--gold)]">
      LOADING…
    </div>
  ),
});

function ViewerInner() {
  const params = useSearchParams();
  const router = useRouter();
  const file = params.get("file") ?? "";
  const label = params.get("label") ?? "";

  // Only allow same-origin paths that start with /
  const safeFile = file.startsWith("/") && !file.startsWith("//") ? file : null;

  return (
    <main className="flex h-[100dvh] flex-col bg-[var(--midnight)] text-[var(--cream)]">
      <header
        className="flex shrink-0 items-center gap-3 border-b border-[rgba(212,168,75,0.3)] bg-[var(--night)] px-4 py-2"
        style={{
          paddingTop: "calc(0.5rem + env(safe-area-inset-top, 0px))",
        }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 rounded-full border border-[var(--gold)] bg-[rgba(11,24,40,0.9)] px-3 py-1.5 font-title text-[11px] tracking-[0.3em] text-[var(--gold)] active:scale-95"
        >
          <span className="text-base leading-none">←</span>
          TILBAGE
        </button>
        <div className="min-w-0 flex-1 truncate font-title text-[11px] tracking-[0.3em] text-[var(--cream-soft)]">
          {label || safeFile || ""}
        </div>
        {safeFile && (
          <a
            href={safeFile}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[rgba(212,168,75,0.4)] px-3 py-1.5 font-title text-[10px] tracking-[0.3em] text-[var(--cream-soft)] active:scale-95"
          >
            ⤢
          </a>
        )}
      </header>

      <div
        className="flex-1 overflow-hidden"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {safeFile ? (
          <PdfView file={safeFile} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm italic text-[var(--cream-soft)]">
            ファイルが指定されていません
          </div>
        )}
      </div>
    </main>
  );
}

export default function Viewer() {
  return (
    <Suspense
      fallback={
        <main className="flex h-[100dvh] items-center justify-center bg-[var(--midnight)] font-title text-xs tracking-[0.3em] text-[var(--gold)]">
          LOADING…
        </main>
      }
    >
      <ViewerInner />
    </Suspense>
  );
}
