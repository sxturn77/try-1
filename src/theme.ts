export interface AppTheme {
  preset: "light" | "dark" | "custom";
  accent: string;
  accentHover: string;
  accentLight: string;
  bg: string;
  card: string;
  border: string;
  beige: string;
  beigeDark: string;
  textMain: string;
  textDark: string;
  headerBg: string;
  inputBg: string;
}

export const THEME_PRESETS: Record<Exclude<AppTheme["preset"], "custom">, AppTheme> = {
  light: {
    preset: "light",
    accent: "#0ea5e9", // Clean sky blue / sapphire
    accentHover: "#0284c7",
    accentLight: "rgba(14, 165, 233, 0.08)",
    bg: "#f8fafc", // Cool slate bg
    card: "#ffffff",
    border: "#e2e8f0", // Clean border
    beige: "#f1f5f9", // Neutral slate 100 instead of beige
    beigeDark: "#cbd5e1", // Neutral slate 300 instead of dark beige
    textMain: "#475569", // Slate 600
    textDark: "#0f172a", // Slate 900
    headerBg: "rgba(248, 250, 252, 0.85)",
    inputBg: "#ffffff",
  },
  dark: {
    preset: "dark",
    accent: "#38bdf8", // Sky-400
    accentHover: "#0ea5e9",
    accentLight: "rgba(56, 189, 248, 0.12)",
    bg: "#0f172a", // Deep slate 900 bg
    card: "#1e293b", // Slate 800 card
    border: "rgba(255, 255, 255, 0.08)",
    beige: "#334155", // Slate 700 instead of beige
    beigeDark: "#475569", // Slate 600 instead of dark beige
    textMain: "#94a3b8", // Slate 400
    textDark: "#f8fafc", // Slate 50
    headerBg: "rgba(15, 23, 42, 0.85)",
    inputBg: "#1e293b",
  }
};

export function applyTheme(theme: AppTheme) {
  const root = document.documentElement;
  root.style.setProperty("--theme-bg", theme.bg);
  root.style.setProperty("--theme-card", theme.card);
  root.style.setProperty("--theme-border", theme.border);
  root.style.setProperty("--theme-beige", theme.beige);
  root.style.setProperty("--theme-beige-dark", theme.beigeDark);
  root.style.setProperty("--theme-text-main", theme.textMain);
  root.style.setProperty("--theme-text-dark", theme.textDark);
  root.style.setProperty("--theme-accent", theme.accent);
  root.style.setProperty("--theme-accent-hover", theme.accentHover);
  root.style.setProperty("--theme-accent-light", theme.accentLight);
  root.style.setProperty("--theme-header-bg", theme.headerBg);
  root.style.setProperty("--theme-input-bg", theme.inputBg);
}
