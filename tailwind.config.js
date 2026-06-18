/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./config/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        border: "var(--border)",
        muted: "var(--muted-surface)",
        "muted-foreground": "var(--muted)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-foreground": "var(--accent-foreground)",
        success: "var(--success)",
        warning: "var(--warning)",
        destructive: "var(--destructive)",
        hairline: "var(--border-hairline)",
        inverse: "var(--border-inverse)",
        surface: {
          paper: "var(--surface-paper)",
          "paper-elevated": "var(--surface-paper-elevated)",
          "paper-foreground": "var(--surface-paper-foreground)",
          graphite: "var(--surface-graphite)",
          "graphite-muted": "var(--surface-graphite-muted)",
          "graphite-foreground": "var(--surface-graphite-foreground)",
          admin: "var(--surface-admin)",
        },
      },
      borderRadius: {
        card: "var(--radius-card)",
        control: "var(--radius-control)",
        panel: "var(--radius-panel)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        overlay: "var(--shadow-overlay)",
      },
      // Optional: small tweaks for nicer code/pre inside prose
      typography: {
        DEFAULT: {
          css: {
            "code::before": { content: "none" },
            "code::after": { content: "none" },
            pre: {
              padding: "0.75rem",
              borderRadius: "0.5rem",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
