"use client";

import { createContext, useContext } from "react";
import type { TripData } from "@/lib/trip";

const TripContext = createContext<TripData | null>(null);

export function TripProvider({
  value,
  children,
}: {
  value: TripData;
  children: React.ReactNode;
}) {
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip(): TripData {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip must be used inside TripProvider");
  return ctx;
}
