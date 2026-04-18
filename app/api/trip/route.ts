import { NextResponse } from "next/server";
import { defaultTrip } from "@/lib/trip";
import { fetchTripFromSheet, sheetsConfigured } from "@/lib/sheets";

export const revalidate = 60;

export async function GET() {
  if (!sheetsConfigured()) {
    return NextResponse.json({ source: "local", data: defaultTrip });
  }
  try {
    const data = await fetchTripFromSheet();
    return NextResponse.json({ source: "sheet", data });
  } catch (err) {
    console.error("Failed to fetch from Sheet, falling back to local", err);
    return NextResponse.json({
      source: "local",
      data: defaultTrip,
      error: (err as Error).message,
    });
  }
}
