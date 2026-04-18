"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { TripData } from "@/lib/trip";
import Itinerary from "@/components/Itinerary";
import { TripProvider } from "@/components/TripContext";

const MapView = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-500">
      地図を読み込み中…
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
      .catch(() => {
        /* keep initial */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <TripProvider value={trip}>
      <main className="relative flex h-screen w-screen flex-col md:flex-row">
        <aside className="h-1/2 w-full border-b border-slate-200 md:h-full md:w-[420px] md:border-b-0 md:border-r">
          <Itinerary
            selectedDate={selectedDate}
            onSelectDate={(d) => {
              setSelectedDate(d);
              setFocusedKey(null);
            }}
            onFocus={(k) => setFocusedKey(k)}
          />
        </aside>
        <section className="h-1/2 w-full md:h-full md:flex-1">
          <MapView selectedDate={selectedDate} focusedKey={focusedKey} />
        </section>
        <div className="pointer-events-none absolute right-2 top-2 rounded bg-white/80 px-2 py-1 text-[10px] text-slate-600 shadow">
          source: {source}
        </div>
        <a
          href="/saboten/game"
          aria-label="サボテン叩きゲーム"
          className="absolute bottom-4 right-4 z-[1000] flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-lg transition hover:scale-110 hover:bg-emerald-50 active:scale-95"
        >
          🌵
        </a>
      </main>
    </TripProvider>
  );
}
