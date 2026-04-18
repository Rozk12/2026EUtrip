"use client";

import { useEffect, useState } from "react";
import { buildMarkersForDate, cityColor, typeIcon } from "@/lib/trip";
import { useTrip } from "@/components/TripContext";
import { toRoman } from "@/lib/roman";
import {
  currentHHMM,
  dayRoute,
  daysBetween,
  minutesUntil,
  nextUpcoming,
  shortDate,
  todayISO,
  weekday,
} from "@/lib/day";

interface Props {
  date: string;
  city: string;
  idx: number;
  total: number;
  onFocus: (key: string) => void;
}

function formatCountdown(mins: number): string {
  if (mins < 60) return `あと ${mins} 分`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `あと ${h}h` : `あと ${h}h ${m}m`;
}

export default function DayTicket({ date, city, idx, total, onFocus }: Props) {
  const trip = useTrip();
  const markers = buildMarkersForDate(trip, date);
  const route = dayRoute(trip, date);
  const { month, day } = shortDate(date);
  const color = cityColor(route ? route.to : city);
  const serial = `№ ${String(idx + 1).padStart(3, "0")} / ${String(total).padStart(3, "0")}`;

  const today = todayISO();
  const isToday = date === today;
  const isPast = date < today;
  const isFuture = date > today;
  const daysOff = daysBetween(date, today);

  const [now, setNow] = useState(() => currentHHMM());
  useEffect(() => {
    if (!isToday) return;
    const t = setInterval(() => setNow(currentHHMM()), 30000);
    return () => clearInterval(t);
  }, [isToday]);

  const upcoming = isToday ? nextUpcoming(markers, now) : null;
  const untilMin = upcoming ? minutesUntil(upcoming.time, now) : null;

  return (
    <article className="relative flex h-full w-screen shrink-0 snap-center flex-col items-center justify-start px-4 pt-14">
      {/* ticket card */}
      <div className="ticket relative flex w-full max-w-md flex-col">
        {/* top band: route */}
        <div className="flex items-end justify-between border-b border-dashed border-[rgba(212,168,75,0.35)] px-5 pt-5 pb-3">
          {route ? (
            <>
              <RouteStack label="FRA" city={route.from} />
              <div className="mb-1 flex flex-col items-center text-[var(--gold)]">
                <span className="text-[18px] leading-none">
                  {route.kind === "flight" ? "✈" : "━━"}
                </span>
              </div>
              <RouteStack label="TIL" city={route.to} align="right" />
            </>
          ) : (
            <div className="w-full text-center">
              <div className="chevron-label">OPHOLD I</div>
              <div className="mt-1 font-deco text-[22px] leading-none text-[var(--gold)]">
                {city}
              </div>
            </div>
          )}
        </div>

        {/* middle: date block */}
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-dashed border-[rgba(212,168,75,0.35)] px-5 py-5">
          <div className="flex flex-col items-start">
            <div className="chevron-label">DAG</div>
            <div className="font-deco text-[42px] leading-none text-[var(--gold)]">
              {toRoman(idx + 1)}
            </div>
          </div>
          <span className="h-12 w-[1px] bg-[rgba(212,168,75,0.35)]" />
          <div className="flex flex-col items-end">
            <div className="chevron-label">{weekday(date)}</div>
            <div className="font-deco text-[32px] leading-none text-[var(--gold)]">
              {month} {day}
            </div>
            <div className="mt-1 text-[10px] tracking-widest text-[var(--cream-soft)]">
              {date}
            </div>
          </div>
        </div>

        {/* status banner */}
        {(isToday || isFuture) && (
          <div
            className={`flex items-center justify-between border-b border-dashed border-[rgba(212,168,75,0.35)] px-5 py-2 text-[11px] ${
              isToday ? "bg-[rgba(232,197,114,0.08)]" : ""
            }`}
          >
            {isToday && (
              <>
                <span className="font-title tracking-[0.3em] text-[var(--gold)]">
                  I DAG
                </span>
                {upcoming && untilMin !== null && untilMin > 0 ? (
                  <span className="text-[var(--cream)]">
                    次 <b className="font-title text-[var(--gold)]">{upcoming.time}</b>{" "}
                    · {formatCountdown(untilMin)}
                  </span>
                ) : (
                  <span className="italic text-[var(--cream-soft)]">
                    本日の予定おわり
                  </span>
                )}
              </>
            )}
            {isFuture && (
              <>
                <span className="font-title tracking-[0.3em] text-[var(--cream-soft)]">
                  I FREMTIDEN
                </span>
                <span className="text-[var(--cream-soft)]">
                  あと <b className="font-title text-[var(--gold)]">{daysOff}</b> 日
                </span>
              </>
            )}
          </div>
        )}

        {/* events */}
        <div className="flex-1 px-2 py-2">
          {markers.length === 0 ? (
            <div className="px-4 py-6 text-center text-[12px] italic text-[var(--cream-soft)]">
              — hvile —
              <div className="mt-1 text-[10px] opacity-70">予定なし・滞在</div>
            </div>
          ) : (
            <ul>
              {markers.map((m) => {
                const passed =
                  isToday && m.time ? m.time < now : false;
                return (
                  <li key={m.key}>
                    <button
                      className={`flex w-full items-start gap-3 rounded-sm px-3 py-2.5 text-left transition hover:bg-[rgba(212,168,75,0.08)] ${
                        passed ? "opacity-50" : ""
                      }`}
                      onClick={() => onFocus(m.key)}
                    >
                      <div className="w-12 shrink-0 font-title text-[11px] tracking-wider text-[var(--cream-soft)]">
                        {m.time ?? "—"}
                      </div>
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ring-2 ring-[var(--night)]"
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
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {m.documents.map((doc, di) => (
                              <a
                                key={di}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center rounded-sm border border-[var(--gold)] px-2 py-0.5 text-[9px] font-title tracking-wider text-[var(--gold)] hover:bg-[rgba(232,197,114,0.12)]"
                              >
                                {doc.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* bottom band */}
        <div className="flex items-center justify-between border-t border-dashed border-[rgba(212,168,75,0.35)] px-5 py-3">
          <div className="font-title text-[9px] tracking-[0.35em] text-[var(--cream-soft)]">
            {serial}
          </div>
          <div className="font-deco text-[11px] tracking-widest text-[var(--gold)]">
            DEN STORE REJSE
          </div>
        </div>

        {/* color accent bar */}
        <span
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: color }}
        />

        {/* passport stamp for past days */}
        {isPast && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="passport-stamp">
              <div className="passport-stamp-inner">
                <div>✈</div>
                <div>PASSERET</div>
                <div className="text-[10px] opacity-80">{month} {day}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function RouteStack({
  label,
  city,
  align = "left",
}: {
  label: string;
  city: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`flex flex-col ${align === "right" ? "items-end" : "items-start"}`}
    >
      <div className="chevron-label">{label}</div>
      <div className="font-deco text-[20px] leading-none text-[var(--cream)]">
        {city}
      </div>
    </div>
  );
}
