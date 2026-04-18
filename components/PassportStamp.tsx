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

type LandmarkKey =
  | "plane-up"
  | "plane-down"
  | "crown"
  | "mermaid"
  | "nyhavn"
  | "violin"
  | "astroclock"
  | "train"
  | "habsburg"
  | "sachertorte"
  | "mozart"
  | "fortress"
  | "fuji";

interface StampConfig {
  city: string;
  country: string;
  color: string;
  landmark: LandmarkKey;
}

// Per-day stamps for the 2026 trip
const DATE_STAMPS: Record<string, StampConfig> = {
  "2026-04-25": {
    city: "TOKYO · OSAKA",
    country: "AFGANG",
    color: "#8e1b25",
    landmark: "plane-up",
  },
  "2026-04-26": {
    city: "KØBENHAVN",
    country: "ANKOMST · DK",
    color: "#c8102e",
    landmark: "mermaid",
  },
  "2026-04-27": {
    city: "KØBENHAVN",
    country: "DANMARK",
    color: "#c8102e",
    landmark: "nyhavn",
  },
  "2026-04-28": {
    city: "PRAHA",
    country: "VIVALDI · CZ",
    color: "#1f4a8f",
    landmark: "violin",
  },
  "2026-04-29": {
    city: "PRAHA",
    country: "ČESKO",
    color: "#1f4a8f",
    landmark: "astroclock",
  },
  "2026-04-30": {
    city: "PRAHA → WIEN",
    country: "REGIOJET",
    color: "#4a3a7a",
    landmark: "train",
  },
  "2026-05-01": {
    city: "WIEN",
    country: "K.u.K. · MUSIKVEREIN",
    color: "#7a1d1d",
    landmark: "habsburg",
  },
  "2026-05-02": {
    city: "WIEN → SALZBURG",
    country: "WESTBAHN",
    color: "#8f3220",
    landmark: "sachertorte",
  },
  "2026-05-03": {
    city: "SALZBURG",
    country: "MOZART · AT",
    color: "#2f6b3a",
    landmark: "mozart",
  },
  "2026-05-04": {
    city: "SALZBURG",
    country: "HJEMREJSE",
    color: "#2f6b3a",
    landmark: "plane-down",
  },
  "2026-05-05": {
    city: "TOKYO",
    country: "HJEMME · JP",
    color: "#8e1b25",
    landmark: "fuji",
  },
};

function stampForDate(date: string, fallbackCity: string): StampConfig {
  const hit = DATE_STAMPS[date];
  if (hit) return hit;
  // fallback: use the city
  const k = fallbackCity.toLowerCase();
  if (k.includes("copenhagen") || k.includes("københavn"))
    return { city: "KØBENHAVN", country: "DANMARK", color: "#c8102e", landmark: "crown" };
  if (k.includes("prague") || k.includes("prag"))
    return { city: "PRAHA", country: "ČESKO", color: "#1f4a8f", landmark: "astroclock" };
  if (k.includes("vienna") || k.includes("wien"))
    return { city: "WIEN", country: "ÖSTERREICH", color: "#b4412a", landmark: "sachertorte" };
  if (k.includes("salzburg"))
    return { city: "SALZBURG", country: "ÖSTERREICH", color: "#2f6b3a", landmark: "fortress" };
  return { city: fallbackCity.toUpperCase(), country: "", color: "#9c2a2a", landmark: "fuji" };
}

