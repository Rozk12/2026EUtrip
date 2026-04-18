import type { TripData } from "@/lib/trip";

export interface DayRoute {
  from: string;
  to: string;
  kind: "flight" | "train";
}

export function dayRoute(trip: TripData, date: string): DayRoute | null {
  for (const f of trip.flights) {
    if (f.departure.slice(0, 10) === date) {
      return { from: f.from.city, to: f.to.city, kind: "flight" };
    }
  }
  for (const t of trip.trains) {
    if (t.departure.slice(0, 10) === date) {
      return { from: t.from.city, to: t.to.city, kind: "train" };
    }
  }
  return null;
}

const JA_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function weekday(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return JA_WEEKDAYS[d.getDay()];
}

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

export function shortDate(iso: string): { month: string; day: string } {
  const [, mm, dd] = iso.split("-");
  return { month: MONTHS[Number(mm) - 1] ?? "", day: dd ?? "" };
}

export function todayISO(): string {
  // allow ?today=YYYY-MM-DD override for previewing past/future states
  if (typeof window !== "undefined") {
    const p = new URLSearchParams(window.location.search).get("today");
    if (p && /^\d{4}-\d{2}-\d{2}$/.test(p)) return p;
  }
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function compareDate(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

// Return the next upcoming event's (time, label) for today, or null.
// Expects markers with optional ISO-ish "HH:MM" time fields.
export function nextUpcoming(
  markers: { time?: string; label: string }[],
  nowHHMM: string,
): { time: string; label: string } | null {
  const upcoming = markers
    .filter((m) => m.time && m.time > nowHHMM)
    .sort((a, b) => (a.time! < b.time! ? -1 : 1));
  return upcoming[0] ? { time: upcoming[0].time!, label: upcoming[0].label } : null;
}

export function minutesUntil(targetHHMM: string, nowHHMM: string): number {
  const [th, tm] = targetHHMM.split(":").map(Number);
  const [nh, nm] = nowHHMM.split(":").map(Number);
  return th * 60 + tm - (nh * 60 + nm);
}

export function daysBetween(aISO: string, bISO: string): number {
  const a = new Date(aISO + "T00:00:00");
  const b = new Date(bISO + "T00:00:00");
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

export function currentHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
