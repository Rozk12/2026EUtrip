import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          copenhagen: "#1e88e5",
          prague: "#e53935",
          vienna: "#8e24aa",
          salzburg: "#43a047",
        },
      },
    },
  },
  plugins: [],
};

export default config;
