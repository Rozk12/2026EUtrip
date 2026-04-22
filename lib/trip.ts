import raw from "@/data/trip.json";

export type ItemType = "flight" | "train" | "hotel" | "event";

interface Endpoint {
  city: string;
  airport?: string;
  station?: string;
  lat: number;
  lng: number;
}

export interface Flight {
  id: string;
  type: "flight";
  traveler: string;
  airline: string;
  flightNumbers: string[];
  from: Endpoint;
  to: Endpoint;
  departure: string;
  arrival: string;
  bookingRef?: string | null;
  class?: string;
  seats?: Record<string, string>;
  stops?: string[];
  checkedBag?: string;
  duration?: string;
  note?: string;
  documents?: TripDoc[];
}

export interface Train {
  id: string;
  type: "train";
  traveler: string;
  operator: string;
  trainNumber: string;
  from: Endpoint;
  to: Endpoint;
  departure: string;
  arrival: string;
  bookingRef?: string;
  seats?: string | Record<string, string>;
  class?: string;
  cancellation?: string;
  ticketNumbers?: string[];
  ticketCodes?: string[];
  documents?: TripDoc[];
}

export interface Hotel {
  id: string;
  type: "hotel";
  name: string;
  city: string;
  address?: string;
  lat: number;
  lng: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  bookingRef?: string | null;
  rating?: number;
  beds?: string;
  note?: string;
  price?: string;
  contact?: string;
  pin?: string;
  guestName?: string;
  documents?: TripDoc[];
}

export interface TripDoc {
  label: string;
  url: string;
}

export interface TripEvent {
  id: string;
  type: "event";
  name: string;
  city: string;
  venue?: string;
  address?: string;
  lat: number;
  lng: number;
  date: string;
  time: string;
  duration?: string;
  note?: string;
  documents?: TripDoc[];
}

export interface TripData {
  trip: {
    title: string;
    travelers: string[];
    period: { start: string; end: string };
  };
  flights: Flight[];
  trains: Train[];
  hotels: Hotel[];
  events: TripEvent[];
  itinerary: { date: string; city: string; events: string[] }[];
}

export const defaultTrip = raw as TripData;

export type AnyItem = Flight | Train | Hotel | TripEvent;

export function itemsById(trip: TripData): Record<string, AnyItem> {
  const out: Record<string, AnyItem> = {};
  for (const f of trip.flights) out[f.id] = f;
  for (const t of trip.trains) out[t.id] = t;
  for (const h of trip.hotels) out[h.id] = h;
  for (const e of trip.events) out[e.id] = e;
  return out;
}

export const cityColor = (name: string): string => {
  const key = name.toLowerCase();
  if (key.includes("copenhagen")) return "#1e88e5";
  if (key.includes("prague")) return "#e53935";
  if (key.includes("vienna") || key.includes("wien")) return "#8e24aa";
  if (key.includes("salzburg")) return "#43a047";
  if (key.includes("tokyo") || key.includes("osaka")) return "#607d8b";
  return "#334155";
};

export const typeIcon: Record<ItemType, string> = {
  flight: "✈️",
  train: "🚆",
  hotel: "🏨",
  event: "🎵",
};

export interface Marker {
  id: string;
  key: string;
  itemType: ItemType;
  label: string;
  sub?: string;
  time?: string;
  city: string;
  lat: number;
  lng: number;
  date: string;
  documents?: TripDoc[];
}

const time = (iso: string): string => iso.slice(11, 16);

export function buildMarkersForDate(trip: TripData, date: string): Marker[] {
  const markers: Marker[] = [];

  for (const f of trip.flights) {
    if (f.departure.slice(0, 10) === date) {
      markers.push({
        id: f.id,
        key: `${f.id}-from`,
        itemType: "flight",
        label: `${f.from.city} (${f.from.airport}) 出発`,
        sub: `${f.airline} ${f.flightNumbers.join(" / ")} · ${f.traveler}`,
        time: time(f.departure),
        city: f.from.city,
        lat: f.from.lat,
        lng: f.from.lng,
        date,
        documents: f.documents,
      });
    }
    if (f.arrival.slice(0, 10) === date) {
      markers.push({
        id: f.id,
        key: `${f.id}-to`,
        itemType: "flight",
        label: `${f.to.city} (${f.to.airport}) 到着`,
        sub: `${f.airline} ${f.flightNumbers.join(" / ")} · ${f.traveler}`,
        time: time(f.arrival),
        city: f.to.city,
        lat: f.to.lat,
        lng: f.to.lng,
        date,
        documents: f.documents,
      });
    }
  }

  for (const t of trip.trains) {
    if (t.departure.slice(0, 10) === date) {
      markers.push({
        id: t.id,
        key: `${t.id}-from`,
        itemType: "train",
        label: `${t.from.station} 出発`,
        sub: `${t.operator} ${t.trainNumber}`,
        time: time(t.departure),
        city: t.from.city,
        lat: t.from.lat,
        lng: t.from.lng,
        date,
        documents: t.documents,
      });
    }
    if (t.arrival.slice(0, 10) === date) {
      markers.push({
        id: t.id,
        key: `${t.id}-to`,
        itemType: "train",
        label: `${t.to.station} 到着`,
        sub: `${t.operator} ${t.trainNumber}`,
        time: time(t.arrival),
        city: t.to.city,
        lat: t.to.lat,
        lng: t.to.lng,
        date,
        documents: t.documents,
      });
    }
  }

  for (const h of trip.hotels) {
    if (date >= h.checkIn && date < h.checkOut) {
      const isCheckIn = date === h.checkIn;
      markers.push({
        id: h.id,
        key: `${h.id}-${date}`,
        itemType: "hotel",
        label: h.name,
        sub: `${h.city} · ${isCheckIn ? "チェックイン" : "滞在中"}`,
        time: isCheckIn ? "15:00" : undefined,
        city: h.city,
        lat: h.lat,
        lng: h.lng,
        date,
        documents: h.documents,
      });
    }
  }

  for (const e of trip.events) {
    if (e.date === date) {
      markers.push({
        id: e.id,
        key: e.id,
        itemType: "event",
        label: e.name,
        sub: e.venue,
        time: e.time,
        city: e.city,
        lat: e.lat,
        lng: e.lng,
        date,
        documents: e.documents,
      });
    }
  }

  markers.sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));
  return markers;
}

export function allMarkers(trip: TripData): Marker[] {
  return trip.itinerary.flatMap((d) => buildMarkersForDate(trip, d.date));
}
