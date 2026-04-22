import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#0b1828"/>
  <circle cx="100" cy="100" r="96" fill="#0b1828"/>
  <circle cx="100" cy="100" r="93" fill="none" stroke="#e8c572" stroke-width="2.5"/>
  <circle cx="100" cy="100" r="86" fill="none" stroke="#e8c572" stroke-width="1" opacity="0.55"/>
  <g transform="translate(100,48)" fill="#e8c572">
    <rect x="-26" y="4" width="52" height="11" rx="1"/>
    <path d="M-26,4 L-22,-10 L-14,5 L-6,-16 L0,-10 L6,-16 L14,5 L22,-10 L26,4 Z"/>
    <circle cx="-22" cy="-10" r="3.2"/>
    <circle cx="0" cy="-16" r="3.2"/>
    <circle cx="22" cy="-10" r="3.2"/>
    <rect x="-1.4" y="-22" width="2.8" height="6"/>
    <circle cx="0" cy="-24" r="2.4"/>
    <rect x="-4" y="-27" width="8" height="1.6"/>
    <rect x="-0.8" y="-29" width="1.6" height="5"/>
  </g>
  <g fill="#e8c572">
    <path d="M72,96 Q72,78 100,76 Q128,78 128,96 L128,108 L72,108 Z"/>
    <ellipse cx="100" cy="116" rx="22" ry="26"/>
    <rect x="92" y="138" width="16" height="10"/>
  </g>
  <g fill="#0b1828">
    <circle cx="92" cy="114" r="1.4"/>
    <circle cx="108" cy="114" r="1.4"/>
    <path d="M93,128 Q100,131 107,128" stroke="#0b1828" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  </g>
  <path d="M52,178 L70,150 L92,148 L100,156 L108,148 L130,150 L148,178 L148,200 L52,200 Z" fill="#7a1d1d" stroke="#e8c572" stroke-width="1.2"/>
  <g fill="#e8c572">
    <circle cx="80" cy="164" r="1.4"/>
    <circle cx="86" cy="168" r="1.4"/>
    <circle cx="92" cy="170" r="1.4"/>
    <circle cx="100" cy="172" r="1.8"/>
    <circle cx="108" cy="170" r="1.4"/>
    <circle cx="114" cy="168" r="1.4"/>
    <circle cx="120" cy="164" r="1.4"/>
  </g>
  <text x="100" y="192" font-family="serif" font-size="9" font-weight="700" fill="#e8c572" text-anchor="middle" letter-spacing="3">F · X</text>
</svg>`;

export default function AppleIcon() {
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(SVG).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b1828",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} alt="" width={180} height={180} />
      </div>
    ),
    size,
  );
}
