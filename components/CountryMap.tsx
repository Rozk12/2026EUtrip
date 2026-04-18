"use client";

import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection } from "geojson";
import dnkData from "@/data/geo/DNK.geo.json";
import czeData from "@/data/geo/CZE.geo.json";
import autData from "@/data/geo/AUT.geo.json";
import jpnData from "@/data/geo/JPN.geo.json";

const GEO: Record<"jp" | "dk" | "cz" | "at", FeatureCollection> = {
  jp: jpnData as unknown as FeatureCollection,
  dk: dnkData as unknown as FeatureCollection,
  cz: czeData as unknown as FeatureCollection,
  at: autData as unknown as FeatureCollection,
};

const LABEL: Record<"jp" | "dk" | "cz" | "at", string> = {
  jp: "NIPPON",
  dk: "DANMARK",
  cz: "ČESKO",
  at: "ÖSTERREICH",
};

const CITY: Record<string, { lat: number; lng: number; label: string }> = {
  tokyo: { lat: 35.6762, lng: 139.6503, label: "TOKYO" },
  copenhagen: { lat: 55.6761, lng: 12.5683, label: "CPH" },
  prague: { lat: 50.0755, lng: 14.4378, label: "PRG" },
  vienna: { lat: 48.2082, lng: 16.3738, label: "WIEN" },
  salzburg: { lat: 47.8095, lng: 13.055, label: "SZG" },
};

const CITIES_IN: Record<"jp" | "dk" | "cz" | "at", string[]> = {
  jp: ["tokyo"],
  dk: ["copenhagen"],
  cz: ["prague"],
  at: ["vienna", "salzburg"],
};

function destinationCity(cityString: string): string {
  if (cityString.includes("→")) return cityString.split("→").pop()!.trim();
  if (cityString.includes("/")) return cityString.split("/")[0].trim();
  return cityString;
}

export function countryForCity(cityString: string): keyof typeof GEO | null {
  const k = destinationCity(cityString).toLowerCase();
  if (k.includes("tokyo") || k.includes("osaka") || k.includes("東京") || k.includes("大阪"))
    return "jp";
  if (k.includes("copenhagen") || k.includes("københavn")) return "dk";
  if (k.includes("prague") || k.includes("prag")) return "cz";
  if (k.includes("vienna") || k.includes("wien")) return "at";
  if (k.includes("salzburg")) return "at";
  return null;
}

function cityKeyFromName(name: string): string {
  const k = destinationCity(name).toLowerCase();
  if (k.includes("tokyo") || k.includes("osaka")) return "tokyo";
  if (k.includes("copenhagen") || k.includes("københavn")) return "copenhagen";
  if (k.includes("prague") || k.includes("prag")) return "prague";
  if (k.includes("vienna") || k.includes("wien")) return "vienna";
  if (k.includes("salzburg")) return "salzburg";
  return "";
}

const W = 300;
const H = 108;
const PAD_L = 20;
const PAD_R = 20;
const PAD_T = 22;
const PAD_B = 14;

interface Props {
  cityString: string;
}

export default function CountryMap({ cityString }: Props) {
  const code = countryForCity(cityString);
  if (!code) return null;
  const geo = GEO[code];
  const activeCityKey = cityKeyFromName(cityString);

  const projection = geoMercator().fitExtent(
    [
      [PAD_L, PAD_T],
      [W - PAD_R, H - PAD_B],
    ],
    geo as any,
  );
  const pathGen = geoPath(projection);
  const d = pathGen(geo as any) ?? "";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="128"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={LABEL[code]}
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
        {LABEL[code]}
      </text>

      <path
        d={d}
        fill="var(--gold)"
        fillOpacity="0.18"
        stroke="var(--gold)"
        strokeWidth="0.9"
        strokeOpacity="0.85"
        strokeLinejoin="round"
      />

      {CITIES_IN[code].map((key) => {
        const c = CITY[key];
        const p = projection([c.lng, c.lat]);
        if (!p) return null;
        const [x, y] = p;
        const active = key === activeCityKey;
        return (
          <g key={key}>
            {active && (
              <circle cx={x} cy={y} r="7" fill="var(--gold)" opacity="0.22" />
            )}
            <circle
              cx={x}
              cy={y}
              r={active ? 3.2 : 2}
              fill={active ? "var(--gold)" : "var(--cream-soft)"}
              stroke={active ? "var(--cream)" : "none"}
              strokeWidth="0.6"
            />
            <text
              x={x + 6}
              y={y + 3}
              fontSize="7"
              fill={active ? "var(--gold)" : "var(--cream-soft)"}
              fontFamily="var(--font-cinzel), serif"
              letterSpacing="1"
              fontWeight={active ? 700 : 400}
              opacity={active ? 1 : 0.75}
            >
              {c.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
