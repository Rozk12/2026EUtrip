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

/*
 * Simplified-but-recognizable silhouettes drawn within a 300×90 viewBox.
 * Coordinates are hand-plotted from geographic references, not perfect
 * shapes but close enough to read at first glance.
 */
const COUNTRIES: Record<"jp" | "dk" | "cz" | "at", CountryDef> = {
  jp: {
    label: "NIPPON",
    paths: [
      // Hokkaido — the broad northern island
      "M 248,6 L 258,4 L 272,8 L 281,14 L 283,22 L 278,30 L 268,33 L 254,32 L 244,25 L 240,16 Z",
      // Honshu — long curved main island, from Tōhoku down through Kansai to Chūgoku
      "M 237,28 L 244,33 L 252,36 L 261,40 L 264,47 L 258,52 L 245,55 L 226,56 L 203,57 L 178,59 L 158,60 L 152,57 L 148,54 L 162,52 L 183,50 L 207,48 L 228,45 L 242,41 L 236,36 L 230,32 Z",
      // Shikoku — small island south of Honshu's Kansai
      "M 178,62 L 194,61 L 207,65 L 209,70 L 198,73 L 182,71 L 174,66 Z",
      // Kyushu — south-western island
      "M 132,63 L 148,61 L 158,65 L 164,72 L 160,81 L 145,83 L 128,78 L 122,70 Z",
    ],
    pins: {
      tokyo: { x: 244, y: 44, label: "TOKYO" },
    },
  },

  dk: {
    label: "DANMARK",
    paths: [
      // Jutland (the peninsula reaching up from the German border)
      "M 118,12 L 122,18 L 126,26 L 122,32 L 124,38 L 130,42 L 128,52 L 125,58 L 128,64 L 126,72 L 123,82 L 108,82 L 104,80 L 98,72 L 94,60 L 92,48 L 92,38 L 96,30 L 102,22 L 110,16 Z",
      // Fyn (central island)
      "M 143,52 L 150,46 L 160,48 L 164,55 L 160,62 L 150,63 L 142,58 Z",
      // Zealand (large eastern island where Copenhagen sits)
      "M 170,38 L 180,32 L 196,32 L 208,38 L 212,48 L 206,58 L 196,64 L 180,62 L 170,56 L 166,46 Z",
      // Lolland + Falster (small southern islands)
      "M 178,66 L 198,65 L 206,68 L 198,73 L 178,72 Z",
      // Bornholm (distant eastern island)
      "M 230,54 L 238,53 L 240,60 L 232,62 Z",
    ],
    pins: {
      copenhagen: { x: 202, y: 48, label: "CPH" },
    },
  },

  cz: {
    label: "ČESKO",
    paths: [
      // Czech Republic (Bohemia + Moravia) — rounded rhomboid, slightly pinched in the middle
      "M 60,48 L 68,36 L 80,28 L 98,22 L 120,20 L 145,21 L 170,24 L 195,30 L 218,36 L 235,42 L 240,50 L 233,58 L 215,64 L 190,68 L 162,70 L 132,70 L 102,66 L 80,60 L 66,54 Z",
    ],
    pins: {
      prague: { x: 128, y: 42, label: "PRG" },
    },
  },

  at: {
    label: "ÖSTERREICH",
    paths: [
      // Austria — long, narrow, widest toward the east (Vienna / Burgenland)
      "M 48,50 L 58,44 L 72,40 L 92,38 L 116,38 L 140,40 L 164,42 L 188,44 L 212,46 L 232,46 L 250,48 L 256,54 L 250,58 L 238,60 L 218,62 L 198,62 L 172,60 L 146,60 L 118,62 L 92,62 L 72,60 L 56,58 Z",
      // Vorarlberg tail on the far west
      "M 48,50 L 44,54 L 46,60 L 52,60 L 56,58 Z",
    ],
    pins: {
      vienna: { x: 240, y: 52, label: "WIEN" },
      salzburg: { x: 132, y: 50, label: "SZG" },
    },
  },
};

function destinationCity(cityString: string): string {
  if (cityString.includes("→")) {
    return cityString.split("→").pop()!.trim();
  }
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
      height="110"
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
          fillOpacity="0.16"
          stroke="var(--gold)"
          strokeWidth="0.9"
          strokeOpacity="0.8"
          strokeLinejoin="round"
        />
      ))}

      {/* city pins */}
      {Object.entries(country.pins).map(([key, p]) => {
        const active = key === activeCityKey;
        return (
          <g key={key}>
            {active && (
              <circle
                cx={p.x}
                cy={p.y}
                r="7"
                fill="var(--gold)"
                opacity="0.22"
              />
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
