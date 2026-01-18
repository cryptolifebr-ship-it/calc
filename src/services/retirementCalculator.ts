// src/services/retirementCalculator.ts

import { DEFAULT_SCENARIOS, WITHDRAW_RATE, ScenarioType } from "../constants/retirement";

export interface RetirementInput {
  birthDate: string;          // formato: yyyy-mm-dd
  monthlyContribution: number;
  retirementAge: number;
  scenario: ScenarioType;
}

export interface RetirementOutput {
  currentAge: number;
  yearsContributing: number;
  totalInvested: number;
  finalPatrimony: number;
  monthlyIncome: number;
}

export function calculateRetirement(
  input: RetirementInput
): RetirementOutput {
  const birthYear = new Date(input.birthDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear;

  const yearsContributing = Math.max(
    input.retirementAge - currentAge,
    0
  );

  const months = yearsContributing * 12;

  const { cagr, inflation } = DEFAULT_SCENARIOS[input.scenario];

  // taxa real anual
  const realAnnualRate = (1 + cagr) / (1 + inflation) - 1;

  // taxa real mensal
  const realMonthlyRate = Math.pow(1 + realAnnualRate, 1 / 12) - 1;

  let patrimony = 0;

  for (let i = 0; i < months; i++) {
    patrimony = patrimony * (1 + realMonthlyRate) + input.monthlyContribution;
  }

  const annualIncome = patrimony * WITHDRAW_RATE;
  const monthlyIncome = annualIncome / 12;

  return {
    currentAge,
    yearsContributing,
    totalInvested: input.monthlyContribution * months,
    finalPatrimony: Number(patrimony.toFixed(2)),
    monthlyIncome: Number(monthlyIncome.toFixed(2)),
  };
}
