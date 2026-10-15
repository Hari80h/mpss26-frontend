/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F6F4F0",
        surface: "#FFFFFF",
        soft: "#EFEEEA",
        foreground: "#181818",
        secondary: "#6B6B6B",
        border: "#DEDCD7",
        brand: {
          primary: "#B51F32",
          hover: "#9C1A2B",
          light: "#FDF2F3",
        },
        success: {
          DEFAULT: "#2F7D58",
          light: "#EBF5F0",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
        card: "0 2px 4px rgba(0, 0, 0, 0.04)",
        frame: "0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        card: "12px",
        btn: "10px",
      },
    },
  },
  plugins: [],
};
