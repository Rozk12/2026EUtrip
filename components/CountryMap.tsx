"use client";

interface CityPin {
  x: number;
  y: number;
  label: string;
}

interface CountryDef {
  label: string;
  paths: string[];
  pins: Record<string, CityPin>;
}

const COUNTRIES: Record<"jp" | "dk" | "cz" | "at", CountryDef> = {
  jp: {
    label: "NIPPON",
    paths: [
      // Hokkaido
      "M 248,8 L 268,6 L 280,14 L 282,24 L 272,32 L 254,30 L 246,22 Z",
      // Honshu (main curved island)
      "M 262,28 L 272,32 L 258,40 L 235,46 L 210,52 L 188,58 L 168,63 L 155,60 L 170,52 L 195,44 L 220,36 L 245,30 Z",
      // Shikoku
      "M 162,66 L 180,64 L 186,70 L 178,74 L 162,71 Z",
      // Kyushu
      "M 128,66 L 145,64 L 152,74 L 143,82 L 125,80 Z",
    ],
    pins: {
      tokyo: { x: 225, y: 43, label: "TOKYO" },
    },
  },
  dk: {
    label: "DANMARK",
    paths: [
      // Jutland peninsula (main body reaching up)
      "M 102,82 L 100,62 L 94,50 L 96,35 L 104,22 L 112,16 L 120,22 L 124,36 L 120,48 L 118,58 L 122,70 L 118,82 Z",
      // Fyn (central island)
      "M 142,52 Q 148,46 156,50 Q 160,56 152,60 Q 144,60 142,56 Z",
      // Zealand (big eastern island w/ Copenhagen)
      "M 170,38 Q 182,34 196,40 Q 204,48 200,58 Q 188,64 174,60 Q 166,52 170,42 Z",
      // Bornholm hint
      "M 222,58 Q 228,56 230,62 Q 226,66 220,64 Z",
    ],
    pins: {
      copenhagen: { x: 194, y: 49, label: "CPH" },
    },
  },
  cz: {
    label: "ČESKO",
    paths: [
      // Rough CZ shape: diamond-ish, west-east oriented
      "M 60,50 Q 76,30 110,22 L 165,20 L 205,28 L 232,38 L 240,52 Q 228,64 198,70 L 150,72 Q 110,70 85,62 Z",
    ],
    pins: {
      prague: { x: 125, y: 40, label: "PRG" },
    },
  },
  at: {
    label: "ÖSTERREICH",
    paths: [
      // Austria: elongated chili-shape, narrow east, wider middle
      "M 52,50 Q 62,42 78,40 Q 105,36 135,38 Q 165,40 195,42 L 230,46 L 250,52 Q 248,58 232,60 Q 200,60 170,58 Q 140,56 110,56 Q 85,55 65,56 Z",
    ],
    pins: {
      vienna: { x: 230, y: 50, label: "WIEN" },
      salzburg: { x: 130, y: 48, label: "SZG" },
    },
  },
};

function destinationCity(cityString: string): string {
  // "Prague → Vienna" → "Vienna"
  if (cityString.includes("→")) {
    return cityString.split("→").pop()!.trim();
  }
  // "Tokyo / Osaka" → "Tokyo"
  if (cityString.includes("/")) {
    return cityString.split("/")[0].trim();
  }
  return cityString;
}

export function countryForCity(cityString: string): keyof typeof COUNTRIES | null {
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

interface Props {
  cityString: string;
}

export default function CountryMap({ cityString }: Props) {
  const code = countryForCity(cityString);
  if (!code) return null;
  const country = COUNTRIES[code];
  const activeCityKey = cityKeyFromName(cityString);

  return (
    <svg
      viewBox="0 0 300 90"
      width="100%"
      height="96"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={country.label}
    >
      <rect
        x="0"
        y="0"
        width="300"
        height="90"
        fill="var(--midnight)"
        opacity="0.55"
      />

      {/* country label */}
      <text
        x="12"
        y="18"
        fontSize="8"
        fill="var(--gold)"
        fontFamily="var(--font-cinzel), serif"
        letterSpacing="1.5"
        fontWeight="600"
      >
        {country.label}
      </text>

      {/* country silhouette */}
      {country.paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="var(--gold)"
          fillOpacity="0.14"
          stroke="var(--gold)"
          strokeWidth="0.9"
          strokeOpacity="0.75"
          strokeLinejoin="round"
        />
      ))}

      {/* city pins */}
      {Object.entries(country.pins).map(([key, p]) => {
        const active = key === activeCityKey;
        return (
          <g key={key}>
            {active && (
              <circle cx={p.x} cy={p.y} r="7" fill="var(--gold)" opacity="0.22" />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={active ? 3.2 : 2}
              fill={active ? "var(--gold)" : "var(--cream-soft)"}
              stroke={active ? "var(--cream)" : "none"}
              strokeWidth="0.6"
            />
            <text
              x={p.x + 6}
              y={p.y + 3}
              fontSize="7"
              fill={active ? "var(--gold)" : "var(--cream-soft)"}
              fontFamily="var(--font-cinzel), serif"
              letterSpacing="1"
              fontWeight={active ? 700 : 400}
              opacity={active ? 1 : 0.75}
            >
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
