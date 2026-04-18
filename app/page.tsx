"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Itinerary from "@/components/Itinerary";

const MapView = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-500">
      地図を読み込み中…
    </div>
  ),
});

export default function Page() {
  const [selectedDate, setSelectedDate] = useState<string | "all">("all");
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  return (
    <main className="flex h-screen w-screen flex-col md:flex-row">
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
    </main>
  );
}
