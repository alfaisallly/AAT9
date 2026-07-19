import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        zwo: {
          orange: "#ff6a00",
          "orange-hover": "#ff8533",
          dark: "#08090c",
          panel: "#12151c",
        },
      },
      boxShadow: {
        asiair: "0 4px 24px rgba(255, 106, 0, 0.12)",
        device: "0 2px 12px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
