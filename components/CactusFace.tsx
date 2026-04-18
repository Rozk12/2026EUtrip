"use client";

export type Face = "sad" | "dizzy" | "silly" | "angry" | "shock" | "wink";

interface Props {
  face?: Face;
  size?: number;
  className?: string;
}

export default function CactusFace({
  face = "sad",
  size = 48,
  className,
}: Props) {
  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={(size * 120) / 100}
      className={className}
      style={{ display: "block" }}
    >
      {/* left arm */}
      <rect
        x="8"
        y="55"
        width="22"
        height="32"
        rx="10"
        fill="#4caf50"
        stroke="#2e7d32"
        strokeWidth="2"
      />
      {/* right arm */}
      <rect
        x="70"
        y="40"
        width="22"
        height="36"
        rx="10"
        fill="#4caf50"
        stroke="#2e7d32"
        strokeWidth="2"
      />
      {/* body */}
      <rect
        x="32"
        y="12"
        width="36"
        height="102"
        rx="14"
        fill="#4caf50"
        stroke="#2e7d32"
        strokeWidth="2"
      />
      {/* subtle ribs */}
      <line
        x1="44"
        y1="22"
        x2="44"
        y2="108"
        stroke="#2e7d32"
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1="56"
        y1="22"
        x2="56"
        y2="108"
        stroke="#2e7d32"
        strokeWidth="1"
        opacity="0.5"
      />
      {/* spines */}
      <g stroke="#ffeb3b" strokeWidth="1.2" strokeLinecap="round">
        <line x1="36" y1="30" x2="34" y2="28" />
        <line x1="64" y1="32" x2="66" y2="30" />
        <line x1="36" y1="80" x2="34" y2="78" />
        <line x1="64" y1="82" x2="66" y2="80" />
        <line x1="50" y1="100" x2="50" y2="97" />
      </g>

      {/* face */}
      <Face kind={face} />
    </svg>
  );
}

function Face({ kind }: { kind: Face }) {
  const eyeY = 48;
  const eyeLX = 42;
  const eyeRX = 58;

  switch (kind) {
    case "sad":
      return (
        <g>
          <Eye x={eyeLX} y={eyeY} />
          <Eye x={eyeRX} y={eyeY} />
          <path
            d="M42 66 Q50 60 58 66"
            stroke="#1b5e20"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx={eyeLX - 1} cy={eyeY + 6} r="1.8" fill="#42a5f5" />
        </g>
      );
    case "dizzy":
      return (
        <g>
          <text x={eyeLX} y={eyeY + 3} textAnchor="middle" fontSize="8" fill="#1b5e20" fontWeight="bold">×</text>
          <text x={eyeRX} y={eyeY + 3} textAnchor="middle" fontSize="8" fill="#1b5e20" fontWeight="bold">×</text>
          <path
            d="M42 64 Q46 68 50 64 T58 64"
            stroke="#1b5e20"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case "silly":
      return (
        <g>
          <Eye x={eyeLX} y={eyeY} />
          <Eye x={eyeRX} y={eyeY} />
          <path
            d="M42 64 Q50 70 58 64"
            stroke="#1b5e20"
            strokeWidth="2"
            fill="#ef5350"
            strokeLinejoin="round"
          />
          <path
            d="M50 65 Q50 72 54 70"
            stroke="#c62828"
            strokeWidth="1"
            fill="#ef5350"
          />
        </g>
      );
    case "angry":
      return (
        <g>
          <Eye x={eyeLX} y={eyeY} />
          <Eye x={eyeRX} y={eyeY} />
          <line
            x1="38"
            y1="42"
            x2="46"
            y2="45"
            stroke="#1b5e20"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="54"
            y1="45"
            x2="62"
            y2="42"
            stroke="#1b5e20"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M42 66 Q50 62 58 66"
            stroke="#1b5e20"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case "shock":
      return (
        <g>
          <Eye x={eyeLX} y={eyeY} big />
          <Eye x={eyeRX} y={eyeY} big />
          <ellipse cx="50" cy="66" rx="3" ry="4" fill="#1b5e20" />
        </g>
      );
    case "wink":
      return (
        <g>
          <path
            d={`M${eyeLX - 3} ${eyeY} Q${eyeLX} ${eyeY - 3} ${eyeLX + 3} ${eyeY}`}
            stroke="#1b5e20"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <Eye x={eyeRX} y={eyeY} />
          <path
            d="M42 64 Q50 70 58 64"
            stroke="#1b5e20"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
  }
}

function Eye({
  x,
  y,
  big = false,
}: {
  x: number;
  y: number;
  big?: boolean;
}) {
  const r = big ? 4 : 3;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="white" stroke="#1b5e20" strokeWidth="1" />
      <circle cx={x} cy={y + 0.5} r={big ? 2.2 : 1.6} fill="#1b5e20" />
    </g>
  );
}
