"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import {
  allMarkers,
  buildMarkersForDate,
  cityColor,
  trip,
  typeIcon,
  type Marker as MarkerData,
} from "@/lib/trip";

function buildIcon(color: string, emoji: string) {
  return L.divIcon({
    className: "",
    html: `<div class="pin" style="background:${color}">${emoji}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function FitBounds({ markers }: { markers: MarkerData[] }) {
  const map = useMap();
  useEffect(() => {
    const points = markers.map((m) => [m.lat, m.lng] as [number, number]);
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 12);
    } else {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [markers, map]);
  return null;
}

interface Props {
  selectedDate: string | "all";
  focusedKey: string | null;
}

export default function MapView({ selectedDate, focusedKey }: Props) {
  const markers = useMemo(
    () =>
      selectedDate === "all" ? allMarkers() : buildMarkersForDate(selectedDate),
    [selectedDate],
  );

  const legs = useMemo(() => {
    const ids = new Set(markers.map((m) => m.id));
    const out: { from: [number, number]; to: [number, number]; color: string }[] = [];
    for (const f of trip.flights) {
      if (!ids.has(f.id)) continue;
      out.push({
        from: [f.from.lat, f.from.lng],
        to: [f.to.lat, f.to.lng],
        color: cityColor(f.to.city),
      });
    }
    for (const t of trip.trains) {
      if (!ids.has(t.id)) continue;
      out.push({
        from: [t.from.lat, t.from.lng],
        to: [t.to.lat, t.to.lng],
        color: cityColor(t.to.city),
      });
    }
    return out;
  }, [markers]);

  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  useEffect(() => {
    if (!focusedKey) return;
    const m = markerRefs.current[focusedKey];
    if (m) m.openPopup();
  }, [focusedKey]);

  return (
    <MapContainer
      center={[50.5, 14]}
      zoom={5}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds markers={markers} />
      {legs.map((leg, i) => (
        <Polyline
          key={i}
          positions={[leg.from, leg.to]}
          pathOptions={{
            color: leg.color,
            weight: 3,
            opacity: 0.7,
            dashArray: "6 8",
          }}
        />
      ))}
      {markers.map((m) => {
        const color = cityColor(m.city);
        return (
          <Marker
            key={m.key}
            position={[m.lat, m.lng]}
            icon={buildIcon(color, typeIcon[m.itemType])}
            ref={(ref) => {
              markerRefs.current[m.key] = ref;
            }}
          >
            <Popup>
              <div className="space-y-1">
                <div className="text-xs text-slate-500">
                  {m.date}
                  {m.time ? ` · ${m.time}` : ""}
                </div>
                <div className="font-semibold">{m.label}</div>
                {m.sub && <div className="text-xs text-slate-600">{m.sub}</div>}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
