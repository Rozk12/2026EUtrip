"use client";

import { buildMarkersForDate, cityColor, typeIcon } from "@/lib/trip";
import { useTrip } from "@/components/TripContext";

interface Props {
  selectedDate: string | "all";
  onSelectDate: (d: string | "all") => void;
  onFocus: (key: string) => void;
}

const weekday = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][d.getDay()];
};

const shortDate = (iso: string) => {
  // "2026-04-28" -> "APR 28"
  const MONTHS = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const [, mm, dd] = iso.split("-");
  return `${MONTHS[Number(mm) - 1]} ${dd}`;
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
    <div className="flex h-full flex-col bg-[var(--midnight)]">
      <header className="px-5 pb-5 pt-6">
        <div className="deco-ornament">
          <span className="chevron-label">MMXXVI</span>
        </div>
        <h1 className="mt-3 text-center font-deco text-[34px] font-normal leading-none text-[var(--gold)] sm:text-[42px]">
          Le Grand Tour
        </h1>
        <div className="mt-2 text-center font-title text-[10px] tracking-[0.45em] text-[var(--cream-soft)]">
          COPENHAGEN &nbsp;·&nbsp; PRAGUE &nbsp;·&nbsp; VIENNA &nbsp;·&nbsp;
          SALZBURG
        </div>
        <div className="deco-ornament mt-3">
          <span className="chevron-label">
            {trip.trip.period.start} &nbsp;◆&nbsp; {trip.trip.period.end}
          </span>
        </div>
        <div className="mt-2 text-center font-body text-[11px] italic tracking-wider text-[var(--cream-soft)]">
          {trip.trip.travelers.join(" & ")}
        </div>
      </header>

      <div className="overflow-x-auto border-y border-[rgba(212,168,75,0.25)] bg-[var(--night)]">
        <div className="flex gap-1 px-3 py-2.5">
          <button
            className="gold-border-btn rounded-sm px-3 py-1.5 text-[10px] font-title whitespace-nowrap"
            data-active={selectedDate === "all"}
            onClick={() => onSelectDate("all")}
          >
            TOUT
          </button>
          {trip.itinerary.map((d) => {
            const active = selectedDate === d.date;
            return (
              <button
                key={d.date}
                className="gold-border-btn rounded-sm px-3 py-1.5 text-[10px] font-title whitespace-nowrap"
                data-active={active}
                onClick={() => onSelectDate(d.date)}
                title={d.city}
              >
                {shortDate(d.date)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ol>
          {days.map((d) => {
            const markers = buildMarkersForDate(trip, d.date);
            const color = cityColor(d.city);
            return (
              <li
                key={d.date}
                className="border-b border-[rgba(212,168,75,0.12)]"
              >
                <div className="flex items-center gap-4 px-5 py-3">
                  <div className="flex flex-col items-center justify-center">
                    <div className="font-deco text-[22px] leading-none text-[var(--gold)]">
                      {shortDate(d.date).split(" ")[1]}
                    </div>
                    <div className="font-title text-[9px] tracking-widest text-[var(--cream-soft)]">
                      {shortDate(d.date).split(" ")[0]} · {weekday(d.date)}
                    </div>
                  </div>
                  <div
                    className="h-8 w-[2px]"
                    style={{ background: color }}
                  />
                  <div className="flex-1">
                    <div className="font-title text-[11px] tracking-[0.3em] text-[var(--cream)]">
                      {d.city.toUpperCase()}
                    </div>
                  </div>
                </div>

                {markers.length === 0 ? (
                  <div className="px-5 pb-4 text-[11px] italic text-[var(--cream-soft)] opacity-70">
                    — repos （予定なし・滞在中）—
                  </div>
                ) : (
                  <ul className="pb-2">
                    {markers.map((m) => (
                      <li key={m.key}>
                        <button
                          className="flex w-full items-start gap-3 px-5 py-2.5 text-left transition hover:bg-[rgba(212,168,75,0.06)]"
                          onClick={() => onFocus(m.key)}
                        >
                          <div className="w-12 shrink-0 font-title text-[11px] tracking-wider text-[var(--cream-soft)]">
                            {m.time ?? "—"}
                          </div>
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ring-2 ring-[var(--midnight)]"
                            style={{
                              backgroundColor: cityColor(m.city),
                              color: "white",
                            }}
                          >
                            {typeIcon[m.itemType]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13px] font-medium text-[var(--cream)]">
                              {m.label}
                            </div>
                            {m.sub && (
                              <div className="truncate text-[11px] italic text-[var(--cream-soft)]">
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
                                    className="inline-flex items-center rounded-sm border border-[var(--gold)] px-2 py-0.5 text-[10px] font-title tracking-wider text-[var(--gold)] hover:bg-[rgba(232,197,114,0.1)]"
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
        <div className="deco-ornament px-6 py-5 text-[10px] tracking-[0.45em]">
          FIN DU VOYAGE
        </div>
      </div>
    </div>
  );
}
