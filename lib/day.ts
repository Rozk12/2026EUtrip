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
