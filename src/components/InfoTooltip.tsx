
export enum Currency {
  BRL = 'BRL',
  USD = 'USD',
  EUR = 'EUR',
}

export type Language = 'pt' | 'en' | 'es';

export interface MarketData {
  bitcoin: {
    brl: number;
    usd: number;
    eur: number;
  };
  rates: {
    usd_brl: number;
    eur_brl: number;
  };
}

export interface AnnualRow {
  year: number;
  age: number;
  phase: 'Acumulação' | 'Aposentadoria';
  totalContribution: number;
  totalYield: number;
  totalWithdrawal: number;
  endBalance: number;
  isFirstYear?: boolean;
  isSecondYear?: boolean;
  isRetirementFixedIncome?: boolean; // *4 (Year 1 of retirement)
  isRetirementInflationAdjusted?: boolean; // *3 (Year 2+ of retirement)
  isBoilingPoint?: boolean; // *5 (Withdrawal > Yield)
  isBankruptcy?: boolean; // *6 (Balance run out)
  projectedWithdrawalNeeded?: number; // For bankruptcy footer context
}

export interface ProjectionYear {
  age: number;
  year: number;
  // Wealth
  btcStrategyValue: number; 
  privatePensionValue: number; 
  traditionalValue: number; 
  btcAmount: number;
  // Income
  btcMonthlyIncome: number;
  pensionMonthlyIncome: number;
  traditionalMonthlyIncome: number; // Represents INSS or Fixed
  // Contributions (New)
  btcContribution: number;
  pensionContribution: number;
  traditionalContribution: number;
}

export interface AdvancedSettings {
  // INSS
  useDetailedINSS: boolean;
  sex: 'M' | 'F';
  startContributionYear: number;
  totalContributionTime: number; // Estimated total years
  // averageMonthlyIncome moved to root input

  // Pension
  useDetailedPension: boolean;
  pensionMode: 'vitalicio' | 'programado'; // New setting
  currentPensionContribution: number;
  currentPensionPatrimony: number;
  yearsContributingPension?: number; // Optional

  // General
  useAdvancedGeneral: boolean; // New setting
}

export interface GlobalSettings {
  withdrawalRate: number; // Default 4%
  historicalCAGR: number; // Default 156%
  inssCeiling: number; // Default 8475.55
  pensionYieldReal: number; // Default 4% (Real yield above inflation)
  inflationRate: number; // Moved here, default 4%
}

export interface CalculationInput {
  birthDate: string; // YYYY-MM-DD
  retirementAge: number;
  lifeExpectancy: number;
  retirementMode: 'vitalicio' | 'programado'; // Replaces isPerpetual
  withdrawalRate: number; // Kept for compatibility, syncs with global
  desiredMonthlyIncome: number; 
  currentSavings: number; 
  monthlyContribution: number; 
  averageMonthlyIncome: number; // Moved from AdvancedSettings
  btcAllocation: number; // Hidden, default 100
  btcAppreciationRate: number; 
  fiatInterestRate: number; // Hidden
  inflationRate: number; // Syncs with global
  
  // New Complex Settings
  advanced: AdvancedSettings;
  global: GlobalSettings;
}

export interface SimulationResult {
  currentAge: number;
  retirementYear: number;
  endYear: number | '∞';
  finalWealth: number; 
  finalWealthBTC: number; 
  monthlyPassiveIncome: number;
  // Gap Analysis Fields
  wealthNeededToday: number;
  wealthNeededTodayBTC: number; // New
  adjustedDesiredIncome: number; // New (FV of desired income)
  incomeGap: number;
  suggestedMonthlyContribution: number;
  // Existing
  contributionTime: number; 
  enjoymentTime: number | 'Perpetual'; 
  dataPoints: ProjectionYear[];
  annualTable: AnnualRow[];
  isValid: boolean;
  validationErrors: string[];
  bankruptcyData?: {
    balance: number;
    needed: number;
  };
  projectedINSSIncome: number; // New for comparison
  legacyWealth: number; // New for Heirs
  pensionLegacyWealth: number;
  btcBankruptcyAge: number | null;
  pensionBankruptcyAge: number | null;
  pensionIncomeAtRetirement: number;
}
