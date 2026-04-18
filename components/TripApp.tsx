"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { TripData } from "@/lib/trip";
import DayTicket from "@/components/DayTicket";
import { TripProvider } from "@/components/TripContext";
import { todayISO } from "@/lib/day";

const MapView = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[var(--midnight)] font-title text-xs tracking-[0.3em] text-[var(--gold)]">
      LOADING KORT…
    </div>
  ),
});

interface Props {
  initialTrip: TripData;
}

export default function TripApp({ initialTrip }: Props) {
  const [trip, setTrip] = useState<TripData>(initialTrip);
  const [source, setSource] = useState<"local" | "sheet">("local");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!mapOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMapOpen(false);
        setFocusedKey(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mapOpen]);

  // Snap to today's card on first mount (or nearest future day if before trip).
  useEffect(() => {
    const today = todayISO();
    const dates = trip.itinerary.map((d) => d.date);
    if (dates.length === 0) return;

    let target = dates.findIndex((d) => d === today);
    if (target === -1) {
      if (today < dates[0]) {
        target = 0; // trip not yet started
      } else if (today > dates[dates.length - 1]) {
        target = dates.length - 1; // trip finished, show last day
      } else {
        // mid-trip but exact date missing (gap day) — pick next future entry
        target = dates.findIndex((d) => d > today);
        if (target === -1) target = dates.length - 1;
      }
    }

    // delay to ensure layout is done
    const tm = setTimeout(() => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollTo({ left: target * el.clientWidth, behavior: "auto" });
      setCurrentIdx(target);
    }, 50);
    return () => clearTimeout(tm);
    // only run once after trip loads
  }, [trip.itinerary.length]);

  // track current card via scroll position
  const onScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const el = e.currentTarget;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== currentIdx) setCurrentIdx(idx);
  };

  const goTo = (idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  };

  const total = trip.itinerary.length;
  const currentDate = trip.itinerary[currentIdx]?.date ?? null;

  return (
    <TripProvider value={trip}>
      <main className="relative h-[100dvh] w-screen overflow-hidden bg-[var(--midnight)]">
        {/* header */}
        <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-3">
          <button
            onClick={() => setMapOpen(true)}
            className="pointer-events-auto flex items-center gap-2 border border-[rgba(212,168,75,0.5)] bg-[rgba(11,24,40,0.85)] px-3 py-1.5 font-title text-[10px] tracking-[0.35em] text-[var(--gold)] shadow backdrop-blur transition hover:bg-[rgba(212,168,75,0.1)]"
          >
            <span className="deco-diamond" style={{ width: 5, height: 5, margin: 0 }} />
            KORT
          </button>
          <div className="pointer-events-none border border-[rgba(212,168,75,0.35)] bg-[rgba(11,24,40,0.85)] px-2 py-0.5 font-title text-[9px] tracking-[0.3em] text-[var(--cream-soft)] shadow backdrop-blur">
            {source.toUpperCase()}
          </div>
        </header>

        {/* horizontal pager */}
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {trip.itinerary.map((d, i) => (
            <DayTicket
              key={d.date}
              date={d.date}
              city={d.city}
              idx={i}
              total={total}
              onFocus={(k) => {
                setFocusedKey(k);
                setMapOpen(true);
              }}
            />
          ))}
        </div>

        {/* side arrows (desktop/tablet) */}
        <button
          onClick={() => goTo(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 border border-[rgba(212,168,75,0.4)] bg-[rgba(11,24,40,0.7)] p-2 font-title text-[var(--gold)] backdrop-blur transition hover:bg-[rgba(212,168,75,0.15)] disabled:opacity-30 sm:block"
          aria-label="Previous day"
        >
          ◀
        </button>
        <button
          onClick={() => goTo(Math.min(total - 1, currentIdx + 1))}
          disabled={currentIdx === total - 1}
          className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 border border-[rgba(212,168,75,0.4)] bg-[rgba(11,24,40,0.7)] p-2 font-title text-[var(--gold)] backdrop-blur transition hover:bg-[rgba(212,168,75,0.15)] disabled:opacity-30 sm:block"
          aria-label="Next day"
        >
          ▶
        </button>

        {/* progress dots */}
        <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2">
          <div className="flex items-center gap-1.5 rounded-full border border-[rgba(212,168,75,0.35)] bg-[rgba(11,24,40,0.85)] px-3 py-1.5 shadow backdrop-blur">
            {trip.itinerary.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Day ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIdx
                    ? "w-5 bg-[var(--gold)]"
                    : "w-1.5 bg-[rgba(236,217,176,0.3)] hover:bg-[rgba(236,217,176,0.6)]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* map overlay */}
        <div
          className={`absolute inset-0 z-30 transition-transform duration-300 ${
            mapOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="relative h-full w-full bg-[var(--midnight)]">
            <MapView selectedDate={currentDate ?? "all"} focusedKey={focusedKey} />

            <div className="pointer-events-none absolute left-3 top-3 z-[2000] border border-[rgba(212,168,75,0.5)] bg-[rgba(11,24,40,0.85)] px-3 py-1.5 font-title text-[10px] tracking-[0.4em] text-[var(--gold)] shadow backdrop-blur">
              EUROPAKORT
            </div>

            {/* bottom center fat pill, thumb-reach */}
            <button
              onClick={() => {
                setMapOpen(false);
                setFocusedKey(null);
              }}
              className="absolute bottom-6 left-1/2 z-[2000] flex h-12 -translate-x-1/2 items-center gap-3 rounded-full border-2 border-[var(--gold)] bg-[rgba(11,24,40,0.95)] px-6 font-title text-[12px] tracking-[0.4em] text-[var(--gold)] shadow-2xl backdrop-blur hover:bg-[rgba(212,168,75,0.15)] active:scale-95"
            >
              <span className="text-lg leading-none">←</span>
              REJSEN
            </button>
          </div>
        </div>

        <a
          href="/saboten/game"
          aria-label="サボテン叩きゲーム"
          className="absolute bottom-5 right-4 z-[1000] flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--gold)] bg-[var(--midnight)] text-xl shadow-lg transition hover:scale-110 active:scale-95"
        >
          🌵
        </a>
      </main>
    </TripProvider>
  );
}
