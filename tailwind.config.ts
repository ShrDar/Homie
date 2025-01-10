import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bgPrimary': '#2D2D2D',
        'bgSecondary': '#434343',
        'fontPrimary': '#fff'
      },
    },
  },
  plugins: [],
} satisfies Config;
