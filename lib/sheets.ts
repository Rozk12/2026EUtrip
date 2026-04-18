import { google } from "googleapis";
import type { TripData, Flight, Train, Hotel, TripEvent } from "@/lib/trip";

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SA_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

export function sheetsConfigured(): boolean {
  return Boolean(SHEET_ID && SA_JSON);
}

function client() {
  if (!SA_JSON) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not set");
  const creds = JSON.parse(SA_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return google.sheets({ version: "v4", auth });
}

async function readTab(tab: string): Promise<Record<string, string>[]> {
  const sheets = client();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID!,
    range: `${tab}!A1:ZZ`,
  });
  const rows = res.data.values ?? [];
  if (rows.length === 0) return [];
  const [header, ...body] = rows;
  return body
    .filter((r) => r.some((cell) => cell !== ""))
    .map((r) => {
      const obj: Record<string, string> = {};
      header.forEach((h, i) => {
        obj[h] = (r[i] ?? "").toString().trim();
      });
      return obj;
    });
}

const num = (v: string | undefined): number =>
  v === undefined || v === "" ? 0 : Number(v);

const list = (v: string | undefined): string[] =>
  v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];

const opt = (v: string | undefined): string | undefined =>
  v && v !== "" ? v : undefined;

export async function fetchTripFromSheet(): Promise<TripData> {
  const [meta, flights, trains, hotels, events, itinerary] = await Promise.all([
    readTab("trip"),
    readTab("flights"),
    readTab("trains"),
    readTab("hotels"),
    readTab("events"),
    readTab("itinerary"),
  ]);

  const metaRow = meta[0] ?? {};

  return {
    trip: {
      title: metaRow.title ?? "Europe Trip 2026",
      travelers: list(metaRow.travelers),
      period: { start: metaRow.start ?? "", end: metaRow.end ?? "" },
    },
    flights: flights.map(
      (r): Flight => ({
        id: r.id,
        type: "flight",
        traveler: r.traveler,
        airline: r.airline,
        flightNumbers: list(r.flightNumbers),
        from: {
          city: r.from_city,
          airport: opt(r.from_airport),
          lat: num(r.from_lat),
          lng: num(r.from_lng),
        },
        to: {
          city: r.to_city,
          airport: opt(r.to_airport),
          lat: num(r.to_lat),
          lng: num(r.to_lng),
        },
        departure: r.departure,
        arrival: r.arrival,
        bookingRef: opt(r.bookingRef) ?? null,
        class: opt(r.class),
        stops: list(r.stops),
        checkedBag: opt(r.checkedBag),
        duration: opt(r.duration),
        note: opt(r.note),
      }),
    ),
    trains: trains.map(
      (r): Train => ({
        id: r.id,
        type: "train",
        traveler: r.traveler,
        operator: r.operator,
        trainNumber: r.trainNumber,
        from: {
          city: r.from_city,
          station: opt(r.from_station),
          lat: num(r.from_lat),
          lng: num(r.from_lng),
        },
        to: {
          city: r.to_city,
          station: opt(r.to_station),
          lat: num(r.to_lat),
          lng: num(r.to_lng),
        },
        departure: r.departure,
        arrival: r.arrival,
        bookingRef: opt(r.bookingRef),
        seats: opt(r.seats),
        class: opt(r.class),
        cancellation: opt(r.cancellation),
        ticketNumbers: list(r.ticketNumbers),
        ticketCodes: list(r.ticketCodes),
      }),
    ),
    hotels: hotels.map(
      (r): Hotel => ({
        id: r.id,
        type: "hotel",
        name: r.name,
        city: r.city,
        address: opt(r.address),
        lat: num(r.lat),
        lng: num(r.lng),
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        nights: num(r.nights),
        bookingRef: opt(r.bookingRef) ?? null,
        rating: r.rating ? Number(r.rating) : undefined,
        beds: opt(r.beds),
        note: opt(r.note),
        price: opt(r.price),
        contact: opt(r.contact),
      }),
    ),
    events: events.map(
      (r): TripEvent => ({
        id: r.id,
        type: "event",
        name: r.name,
        city: r.city,
        venue: opt(r.venue),
        address: opt(r.address),
        lat: num(r.lat),
        lng: num(r.lng),
        date: r.date,
        time: r.time,
        duration: opt(r.duration),
        note: opt(r.note),
      }),
    ),
    itinerary: itinerary.map((r) => ({
      date: r.date,
      city: r.city,
      events: list(r.events),
    })),
  };
}
