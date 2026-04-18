"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { TripData } from "@/lib/trip";
import Itinerary from "@/components/Itinerary";
import { TripProvider } from "@/components/TripContext";

const MapView = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[var(--parchment-dark)] text-sm italic text-[var(--ink-soft)] font-body">
      Mappa Europae を召喚中…
    </div>
  ),
});

interface Props {
  initialTrip: TripData;
}

export default function TripApp({ initialTrip }: Props) {
  const [trip, setTrip] = useState<TripData>(initialTrip);
  const [source, setSource] = useState<"local" | "sheet">("local");
  const [selectedDate, setSelectedDate] = useState<string | "all">("all");
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/trip")
      .then((r) => r.json())
      .then((json: { source: "local" | "sheet"; data: TripData }) => {
        if (cancelled) return;
        setTrip(json.data);
        setSource(json.source);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <TripProvider value={trip}>
      <main className="relative flex h-screen w-screen flex-col md:flex-row">
        <aside className="h-1/2 w-full border-b border-[rgba(122,29,29,0.2)] md:h-full md:w-[440px] md:border-b-0 md:border-r">
          <Itinerary
            selectedDate={selectedDate}
            onSelectDate={(d) => {
              setSelectedDate(d);
              setFocusedKey(null);
            }}
            onFocus={(k) => setFocusedKey(k)}
          />
        </aside>
        <section className="relative h-1/2 w-full md:h-full md:flex-1">
          <MapView selectedDate={selectedDate} focusedKey={focusedKey} />
          {/* decorative compass rose overlay */}
          <div className="pointer-events-none absolute left-3 top-3 hidden sm:block">
            <div className="flex items-center gap-2 rounded-sm border border-[rgba(122,29,29,0.35)] bg-[rgba(243,231,201,0.85)] px-2 py-1 font-title text-[10px] tracking-[0.3em] text-[var(--burgundy)] shadow-sm backdrop-blur">
              ⚜ MAPPA EUROPAE ⚜
            </div>
          </div>
        </section>

        <div className="pointer-events-none absolute right-2 top-2 rounded-sm border border-[rgba(122,29,29,0.3)] bg-[rgba(243,231,201,0.85)] px-2 py-0.5 font-title text-[9px] tracking-[0.2em] text-[var(--ink-soft)] shadow-sm">
          SCROLL · {source}
        </div>

        <a
          href="/saboten/game"
          aria-label="サボテン叩きゲーム"
          className="absolute bottom-4 right-4 z-[1000] flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--burgundy)] bg-[var(--parchment)] text-2xl shadow-lg transition hover:scale-110 active:scale-95"
        >
          🌵
        </a>
      </main>
    </TripProvider>
  );
}
