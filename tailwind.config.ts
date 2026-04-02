import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        altillo: {
          fondo: "#1A0A0F",
          fondo2: "#0f070b",
          accent: "#E23030",
          accent2: "#D42B2B",
          oro: "#C5A55A",
          text: "#ffffff",
          amarillo: "#FFD966",
          verde: "#7ccb5d",
          naranja: "#E6A800"
        }
      },
      fontFamily: {
        heading: ["Oswald", "Arial", "sans-serif"],
        body: ["DM Sans", "Inter", "sans-serif"]
      },
      boxShadow: {
        present: "0 0 24px rgba(226, 48, 48, 0.45), 0 0 40px rgba(197, 165, 90, 0.15)"
      }
    }
  },
  plugins: []
};

export default config;
