"use client";

const MONTH_ROMAN = [
  "",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

interface StampInfo {
  city: string;
  country: string;
  code: string;
  color: string;
}

function stampForCity(city: string): StampInfo {
  const k = city.toLowerCase();
  if (k.includes("copenhagen") || k.includes("københavn"))
    return {
      city: "KØBENHAVN",
      country: "DANMARK",
      code: "DK",
      color: "#c8102e",
    };
  if (k.includes("prague") || k.includes("prag"))
    return {
      city: "PRAHA",
      country: "ČESKO",
      code: "CZ",
      color: "#1f4a8f",
    };
  if (k.includes("vienna") || k.includes("wien"))
    return {
      city: "WIEN",
      country: "ÖSTERREICH",
      code: "AT",
      color: "#b4412a",
    };
  if (k.includes("salzburg"))
    return {
      city: "SALZBURG",
      country: "ÖSTERREICH",
      code: "AT-S",
      color: "#2f6b3a",
    };
  if (k.includes("tokyo") || k.includes("osaka") || k.includes("東京") || k.includes("大阪"))
    return {
      city: "TOKYO/OSAKA",
      country: "NIPPON",
      code: "JP",
      color: "#8e1b25",
    };
  return {
    city: city.toUpperCase(),
    country: "",
    code: "",
    color: "#9c2a2a",
  };
}

function Landmark({ code }: { code: string }) {
  // Centered at (0,0), rough bounds -20..20
  switch (code) {
    case "DK":
      // Crown silhouette (Danish royal crown)
      return (
        <g stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
          <path
            d="M-20,8 L-20,-4 L-13,4 L-5,-14 L0,-18 L5,-14 L13,4 L20,-4 L20,8 Z"
            fill="currentColor"
          />
          <circle cx="-20" cy="-4" r="2.4" fill="currentColor" />
          <circle cx="0" cy="-18" r="2.4" fill="currentColor" />
          <circle cx="20" cy="-4" r="2.4" fill="currentColor" />
          <rect x="-22" y="8" width="44" height="3.5" fill="currentColor" />
          <path d="M-2,-22 L2,-22 L2,-18 L4,-18 L4,-16 L-4,-16 L-4,-18 L-2,-18 Z" fill="currentColor" />
        </g>
      );
    case "CZ":
      // Prague Týn Church twin Gothic spires
      return (
        <g stroke="currentColor" strokeWidth="1.3" fill="currentColor" strokeLinejoin="round">
          <path d="M-16,12 L-16,-3 L-11,-20 L-6,-3 L-6,12 Z" />
          <path d="M16,12 L16,-3 L11,-20 L6,-3 L6,12 Z" />
          <rect x="-18" y="12" width="36" height="4" />
          <rect x="-5" y="4" width="10" height="12" />
          <path d="M-11,-22 L-11,-24 M11,-22 L11,-24" strokeWidth="1" />
        </g>
      );
    case "AT":
      // Vienna Stephansdom single spire
      return (
        <g stroke="currentColor" strokeWidth="1.3" fill="currentColor" strokeLinejoin="round">
          <path d="M0,-22 L-3,-8 L-7,4 L-10,13 L10,13 L7,4 L3,-8 Z" />
          <rect x="-15" y="13" width="30" height="3.5" />
          <circle cx="0" cy="-22" r="1.2" />
          <path d="M0,-25 L0,-22" strokeWidth="1" />
        </g>
      );
    case "AT-S":
      // Salzburg Hohensalzburg fortress on hill
      return (
        <g stroke="currentColor" strokeWidth="1.3" fill="currentColor" strokeLinejoin="round">
          <path d="M-20,13 Q-8,4 0,4 Q8,4 20,13 Z" />
          <rect x="-13" y="-6" width="26" height="11" />
          <rect x="-3" y="-16" width="7" height="10" />
          {/* crenellations */}
          {[-12, -8, -4, 0, 4, 8, 12].map((x) => (
            <rect key={x} x={x - 1} y="-8" width="2" height="2.5" />
          ))}
        </g>
      );
    case "JP":
      // Mt Fuji
      return (
        <g stroke="currentColor" strokeWidth="1.3" fill="currentColor" strokeLinejoin="round">
          <path d="M-20,10 L-6,-10 L-2,-6 L0,-14 L2,-6 L6,-10 L20,10 Z" />
          <path d="M-20,10 L20,10" />
          {/* Rising sun */}
          <circle cx="0" cy="16" r="4" fill="currentColor" opacity="0.7" />
        </g>
      );
    default:
      return (
        <g fill="currentColor">
          <circle cx="0" cy="0" r="3" />
        </g>
      );
  }
}

interface Props {
  city: string;
  date: string; // "2026-04-26"
}

export default function PassportStamp({ city, date }: Props) {
  const info = stampForCity(city);
  const [y, m, d] = date.split("-");
  const romanMonth = MONTH_ROMAN[Number(m)];
  const dateLine = `${Number(d)} · ${romanMonth} · ${y}`;

  return (
    <div
      className="passport-stamp-svg"
      style={{ color: info.color }}
      aria-hidden
    >
      <svg
        viewBox="0 0 150 150"
        width="170"
        height="170"
        style={{ display: "block" }}
      >
        <defs>
          <path id="topArc" d="M 18,75 A 57,57 0 0 1 132,75" />
          <path id="botArc" d="M 22,75 A 53,53 0 0 0 128,75" />
        </defs>

        {/* outer double circle */}
        <circle
          cx="75"
          cy="75"
          r="68"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <circle
          cx="75"
          cy="75"
          r="60"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />

        {/* top arc: CITY · COUNTRY */}
        <text
          fontFamily="var(--font-cinzel), serif"
          fontSize="10"
          letterSpacing="2.5"
          fontWeight="700"
          fill="currentColor"
        >
          <textPath href="#topArc" startOffset="50%" textAnchor="middle">
            {info.city}
            {info.country ? ` · ${info.country}` : ""}
          </textPath>
        </text>

        {/* bottom arc: date */}
        <text
          fontFamily="var(--font-cinzel), serif"
          fontSize="9.5"
          letterSpacing="2"
          fontWeight="600"
          fill="currentColor"
        >
          <textPath href="#botArc" startOffset="50%" textAnchor="middle">
            {dateLine}
          </textPath>
        </text>

        {/* decorative stars */}
        <g fill="currentColor">
          <text x="9" y="80" fontSize="11">★</text>
          <text x="131" y="80" fontSize="11">★</text>
        </g>

        {/* center landmark */}
        <g transform="translate(75,75)">
          <Landmark code={info.code} />
        </g>
      </svg>
    </div>
  );
}
