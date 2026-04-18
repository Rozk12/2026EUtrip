"use client";

import { buildMarkersForDate, cityColor, typeIcon } from "@/lib/trip";
import { useTrip } from "@/components/TripContext";
import { toRoman } from "@/lib/roman";

interface Props {
  selectedDate: string | "all";
  onSelectDate: (d: string | "all") => void;
  onFocus: (key: string) => void;
}

const weekday = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
};

export default function Itinerary({
  selectedDate,
  onSelectDate,
  onFocus,
}: Props) {
  const trip = useTrip();
  const days =
    selectedDate === "all"
      ? trip.itinerary
      : trip.itinerary.filter((d) => d.date === selectedDate);

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-[rgba(122,29,29,0.25)] px-5 pb-4 pt-5 parchment">
        <div className="text-[10px] tracking-[0.35em] text-[var(--gold)] font-title">
          ANNO DOMINI · MMXXVI
        </div>
        <h1 className="mt-1 font-blackletter text-3xl leading-tight text-[var(--burgundy)] sm:text-4xl">
          Grand Tour of Europa
        </h1>
        <div className="mt-2 flex items-center gap-2 text-xs italic text-[var(--ink-soft)]">
          <span>{trip.trip.period.start}</span>
          <span className="text-[var(--gold)]">⚜</span>
          <span>{trip.trip.period.end}</span>
        </div>
        <div className="mt-1 text-[11px] tracking-wider text-[var(--ink-soft)]">
          {trip.trip.travelers.join(" & ")}
        </div>
      </header>

      <div className="overflow-x-auto border-b border-[rgba(122,29,29,0.15)] parchment">
        <div className="flex gap-1 px-3 py-2">
          <button
            className={`rounded-full border px-3 py-1 text-[11px] whitespace-nowrap font-title tracking-widest ${
              selectedDate === "all"
                ? "border-[var(--burgundy)] bg-[var(--burgundy)] text-[#f3e7c9]"
                : "border-[rgba(122,29,29,0.3)] text-[var(--ink-soft)] hover:bg-[rgba(168,128,47,0.15)]"
            }`}
            onClick={() => onSelectDate("all")}
          >
            OMNIA
          </button>
          {trip.itinerary.map((d, i) => {
            const active = selectedDate === d.date;
            const color = cityColor(d.city);
            const roman = toRoman(i + 1);
            return (
              <button
                key={d.date}
                className={`rounded-full border px-3 py-1 text-[11px] whitespace-nowrap font-title tracking-widest ${
                  active
                    ? "text-[#f3e7c9]"
                    : "border-[rgba(122,29,29,0.3)] text-[var(--ink-soft)] hover:bg-[rgba(168,128,47,0.15)]"
                }`}
                style={
                  active
                    ? {
                        backgroundColor: color,
                        borderColor: color,
                      }
                    : undefined
                }
                onClick={() => onSelectDate(d.date)}
                title={d.city}
              >
                {roman}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[var(--parchment)]">
        <ol className="divide-y divide-[rgba(122,29,29,0.15)]">
          {days.map((d, i) => {
            const markers = buildMarkersForDate(trip, d.date);
            const color = cityColor(d.city);
            const dayIdx = trip.itinerary.findIndex(
              (x) => x.date === d.date,
            );
            return (
              <li key={d.date} className="bg-transparent">
                <div
                  className="flex items-center gap-3 px-5 py-3"
                  style={{
                    borderLeft: `4px solid ${color}`,
                    background:
                      "linear-gradient(90deg, rgba(168,128,47,0.08), transparent 60%)",
                  }}
                >
                  <div className="wax-seal">{toRoman(dayIdx + 1)}</div>
                  <div className="flex-1">
                    <div className="font-title text-[13px] tracking-widest text-[var(--ink)]">
                      DIES · {d.date}
                      <span className="mx-2 text-[var(--gold)]">·</span>
                      <span className="text-[var(--ink-soft)]">
                        {weekday(d.date)}
                      </span>
                    </div>
                    <div className="text-[12px] italic text-[var(--ink-soft)]">
                      {d.city}
                    </div>
                  </div>
                </div>
                {markers.length === 0 ? (
                  <div className="px-5 py-3 text-[11px] italic text-[var(--ink-soft)]">
                    — nulla res agitur （予定なし・滞在中）—
                  </div>
                ) : (
                  <ul className="divide-y divide-[rgba(122,29,29,0.12)]">
                    {markers.map((m) => (
                      <li key={m.key}>
                        <button
                          className="flex w-full items-start gap-3 px-5 py-3 text-left transition hover:bg-[rgba(168,128,47,0.1)]"
                          onClick={() => onFocus(m.key)}
                        >
                          <div className="w-12 shrink-0 text-sm font-title tracking-wider text-[var(--ink-soft)]">
                            {m.time ?? "—"}
                          </div>
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ring-2 ring-[var(--parchment)]"
                            style={{
                              backgroundColor: cityColor(m.city),
                              color: "white",
                            }}
                          >
                            {typeIcon[m.itemType]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13px] font-medium text-[var(--ink)]">
                              {m.label}
                            </div>
                            {m.sub && (
                              <div className="truncate text-[11px] italic text-[var(--ink-soft)]">
                                {m.sub}
                              </div>
                            )}
                            {m.documents && m.documents.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-2">
                                {m.documents.map((doc, di) => (
                                  <a
                                    key={di}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center rounded-sm border border-[var(--burgundy)] bg-[rgba(122,29,29,0.08)] px-2 py-0.5 text-[10px] font-title tracking-wider text-[var(--burgundy)] hover:bg-[rgba(122,29,29,0.15)]"
                                  >
                                    {doc.label}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
        <div className="gilded-rule py-4 text-[10px] tracking-[0.4em]">
          ⚜ FINIS ⚜
        </div>
      </div>
    </div>
  );
}
