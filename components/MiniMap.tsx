"use client";

interface City {
  x: number;
  y: number;
  label: string;
}

const MAP_CITIES: Record<string, City> = {
  tokyo: { x: 283, y: 58, label: "TOKYO" },
  copenhagen: { x: 72, y: 20, label: "CPH" },
  prague: { x: 108, y: 44, label: "PRG" },
  vienna: { x: 132, y: 60, label: "WIEN" },
  salzburg: { x: 110, y: 68, label: "SZG" },
};

const SEGMENTS: [string, string][] = [
  ["tokyo", "copenhagen"],
  ["copenhagen", "prague"],
  ["prague", "vienna"],
  ["vienna", "salzburg"],
  ["salzburg", "tokyo"],
];

function normalizeCity(name?: string | null): string | null {
  if (!name) return null;
  const k = name.toLowerCase();
  if (k.includes("tokyo") || k.includes("osaka") || k.includes("東京") || k.includes("大阪"))
    return "tokyo";
  if (k.includes("copenhagen") || k.includes("københavn")) return "copenhagen";
  if (k.includes("prague") || k.includes("prag")) return "prague";
  if (k.includes("vienna") || k.includes("wien")) return "vienna";
  if (k.includes("salzburg")) return "salzburg";
  return null;
}

interface Props {
  city?: string | null;
  from?: string | null;
  to?: string | null;
}

export default function MiniMap({ city, from, to }: Props) {
  const activeFrom = normalizeCity(from);
  const activeTo = normalizeCity(to);
  const activeCity = normalizeCity(city);

  const isActiveSeg = (a: string, b: string) =>
    activeFrom && activeTo &&
    ((a === activeFrom && b === activeTo) ||
      (a === activeTo && b === activeFrom));

  const isActiveCity = (k: string) =>
    k === activeCity || k === activeFrom || k === activeTo;

  return (
    <svg
      viewBox="0 0 300 90"
      width="100%"
      height="92"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="trip route"
    >
      {/* background */}
      <rect
        x="0"
        y="0"
        width="300"
        height="90"
        fill="var(--midnight)"
        opacity="0.55"
      />

      {/* region hint rectangles */}
      <rect
        x="48"
        y="8"
        width="110"
        height="78"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="0.3"
        strokeDasharray="2 3"
        opacity="0.3"
      />
      <text
        x="52"
        y="15"
        fontSize="5"
        fill="var(--gold)"
        opacity="0.5"
        fontFamily="var(--font-cinzel), serif"
        letterSpacing="0.8"
      >
        EUROPA
      </text>

      <rect
        x="258"
        y="38"
        width="36"
        height="26"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="0.3"
        strokeDasharray="2 3"
        opacity="0.3"
      />
      <text
        x="262"
        y="45"
        fontSize="5"
        fill="var(--gold)"
        opacity="0.5"
        fontFamily="var(--font-cinzel), serif"
        letterSpacing="0.8"
      >
        NIPPON
      </text>

      {/* segments */}
      {SEGMENTS.map(([a, b], i) => {
        const ca = MAP_CITIES[a];
        const cb = MAP_CITIES[b];
        const active = isActiveSeg(a, b);
        const longHop = a === "tokyo" || b === "tokyo";

        const stroke = active ? "var(--gold)" : "var(--gold)";
        const opacity = active ? 1 : 0.28;
        const strokeWidth = active ? 1.6 : 0.6;

        if (longHop) {
          const midX = (ca.x + cb.x) / 2;
          const midY = Math.min(ca.y, cb.y) - 22;
          return (
            <path
              key={i}
              d={`M ${ca.x},${ca.y} Q ${midX},${midY} ${cb.x},${cb.y}`}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={active ? "3 2" : "2 3"}
              fill="none"
              opacity={opacity}
              strokeLinecap="round"
            />
          );
        }
        return (
          <line
            key={i}
            x1={ca.x}
            y1={ca.y}
            x2={cb.x}
            y2={cb.y}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={active ? "none" : "2 3"}
            opacity={opacity}
            strokeLinecap="round"
          />
        );
      })}

      {/* city pins */}
      {Object.entries(MAP_CITIES).map(([key, c]) => {
        const active = isActiveCity(key);
        return (
          <g key={key}>
            {active && (
              <circle
                cx={c.x}
                cy={c.y}
                r="6"
                fill="var(--gold)"
                opacity="0.25"
              />
            )}
            <circle
              cx={c.x}
              cy={c.y}
              r={active ? 3 : 1.8}
              fill={active ? "var(--gold)" : "var(--cream-soft)"}
              stroke={active ? "var(--cream)" : "none"}
              strokeWidth="0.6"
            />
            <text
              x={c.x}
              y={c.y - 6}
              fontSize="6.5"
              textAnchor="middle"
              fill={active ? "var(--gold)" : "var(--cream-soft)"}
              fontFamily="var(--font-cinzel), serif"
              fontWeight={active ? 700 : 400}
              letterSpacing="0.8"
              opacity={active ? 1 : 0.7}
            >
              {c.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
