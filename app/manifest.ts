import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Den Store Rejse · MMXXVI",
    short_name: "Rejse 2026",
    description: "København · Prag · Wien · Salzburg",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b1828",
    theme_color: "#0b1828",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
