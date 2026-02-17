export type HeroPhase = "boot" | "measure" | "choose" | "selected" | "done";

export type CardChoice = "order" | "truth";

export interface CardResult {
  syncRate: string;
  label: string;
  colorClass: string;
  glowClass: string;
  bracketColor: string;
}

export const CARD_RESULTS: Record<CardChoice, CardResult> = {
  order: {
    syncRate: "87%",
    label: "보안국 적합 판정",
    colorClass: "text-secondary",
    glowClass: "glow-amber",
    bracketColor: "--color-secondary",
  },
  truth: {
    syncRate: "12%",
    label: "추방 대상",
    colorClass: "text-accent",
    glowClass: "glow-magenta",
    bracketColor: "--color-accent",
  },
};
