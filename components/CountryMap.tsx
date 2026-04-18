"use client";

import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Feature } from "geojson";
import dnkData from "@/data/geo/DNK.geo.json";
import czeData from "@/data/geo/CZE.geo.json";
import autData from "@/data/geo/AUT.geo.json";
import jpnData from "@/data/geo/JPN.geo.json";

type CountryCode = "jp" | "dk" | "cz" | "at";

const GEO: Record<CountryCode, FeatureCollection> = {
  jp: jpnData as unknown as FeatureCollection,
  dk: dnkData as unknown as FeatureCollection,
  cz: czeData as unknown as FeatureCollection,
  at: autData as unknown as FeatureCollection,
};

const LABEL: Record<CountryCode, string> = {
  jp: "NIPPON",
  dk: "DANMARK",
  cz: "ČESKO",
  at: "ÖSTERREICH",
};

const CITY: Record<string, { lat: number; lng: number; label: string }> = {
  tokyo: { lat: 35.6762, lng: 139.6503, label: "TOKYO" },
  osaka: { lat: 34.6937, lng: 135.5023, label: "OSAKA" },
  copenhagen: { lat: 55.6761, lng: 12.5683, label: "CPH" },
  prague: { lat: 50.0755, lng: 14.4378, label: "PRG" },
  vienna: { lat: 48.2082, lng: 16.3738, label: "WIEN" },
  salzburg: { lat: 47.8095, lng: 13.055, label: "SZG" },
};

const CITY_COUNTRY: Record<string, CountryCode> = {
  tokyo: "jp",
  osaka: "jp",
  copenhagen: "dk",
  prague: "cz",
  vienna: "at",
  salzburg: "at",
};

function cityKey(name?: string | null): string | null {
  if (!name) return null;
  const k = name.toLowerCase();
  if (k.includes("tokyo") || k.includes("東京")) return "tokyo";
  if (k.includes("osaka") || k.includes("大阪")) return "osaka";
  if (k.includes("copenhagen") || k.includes("københavn")) return "copenhagen";
  if (k.includes("prague") || k.includes("prag") || k.includes("praha")) return "prague";
  if (k.includes("vienna") || k.includes("wien")) return "vienna";
  if (k.includes("salzburg")) return "salzburg";
  return null;
}

function destinationCity(cityString: string): string {
  if (cityString.includes("→")) return cityString.split("→").pop()!.trim();
  if (cityString.includes("/")) return cityString.split("/")[0].trim();
  return cityString;
}

const W = 300;
const H = 108;
const PAD = { L: 18, R: 18, T: 22, B: 14 };

interface Props {
  cityString: string;
  fromCity?: string | null;
  toCity?: string | null;
}

export default function CountryMap({ cityString, fromCity, toCity }: Props) {
  const fromKey = cityKey(fromCity);
  const toKey = cityKey(toCity);
  const stayKey = cityKey(destinationCity(cityString));

  const endpointKeys = (fromKey && toKey ? [fromKey, toKey] : [stayKey]).filter(
    (k): k is string => !!k,
  );
  if (endpointKeys.length === 0) return null;

  const countrySet = new Set<CountryCode>();
  for (const k of endpointKeys) {
    const c = CITY_COUNTRY[k];
    if (c) countrySet.add(c);
  }
  if (countrySet.size === 0) return null;
  const countryList = Array.from(countrySet);

  // Build a combined FeatureCollection for fit-extent (countries + endpoint points)
  const features: Feature[] = [];
  for (const c of countryList) {
    features.push(...GEO[c].features);
  }
  for (const k of endpointKeys) {
    const p = CITY[k];
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      properties: {},
    });
  }
  const combined: FeatureCollection = {
    type: "FeatureCollection",
    features,
  };

  const projection = geoMercator().fitExtent(
    [
      [PAD.L, PAD.T],
      [W - PAD.R, H - PAD.B],
    ],
    combined as any,
  );
  const pathGen = geoPath(projection);

  // Project endpoint pins
  const pins = endpointKeys
    .map((k) => {
      const p = CITY[k];
      const xy = projection([p.lng, p.lat]);
      if (!xy) return null;
      return { key: k, label: p.label, x: xy[0], y: xy[1] };
    })
    .filter(<T,>(v: T | null): v is T => v !== null);

  // Decide label row
  const labelText =
    countryList.length > 1
      ? countryList.map((c) => LABEL[c]).join("  ·  ")
      : LABEL[countryList[0]];

  // Line between endpoints (if travel day)
  let line: JSX.Element | null = null;
  if (pins.length === 2) {
    const [a, b] = pins;
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    const longHop = dist > 90;
    if (longHop) {
      const mx = (a.x + b.x) / 2;
      const my = Math.min(a.y, b.y) - 18;
      line = (
        <path
          d={`M ${a.x},${a.y} Q ${mx},${my} ${b.x},${b.y}`}
          stroke="var(--gold)"
          strokeWidth="1.3"
          strokeDasharray="3 2"
          fill="none"
          strokeLinecap="round"
          opacity="0.95"
        />
      );
    } else {
      line = (
        <line
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="var(--gold)"
          strokeWidth="1.3"
          strokeDasharray="3 2"
          strokeLinecap="round"
          opacity="0.95"
        />
      );
    }
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="128"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={labelText}
    >
      <rect
        x="0"
        y="0"
        width={W}
        height={H}
        fill="var(--midnight)"
        opacity="0.55"
      />

      <text
        x="12"
        y="16"
        fontSize="8"
        fill="var(--gold)"
        fontFamily="var(--font-cinzel), serif"
        letterSpacing="1.5"
        fontWeight="600"
      >
        {labelText}
      </text>

      {countryList.map((code) => (
        <path
          key={code}
          d={pathGen(GEO[code] as any) ?? ""}
          fill="var(--gold)"
          fillOpacity="0.18"
          stroke="var(--gold)"
          strokeWidth="0.9"
          strokeOpacity="0.85"
          strokeLinejoin="round"
        />
      ))}

      {line}

      {pins.map((pin, i) => {
        // Both endpoints are "active" on a travel day; on a stay day only one.
        const active = true;
        const labelSide: "left" | "right" =
          pins.length === 2 && i === 0 && pin.x < pins[1].x ? "left" : "right";
        return (
          <g key={pin.key}>
            <circle cx={pin.x} cy={pin.y} r="7" fill="var(--gold)" opacity="0.22" />
            <circle
              cx={pin.x}
              cy={pin.y}
              r="3.2"
              fill="var(--gold)"
              stroke="var(--cream)"
              strokeWidth="0.6"
            />
            <text
              x={pin.x + (labelSide === "right" ? 6 : -6)}
              y={pin.y + 3}
              fontSize="7.5"
              fill={active ? "var(--gold)" : "var(--cream-soft)"}
              fontFamily="var(--font-cinzel), serif"
              letterSpacing="1"
              fontWeight="700"
              textAnchor={labelSide === "right" ? "start" : "end"}
            >
              {pin.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
