"use client";

import {
  buildMarkersForDate,
  cityColor,
  trip,
  typeIcon,
} from "@/lib/trip";

interface Props {
  selectedDate: string | "all";
  onSelectDate: (d: string | "all") => void;
  onFocus: (key: string) => void;
}

const weekday = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
};

export default function Itinerary({ selectedDate, onSelectDate, onFocus }: Props) {
  const days =
    selectedDate === "all"
      ? trip.itinerary
      : trip.itinerary.filter((d) => d.date === selectedDate);

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="text-lg font-bold">{trip.trip.title}</div>
        <div className="text-xs text-slate-500">
          {trip.trip.period.start} → {trip.trip.period.end} ·{" "}
          {trip.trip.travelers.join(" & ")}
        </div>
      </header>

      <div className="overflow-x-auto border-b border-slate-200 bg-white">
        <div className="flex gap-1 px-2 py-2">
          <button
            className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
              selectedDate === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            onClick={() => onSelectDate("all")}
          >
            全行程
          </button>
          {trip.itinerary.map((d) => {
            const active = selectedDate === d.date;
            const color = cityColor(d.city);
            const md = d.date.slice(5).replace("-", "/");
            return (
              <button
                key={d.date}
                className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
                  active
                    ? "text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                style={active ? { backgroundColor: color } : undefined}
                onClick={() => onSelectDate(d.date)}
                title={d.city}
              >
                {md} ({weekday(d.date)})
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ol className="divide-y divide-slate-100">
          {days.map((d) => {
            const markers = buildMarkersForDate(d.date);
            const color = cityColor(d.city);
            return (
              <li key={d.date} className="bg-white">
                <div
                  className="flex items-center gap-2 px-4 py-2"
                  style={{ borderLeft: `4px solid ${color}` }}
                >
                  <div className="text-sm font-semibold">
                    {d.date} ({weekday(d.date)})
                  </div>
                  <div className="text-xs text-slate-500">{d.city}</div>
                </div>
                {markers.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-400">
                    予定なし（滞在中）
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {markers.map((m) => (
                      <li key={m.key}>
                        <button
                          className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50"
                          onClick={() => onFocus(m.key)}
                        >
                          <div className="w-12 shrink-0 text-sm font-medium text-slate-500">
                            {m.time ?? "—"}
                          </div>
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm"
                            style={{ backgroundColor: cityColor(m.city), color: "white" }}
                          >
                            {typeIcon[m.itemType]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">
                              {m.label}
                            </div>
                            {m.sub && (
                              <div className="truncate text-xs text-slate-500">
                                {m.sub}
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
      </div>
    </div>
  );
}
