"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { TripData } from "@/lib/trip";
import Itinerary from "@/components/Itinerary";
import { TripProvider } from "@/components/TripContext";

const MapView = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[var(--midnight)] font-title text-xs tracking-[0.3em] text-[var(--gold)]">
      LOADING MAP…
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
      <main className="relative flex h-screen w-screen flex-col bg-[var(--midnight)] md:flex-row">
        <aside className="h-1/2 w-full border-b border-[rgba(212,168,75,0.3)] md:h-full md:w-[440px] md:border-b-0 md:border-r">
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
          <div className="pointer-events-none absolute left-3 top-3 hidden sm:block">
            <div className="flex items-center gap-2 border border-[rgba(212,168,75,0.5)] bg-[rgba(11,24,40,0.85)] px-3 py-1.5 font-title text-[10px] tracking-[0.4em] text-[var(--gold)] shadow backdrop-blur">
              <span className="deco-diamond" style={{ width: 6, height: 6, margin: 0 }} />
              MAPPA · EUROPAE
              <span className="deco-diamond" style={{ width: 6, height: 6, margin: 0 }} />
            </div>
          </div>
        </section>

        <div className="pointer-events-none absolute right-2 top-2 border border-[rgba(212,168,75,0.35)] bg-[rgba(11,24,40,0.85)] px-2 py-0.5 font-title text-[9px] tracking-[0.3em] text-[var(--cream-soft)] shadow backdrop-blur">
          {source.toUpperCase()}
        </div>

        <a
          href="/saboten/game"
          aria-label="サボテン叩きゲーム"
          className="absolute bottom-4 right-4 z-[1000] flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--gold)] bg-[var(--midnight)] text-2xl shadow-lg transition hover:scale-110 hover:bg-[rgba(232,197,114,0.1)] active:scale-95"
        >
          🌵
        </a>
      </main>
    </TripProvider>
  );
}
