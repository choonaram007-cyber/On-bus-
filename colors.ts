const PRIMARY = "#FF9F1A";
const SUCCESS = "#22C55E";
const WARNING = "#F59E0B";
const ERROR = "#EF4444";

export const DarkColors = {
  primary: PRIMARY,
  background: "#09090B",
  surface: "#0D0D10",
  surface2: "#151517",
  border: "#242429",
  text: "#FAFAFA",
  textSecondary: "#9CA3AF",
  textMuted: "#4B5563",
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  tabActive: PRIMARY,
  tabInactive: "#4B5563",
  heroGradient: ["#1A0E00", "#09090B"] as [string, string],
  searchBtnText: "#09090B",
  cardShadow: "#000",
};

export const LightColors = {
  primary: PRIMARY,
  background: "#F8F9FA",
  surface: "#FFFFFF",
  surface2: "#F1F5F9",
  border: "#E2E8F0",
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  tabActive: PRIMARY,
  tabInactive: "#94A3B8",
  heroGradient: ["#FFF7ED", "#F8F9FA"] as [string, string],
  searchBtnText: "#FFFFFF",
  cardShadow: "#94A3B8",
};

export type ThemeColors = typeof DarkColors;

export const Colors = DarkColors;

export default {
  light: {
    text: DarkColors.text,
    background: DarkColors.background,
    tint: PRIMARY,
    tabIconDefault: DarkColors.tabInactive,
    tabIconSelected: PRIMARY,
  },
};