function Landmark({ kind }: { kind: LandmarkKey }) {
  switch (kind) {
    case "plane-up":
      return (
        <g stroke="currentColor" strokeWidth="1.4" fill="currentColor" strokeLinejoin="round">
          {/* airplane angled up-right */}
          <g transform="rotate(-30)">
            <path d="M-20,0 L12,-1 L20,-4 L22,-2 L18,2 L12,1 L-20,0 Z" />
            <path d="M-6,-1 L-12,-10 L-8,-10 L0,-1 Z" />
            <path d="M-6,1 L-12,10 L-8,10 L0,1 Z" />
            <path d="M10,-2 L6,-6 L9,-6 L12,-2 Z" />
          </g>
          {/* trail dots */}
          <g fill="currentColor" opacity="0.5">
            <circle cx="-22" cy="16" r="1.2" />
            <circle cx="-16" cy="12" r="1.5" />
            <circle cx="-10" cy="8" r="1.8" />
          </g>
        </g>
      );
    case "plane-down":
      return (
        <g stroke="currentColor" strokeWidth="1.4" fill="currentColor" strokeLinejoin="round">
          <g transform="rotate(25)">
            <path d="M-22,0 L10,-1 L20,-4 L22,-2 L18,2 L10,1 L-22,0 Z" />
            <path d="M-6,-1 L-12,-10 L-8,-10 L0,-1 Z" />
            <path d="M-6,1 L-12,10 L-8,10 L0,1 Z" />
            <path d="M8,-2 L4,-6 L7,-6 L10,-2 Z" />
          </g>
          {/* sun setting below */}
          <circle cx="0" cy="18" r="4" fill="currentColor" opacity="0.6" />
          <path d="M-8,18 L-22,18 M8,18 L22,18" strokeWidth="1" />
        </g>
      );
    case "crown":
      return (
        <g stroke="currentColor" strokeWidth="1.3" fill="currentColor" strokeLinejoin="round">
          <path d="M-20,8 L-20,-4 L-13,4 L-5,-14 L0,-18 L5,-14 L13,4 L20,-4 L20,8 Z" />
          <circle cx="-20" cy="-4" r="2.4" />
          <circle cx="0" cy="-18" r="2.4" />
          <circle cx="20" cy="-4" r="2.4" />
          <rect x="-22" y="8" width="44" height="3.5" />
        </g>
      );
    case "mermaid":
      // Little Mermaid silhouette on rock
      return (
        <g stroke="currentColor" strokeWidth="1.3" fill="currentColor" strokeLinejoin="round">
          {/* rock */}
          <path d="M-22,14 Q-16,8 -8,8 Q8,6 18,10 Q22,13 22,16 L-22,16 Z" />
          {/* body sitting */}
          <circle cx="0" cy="-8" r="4" />
          <path d="M-3,-5 Q-6,0 -4,5 Q-2,7 2,7 Q6,5 6,0 Q4,-5 3,-5 Z" />
          {/* arms */}
          <path d="M-4,0 Q-10,2 -8,6" strokeWidth="1.2" fill="none" />
          <path d="M4,0 Q10,2 8,6" strokeWidth="1.2" fill="none" />
          {/* tail curl */}
          <path d="M0,7 Q-6,11 -4,14 Q0,12 4,14 Q10,12 8,7" fill="currentColor" />
        </g>
      );
    case "nyhavn":
      // Row of gabled colorful houses
      return (
        <g stroke="currentColor" strokeWidth="1.2" fill="currentColor" strokeLinejoin="round">
          {/* house 1 */}
          <path d="M-22,12 L-22,-2 L-16,-8 L-10,-2 L-10,12 Z" />
          {/* house 2 */}
          <path d="M-10,12 L-10,0 L-4,-6 L2,0 L2,12 Z" fill="none" />
          {/* house 3 */}
          <path d="M2,12 L2,-4 L8,-10 L14,-4 L14,12 Z" />
          {/* house 4 */}
          <path d="M14,12 L14,2 L18,-2 L22,2 L22,12 Z" fill="none" />
          {/* windows */}
          <rect x="-19" y="2" width="2" height="3" fill="white" opacity="0" stroke="currentColor" />
          <rect x="5" y="2" width="2" height="3" fill="white" opacity="0" stroke="currentColor" />
          {/* water line */}
          <path d="M-22,14 L22,14" strokeWidth="0.8" />
        </g>
      );
    case "violin":
      return (
        <g stroke="currentColor" strokeWidth="1.3" fill="currentColor" strokeLinejoin="round">
          {/* body */}
          <path d="M-8,-18 Q-4,-22 0,-22 Q4,-22 8,-18 L6,-8 Q10,-4 10,4 Q10,14 0,14 Q-10,14 -10,4 Q-10,-4 -6,-8 Z" />
          {/* strings */}
          <path d="M-2,-20 L-2,13 M2,-20 L2,13" stroke="var(--gold,white)" strokeWidth="0.6" fill="none" opacity="0.7" />
          {/* f-hole */}
          <path d="M-6,2 Q-6,6 -4,6" strokeWidth="1" fill="none" />
          <path d="M6,2 Q6,6 4,6" strokeWidth="1" fill="none" />
          {/* bow */}
          <path d="M14,-10 L24,16" strokeWidth="1.2" fill="none" />
        </g>
      );
    case "astroclock":
      // Prague Old Town Hall tower (Orloj) — spire, crenellations, clock, arch
      return (
        <g stroke="currentColor" strokeWidth="1.1" fill="currentColor" strokeLinejoin="round">
          {/* main Gothic spire */}
          <path d="M0,-26 L-4,-14 L4,-14 Z" />
          <line x1="0" y1="-28" x2="0" y2="-26" strokeWidth="0.8" />

          {/* side pinnacles */}
          <path d="M-10,-18 L-11,-11 L-8,-11 L-9,-18 Z" />
          <path d="M10,-18 L11,-11 L8,-11 L9,-18 Z" />

          {/* top platform with crenellations */}
          <rect x="-12" y="-14" width="24" height="3" />
          <g>
            <rect x="-12" y="-16" width="2" height="2.2" />
            <rect x="-8" y="-16" width="2" height="2.2" />
            <rect x="-4" y="-16" width="2" height="2.2" />
            <rect x="0" y="-16" width="2" height="2.2" />
            <rect x="4" y="-16" width="2" height="2.2" />
            <rect x="8" y="-16" width="2" height="2.2" />
          </g>

          {/* tower body */}
          <rect x="-9" y="-11" width="18" height="26" />

          {/* decorative frame around clock */}
          <rect x="-8" y="-8" width="16" height="14" fill="#f7e8a8" stroke="currentColor" strokeWidth="0.7" />

          {/* astronomical clock face */}
          <circle cx="0" cy="-1" r="6" fill="currentColor" />
          <circle cx="0" cy="-1" r="5" fill="#f7e8a8" stroke="none" />
          <circle cx="0" cy="-1" r="3.6" fill="none" stroke="currentColor" strokeWidth="0.6" />
          {/* tick marks (12 positions) */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, i) => {
            const rad = ((a - 90) * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={4.2 * Math.cos(rad)}
                y1={-1 + 4.2 * Math.sin(rad)}
                x2={5 * Math.cos(rad)}
                y2={-1 + 5 * Math.sin(rad)}
                stroke="currentColor"
                strokeWidth="0.7"
              />
            );
          })}
          {/* clock hands */}
          <line x1="0" y1="-1" x2="0" y2="-4.3" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="-1" x2="3" y2="0.3" stroke="currentColor" strokeWidth="1" />
          <circle cx="0" cy="-1" r="0.7" />

          {/* small round window above clock */}
          <circle cx="0" cy="-10.5" r="0.9" fill="#f7e8a8" stroke="none" />

          {/* ground arch door */}
          <path d="M-4,15 L-4,10 Q0,7 4,10 L4,15 Z" fill="#f7e8a8" stroke="currentColor" strokeWidth="0.8" />
        </g>
      );
    case "train":
      // Streamlined steam locomotive, art-deco feel, with steam plume and speed lines
      return (
        <g stroke="currentColor" strokeWidth="1.1" fill="currentColor" strokeLinejoin="round" strokeLinecap="round">
          {/* steam plume drifting back (train heads left) */}
          <g fill="currentColor" opacity="0.85">
            <ellipse cx="-14" cy="-16" rx="2" ry="1.6" />
            <ellipse cx="-11" cy="-19" rx="2.6" ry="2" />
            <ellipse cx="-6" cy="-21" rx="3.2" ry="2.4" />
            <ellipse cx="0" cy="-20" rx="2.9" ry="2.2" />
            <ellipse cx="6" cy="-18" rx="2.3" ry="1.8" />
            <ellipse cx="11" cy="-17" rx="1.7" ry="1.4" />
          </g>

          {/* chimney */}
          <rect x="-19" y="-14" width="4" height="6" />
          <rect x="-20" y="-15" width="6" height="1.5" />

          {/* main streamlined body with cab */}
          <path d="M-14,-8 L-14,-12 L-4,-12 L-4,-8 L16,-8 L20,-4 L20,4 L-21,4 L-21,-2 Q-21,-8 -14,-8 Z" />

          {/* cab windows */}
          <rect x="-12" y="-10" width="3" height="2.5" fill="#f7e8a8" stroke="none" />
          <rect x="-8" y="-10" width="3" height="2.5" fill="#f7e8a8" stroke="none" />

          {/* pinstripe running line */}
          <line x1="-21" y1="-2" x2="19" y2="-2" stroke="#f7e8a8" strokeWidth="0.8" />

          {/* smokebox (round front plate) */}
          <circle cx="-17" cy="-1" r="4.2" fill="currentColor" />
          <circle cx="-17" cy="-1" r="2.6" fill="#f7e8a8" stroke="none" />
          {/* headlight in smokebox */}
          <circle cx="-17" cy="-1" r="1" fill="currentColor" stroke="none" />

          {/* row of portholes */}
          <circle cx="0" cy="-5" r="1.3" fill="#f7e8a8" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="6" cy="-5" r="1.3" fill="#f7e8a8" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="12" cy="-5" r="1.3" fill="#f7e8a8" stroke="currentColor" strokeWidth="0.6" />

          {/* driving wheels */}
          <circle cx="-10" cy="8" r="4.5" fill="currentColor" />
          <circle cx="-10" cy="8" r="2.8" fill="#f7e8a8" stroke="none" />
          <circle cx="0" cy="8" r="4.5" fill="currentColor" />
          <circle cx="0" cy="8" r="2.8" fill="#f7e8a8" stroke="none" />
          <circle cx="10" cy="8" r="4.5" fill="currentColor" />
          <circle cx="10" cy="8" r="2.8" fill="#f7e8a8" stroke="none" />

          {/* connecting rod */}
          <rect x="-11" y="7" width="22" height="1.6" fill="currentColor" />
          <circle cx="-10" cy="8" r="0.7" fill="currentColor" stroke="none" />
          <circle cx="0" cy="8" r="0.7" fill="currentColor" stroke="none" />
          <circle cx="10" cy="8" r="0.7" fill="currentColor" stroke="none" />

          {/* small pilot wheel under smokebox */}
          <circle cx="-17" cy="6" r="2.2" fill="currentColor" />

          {/* speed lines trailing to the right */}
          <g stroke="currentColor" strokeWidth="1.1" opacity="0.8" fill="none" strokeLinecap="round">
            <line x1="21" y1="-4" x2="28" y2="-4" />
            <line x1="21" y1="0" x2="30" y2="0" />
            <line x1="21" y1="3" x2="26" y2="3" />
          </g>

          {/* track */}
          <line x1="-24" y1="14" x2="24" y2="14" strokeWidth="0.9" />
        </g>
      );
    case "habsburg":
      // Habsburg double-headed imperial eagle - clearer, bolder silhouette
      return (
        <g fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeWidth="0.5">
          {/* IMPERIAL CROWN with arch + orb */}
          <g transform="translate(0,-22)">
            <rect x="-9" y="0" width="18" height="2.5" />
            <path d="M-9,0 L-6,-5 L-3,-1 L0,-7 L3,-1 L6,-5 L9,0 Z" />
            <circle cx="-6" cy="-5" r="1.2" />
            <circle cx="0" cy="-7" r="1.2" />
            <circle cx="6" cy="-5" r="1.2" />
            <path d="M-9,2.5 Q0,7 9,2.5" fill="none" strokeWidth="1.3" />
            <circle cx="0" cy="-12" r="1.6" />
            <line x1="0" y1="-13.5" x2="0" y2="-16" strokeWidth="1" />
            <line x1="-1.5" y1="-15" x2="1.5" y2="-15" strokeWidth="1" />
          </g>

          {/* LEFT HEAD — neck curves out + clear beak */}
          <path
            d="M-4,-15
               Q-10,-16 -14,-13
               L-18,-12
               L-20,-10
               L-17,-9
               L-14,-10
               Q-8,-11 -4,-10
               Z"
          />
          <polygon points="-20,-10 -23,-8 -20,-7" />
          <circle cx="-14" cy="-12" r="0.7" fill="#f7e8a8" stroke="none" />

          {/* RIGHT HEAD */}
          <path
            d="M4,-15
               Q10,-16 14,-13
               L18,-12
               L20,-10
               L17,-9
               L14,-10
               Q8,-11 4,-10
               Z"
          />
          <polygon points="20,-10 23,-8 20,-7" />
          <circle cx="14" cy="-12" r="0.7" fill="#f7e8a8" stroke="none" />

          {/* WINGS — displayed posture, scalloped feather edges */}
          <path
            d="M-4,-10
               C-12,-10 -18,-5 -21,3
               L-18,5
               L-16,2
               L-14,5
               L-12,1
               L-10,4
               L-8,0
               L-5,3
               Z"
          />
          <path
            d="M4,-10
               C12,-10 18,-5 21,3
               L18,5
               L16,2
               L14,5
               L12,1
               L10,4
               L8,0
               L5,3
               Z"
          />

          {/* BODY */}
          <path d="M-5,-10 L-6,4 L-3,10 L0,13 L3,10 L6,4 L5,-10 Z" />

          {/* TAIL feathers */}
          <path d="M-3,10 L-5,17 L-2,14 L0,17 L2,14 L5,17 L3,10 Z" />

          {/* CHEST SHIELD — Austrian red-white-red */}
          <rect x="-3" y="-5" width="6" height="8" fill="currentColor" />
          <rect x="-3" y="-2.5" width="6" height="1.6" fill="#f7e8a8" stroke="none" />
        </g>
      );
    case "sachertorte":
      return (
        <g stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
          <ellipse cx="0" cy="14" rx="22" ry="2.5" fill="currentColor" opacity="0.55" />
          <rect x="-18" y="-4" width="36" height="16" rx="1" fill="currentColor" />
          <path d="M-18,-4 Q-18,-12 0,-12 Q18,-12 18,-4 Z" fill="currentColor" />
          <path d="M-18,-1 L-18,3 Q-16,5 -14,3 L-14,-1 Z" fill="currentColor" />
          <path d="M18,-2 L18,4 Q16,6 14,4 L14,-2 Z" fill="currentColor" />
          <ellipse cx="0" cy="-14" rx="5" ry="1.6" fill="currentColor" />
          <circle cx="0" cy="-14" r="3" fill="none" stroke="currentColor" strokeWidth="0.9" />
        </g>
      );
    case "mozart":
      // Mozart profile silhouette (wig + face)
      return (
        <g stroke="currentColor" strokeWidth="1.2" fill="currentColor" strokeLinejoin="round">
          {/* wig top */}
          <path d="M-12,-18 Q-14,-10 -16,-4 Q-18,4 -14,8 Q-10,6 -6,4 L-6,-14 Q-6,-20 0,-20 Q10,-20 10,-10 Q10,0 8,8 L4,12 Q0,14 -4,14 Q-8,14 -10,12 Z" />
          {/* wig side curls */}
          <circle cx="-14" cy="0" r="3" />
          <circle cx="-10" cy="8" r="2.5" />
          <circle cx="8" cy="8" r="2.5" />
          {/* face cutout */}
          <path d="M-4,-8 Q-4,-12 0,-12 Q4,-12 4,-6 Q4,0 0,2 Q-4,0 -4,-8 Z" fill="var(--night,black)" opacity="0.15" stroke="none" />
        </g>
      );
    case "fortress":
      return (
        <g stroke="currentColor" strokeWidth="1.3" fill="currentColor" strokeLinejoin="round">
          <path d="M-20,13 Q-8,4 0,4 Q8,4 20,13 Z" />
          <rect x="-13" y="-6" width="26" height="11" />
          <rect x="-3" y="-16" width="7" height="10" />
          {[-12, -8, -4, 0, 4, 8, 12].map((x) => (
            <rect key={x} x={x - 1} y="-8" width="2" height="2.5" />
          ))}
        </g>
      );
    case "fuji":
      return (
        <g stroke="currentColor" strokeWidth="1.3" fill="currentColor" strokeLinejoin="round">
          <path d="M-20,10 L-6,-10 L-2,-6 L0,-14 L2,-6 L6,-10 L20,10 Z" />
          <path d="M-20,10 L20,10" />
          <circle cx="0" cy="16" r="4" fill="currentColor" opacity="0.7" />
        </g>
      );
  }
}

interface Props {
  city: string;
  date: string;
}

export default function PassportStamp({ city, date }: Props) {
  const info = stampForDate(date, city);
  const [y, m, d] = date.split("-");
  const dateLine = `${Number(d)} · ${MONTH_ROMAN[Number(m)]} · ${y}`;

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

        <g fill="currentColor">
          <text x="9" y="80" fontSize="11">★</text>
          <text x="131" y="80" fontSize="11">★</text>
        </g>

        <g transform="translate(75,75)">
          <Landmark kind={info.landmark} />
        </g>
      </svg>
    </div>
  );
}
