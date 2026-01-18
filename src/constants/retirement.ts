// src/constants/retirement.ts

export type ScenarioType = "pessimista" | "base" | "otimista";

export const DEFAULT_SCENARIOS: Record<
  ScenarioType,
  {
    cagr: number;
    inflation: number;
  }
> = {
  pessimista: {
    cagr: 0.08,      // 8% ao ano
    inflation: 0.04, // 4% ao ano
  },
  base: {
    cagr: 0.12,      // 12% ao ano
    inflation: 0.04,
  },
  otimista: {
    cagr: 0.20,      // 20% ao ano
    inflation: 0.04,
  },
};

export const WITHDRAW_RATE = 0.04; // Regra dos 4% (Trinity Study)
