const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      flexGrow: {
        2: "2",
      },
      fontFamily: {
        changa: ["Changa", "sans-serif"],
        zain: ["Zain", "sans-serif"],
        amsterdam: ['"New Amsterdam"', "sans-serif"],
      },
      grayscale: {
        50: "50%",
        75: "75%",
      },
      screens: {
        mdh: { raw: "(height >= 768px)" },
        xs: "460px",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Game colors
        action: {
          DEFAULT: "hsl(var(--action))",
          foreground: "hsl(var(--action-foreground))",
        },
        support: {
          DEFAULT: "hsl(var(--support))",
          foreground: "hsl(var(--support-foreground))",
        },
        energy: {
          DEFAULT: "hsl(var(--energy))",
          foreground: "hsl(var(--energy-foreground))",
        },
        reputation: {
          DEFAULT: "hsl(var(--reputation))",
          foreground: "hsl(var(--reputation-foreground))",
        },
        upgrade: {
          DEFAULT: "hsl(var(--upgrade))",
          foreground: "hsl(var(--upgrade-foreground))",
        },
        "image-foil": "hsl(var(--foil))",
        money: {
          DEFAULT: "hsl(var(--money))",
          foreground: "hsl(var(--money-foreground))",
        },
        day: {
          DEFAULT: "hsl(var(--day))",
          foreground: "hsl(var(--day-foreground))",
        },
      },
      boxShadow: {
        "glow-20": "0 0 20px var(--tw-shadow-color)",
        "glow-10": "0 0 10px var(--tw-shadow-color)",
        "glow-150": "0 0 150px var(--tw-shadow-color)",
        spotlight:
          "hsla(var(--primary) / 0.5) 50px 80px 300px, hsla(var(--primary-foreground) / 0.5) -50px -80px 300px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        appear: {
          from: { opacity: "0 !important" },
          to: { opacity: "1 !important" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "border-light": {
          "0%": { "offset-distance": 0 },
          "100%": { "offset-distance": "100%" },
        },
        "border-light-opposed": {
          "0%": { "offset-distance": "50%" },
          "50%": { "offset-distance": "100%" },
          "100%": { "offset-distance": "150%" },
        },
        "border-light-disappear": {
          "0%": { "offset-distance": "0%", width: 0, height: 0 },
          "2%": { "offset-distance": "2%", width: 0, height: 0 },
          "12%": { "offset-distance": "12%", width: "50px", height: "3px" },
          "23%": { "offset-distance": "23%", width: 0, height: 0 },
          "27%": { "offset-distance": "27%", width: 0, height: 0 },
          "37%": { "offset-distance": "37%", width: "50px", height: "3px" },
          "48%": { "offset-distance": "48%", width: 0, height: 0 },
          "52%": { "offset-distance": "52%", width: 0, height: 0 },
          "62%": { "offset-distance": "62%", width: "50px", height: "3px" },
          "73%": { "offset-distance": "73%", width: 0, height: 0 },
          "77%": { "offset-distance": "77%", width: 0, height: 0 },
          "87%": { "offset-distance": "87%", width: "50px", height: "3px" },
          "98%": { "offset-distance": "98%", width: 0, height: 0 },
          "100%": { "offset-distance": "100%", width: 0, height: 0 },
        },
        "border-light-opposed-disappear": {
          "0%": { "offset-distance": "50%", width: 0, height: 0 },
          "2%": { "offset-distance": "52%", width: 0, height: 0 },
          "12%": { "offset-distance": "62%", width: "50px", height: "3px" },
          "23%": { "offset-distance": "73%", width: 0, height: 0 },
          "27%": { "offset-distance": "77%", width: 0, height: 0 },
          "37%": { "offset-distance": "87%", width: "50px", height: "3px" },
          "48%": { "offset-distance": "98%", width: 0, height: 0 },
          "52%": { "offset-distance": "102%", width: 0, height: 0 },
          "62%": { "offset-distance": "112%", width: "50px", height: "3px" },
          "73%": { "offset-distance": "123%", width: 0, height: 0 },
          "77%": { "offset-distance": "127%", width: 0, height: 0 },
          "87%": { "offset-distance": "137%", width: "50px", height: "3px" },
          "98%": { "offset-distance": "148%", width: 0, height: 0 },
          "100%": { "offset-distance": "150%", width: 0, height: 0 },
        },
        trigger: {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
        notification: {
          "0%": {
            transform: "translateY(0) scale(0.5)",
            opacity: 0,
          },
          "50%": {
            transform: "translateY(0) scale(1)",
            opacity: 1,
          },
          "100%": {
            transform: "translateY(-200px)",
            opacity: 0,
          },
        },
        "notification-bg": {
          "0%": {
            opacity: 0,
          },
          "50%": {
            opacity: 1,
          },
          "100%": {
            opacity: 0,
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "border-light": "border-light 3s infinite linear",
        "border-light-opposed": "border-light-opposed 3s infinite linear",
        "border-light-fast": "border-light 1s infinite linear",
        "border-light-opposed-fast": "border-light-opposed 1s infinite linear",
        "border-light-disappear": "border-light-disappear 3s infinite linear",
        "border-light-opposed-disappear":
          "border-light-opposed-disappear 3s infinite linear",
        "border-light-fast-disappear":
          "border-light-disappear 1s infinite linear",
        "border-light-opposed-fast-disappear":
          "border-light-opposed-disappear 1s infinite linear",
        "spin-forward": "spin 3s linear infinite",
        appear: "appear 0.25s ease-in-out forwards 0.25s",
        trigger: "trigger 0.25s ease-in-out forwards 0.25s",
        "ping-forwards": "ping 2s cubic-bezier(0, 0, 0.2, 1) forwards",
        notification: "notification 2s forwards",
        "notification-bg": "notification-bg 2s forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
